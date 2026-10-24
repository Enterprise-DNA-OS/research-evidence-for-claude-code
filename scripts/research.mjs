#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv} from './lib/csv.mjs';
import {table} from './lib/format.mjs';

export const reads={
 studies:'select code,title,owner,purpose,review_due,status from studies order by code',
 notes:'select id,study,title,participant,permission,reviewed_on,retention_due,coalesce(usable,false) usable,issue from note_checks order by study,title',
 findings:'select id,study,title,owner,status,citations,usable_support,blocked_citations,contradictions,known_participants from finding_checks order by study,title',
 decisions:'select id,study,title,owner,due_on,status,overdue,evidence_current,outcome from decision_queue order by due_on,title',
 coverage:'select study,title,citations,usable_support,blocked_citations,contradictions,known_participants from finding_checks order by study,title',
 retention:"select study,title,permission,retention_due,issue from note_checks where retention_due is null or retention_due<=current_date+30 or permission='withdrawn' order by retention_due nulls first,title",
 attention:'select kind,title,owner,due_on,issue from attention_queue order by due_on nulls last,kind,title',
 compliance:"select study,title,issue,'Record review required' as result from note_checks where not coalesce(usable,false) order by study,title",
 activity:'select entity,entity_id,action,actor,detail,created_at from activity order by created_at,id'
};
export const commands=[...Object.keys(reads),'help','show','search','evidence','weekly-review','add-study','review-study','add-note','add-finding','cite','review-note','approve-finding','add-decision','close-decision','log','import','export','draft-brief','draft-follow-up'];
const tables={study:'studies',note:'notes',finding:'findings',decision:'decisions'};
export function argsOf(args){const o={},pos=[];for(const a of args){if(a.startsWith('--')){const i=a.indexOf('=');const k=a.slice(2,i<0?undefined:i);if(Object.hasOwn(o,k))throw Error(`Repeated option --${k}`);o[k]=i<0?true:a.slice(i+1);}else pos.push(a);}return {o,pos};}
const text=(o,k)=>{if(typeof o[k]!=='string'||!o[k].trim())throw Error(`Required --${k}=...`);return o[k].trim();};
const date=(v,name)=>{if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error(`Invalid ${name}: use YYYY-MM-DD`);return v;};
const today=()=>new Date().toISOString().slice(0,10);
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export async function resolve(db,kind,ref){if(!tables[kind])throw Error('Type must be study, note, finding or decision');if(!ref)throw Error(`Missing ${kind} reference`);const t=tables[kind];let rows=await db.query(`select * from ${t} where id::text=$1 ${kind==='study'?'or lower(code)=lower($1)':''} or lower(title)=lower($1) order by title,id`,[ref]);if(!rows.length)rows=await db.query(`select * from ${t} where starts_with(id::text,lower($1)) or strpos(lower(title),lower($1))>0 order by title,id`,[ref]);if(rows.length!==1){const e=Error(`${kind} reference matches ${rows.length} records`);e.candidates=rows.map(r=>({id:r.id,title:r.title}));throw e;}return rows[0];}
async function audit(db,entity,id,action,actor,detail){await db.query('insert into activity(entity,entity_id,action,actor,detail) values($1,$2,$3,$4,$5)',[entity,id,action,actor,detail]);}
async function transaction(db,fn,dry=false){await db.exec('BEGIN');try{const r=await fn();await db.exec(dry?'ROLLBACK':'COMMIT');return r;}catch(e){await db.exec('ROLLBACK');throw e;}}
async function lock(db,kind,ref){const r=await resolve(db,kind,ref);return (await db.query(`select * from ${tables[kind]} where id=$1 for update`,[r.id]))[0];}
async function active(db,ref){const s=await resolve(db,'study',ref);if(s.status!=='active')throw Error('Study is closed');return s;}
async function evidence(db,id){return db.query(`select c.id,n.title as note,n.participant,c.stance,case when n.usable and position(c.quote in n.body)>0 then c.quote else '[withheld: source needs review]' end as quote,coalesce(n.usable,false) and position(c.quote in n.body)>0 as usable,n.source_url,n.issue from citations c join note_checks n on n.id=c.note_id where c.finding_id=$1 order by n.title,c.stance`,[id]);}
function privateFile(file,body){fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});fs.writeFileSync(file,body,{mode:0o600,flag:'wx'});return file;}
function outputPath(dir,o,ext){return path.join(REPO_ROOT,dir,`${new Date().toISOString().replace(/[:.]/g,'-')}-${randomUUID().slice(0,8)}.${ext}`);}

export async function run(db,args){const {o,pos}=argsOf(args);const cmd=o.help?'help':pos[0]||'help';
 const options={'review-study':['study','review-due','reason','actor'],show:['type','record','review-source'],search:['query'],evidence:['finding'],'add-study':['code','title','owner','purpose','review-due','actor'],'add-note':['study','title','body','participant','collected-on','url','actor'],'add-finding':['study','title','summary','owner','actor'],cite:['finding','note','quote','stance','actor'],'review-note':['note','permission','reviewed-on','retention-due','reference','actor'],'approve-finding':['finding','reason','actor','acknowledge-contradictions'],'add-decision':['finding','title','owner','due-on','actor'],'close-decision':['decision','outcome','actor'],log:['type','record','text','actor'],import:['study','kind','file','map','actor','dry-run'],'draft-brief':['study'],'draft-follow-up':['decision']};
 const booleans=['json','help','review-source','dry-run','acknowledge-contradictions'];
 for(const [key,value] of Object.entries(o)){if(!['json','help',...(options[cmd]||[])].includes(key))throw Error(`Unknown option --${key} for ${cmd}`);if(booleans.includes(key)&&value!==true)throw Error(`Use --${key} without a value`);if(!booleans.includes(key)&&typeof value!=='string')throw Error(`--${key} needs =value`);}
 if(pos.length>(cmd==='import'?2:1))throw Error('Unexpected positional argument; use named options');
 if(cmd==='help')return commands.map(command=>({command}));
 if(reads[cmd])return db.query(reads[cmd]);
 if(cmd==='weekly-review')return {attention:await db.query(reads.attention),coverage:await db.query(reads.coverage),decisions:await db.query(reads.decisions)};
 if(cmd==='show'){const kind=text(o,'type');const r=await resolve(db,kind,text(o,'record'));if(kind==='note'){const n=(await db.query('select * from note_checks where id=$1',[r.id]))[0];if(!n.usable&&!o['review-source'])n.body='[withheld: source needs review]';return [n];}return [r];}
 if(cmd==='search'){const q=text(o,'query');return db.query("select study,title,participant,source_url,body from note_checks where usable and (strpos(lower(body),lower($1))>0 or strpos(lower(title),lower($1))>0) order by study,title",[q]);}
 if(cmd==='evidence'){const f=await resolve(db,'finding',text(o,'finding'));return evidence(db,f.id);}
 if(cmd==='export'){
  const snapshot={format:'research-evidence-v1',exported_at:new Date().toISOString(),tables:{}};
  await transaction(db,async()=>{for(const t of ['studies','notes','findings','citations','decisions','activity','settings'])snapshot.tables[t]=await db.query(`select * from ${t} order by id`);});
  const file=privateFile(outputPath('exports',o,'json'),JSON.stringify(snapshot,null,2)+'\n');return [{file,records:Object.values(snapshot.tables).reduce((n,rs)=>n+rs.length,0),scope:'Full private backup, includes withheld source text'}];
 }
 if(cmd==='draft-brief'||cmd==='draft-follow-up'){
  let title,sections;
  if(cmd==='draft-brief'){const s=await resolve(db,'study',text(o,'study'));const ff=await db.query('select id,title,summary from approved_findings where study_id=$1 order by title',[s.id]);title=`Study brief: ${s.title}`;sections=[`Purpose: ${s.purpose}`,'Only currently usable, approved findings follow. Contradictory evidence remains visible.'];for(const f of ff){sections.push(`## ${f.title}\n\n${f.summary}\n\n${JSON.stringify(await evidence(db,f.id),null,2)}`);}if(!ff.length)sections.push('No approved findings with current evidence.');}
  else{const d=await resolve(db,'decision',text(o,'decision'));const check=(await db.query('select evidence_current from decision_queue where id=$1',[d.id]))[0];title=`Decision follow-up: ${d.title}`;sections=[`Owner: ${d.owner}\nDue: ${d.due_on}\nStatus: ${d.status}\nEvidence current: ${check.evidence_current?'yes':'no, review before relying on this decision'}\nOutcome: ${d.outcome||'not yet recorded'}`];}
  const file=privateFile(outputPath('drafts',o,'md'),`# DRAFT: ${title}\n\nInternal review only. Nothing sent.\n\n${sections.join('\n\n')}\n`);return [{file}];
 }
 if(cmd==='import'){if(pos[1]!=='dovetail')throw Error('Use import dovetail');return importDovetail(db,o);}
 if(!commands.includes(cmd))throw Error(`Unknown command ${cmd}`);
 const actor=text(o,'actor');
 return transaction(db,async()=>{
 let r,kind,detail='';
 if(cmd==='add-study'){
 const code=text(o,'code').toUpperCase();if(!/^[A-Z0-9-]+$/.test(code))throw Error('Code needs letters, digits or hyphens');
 [r]=await db.query('insert into studies(code,title,owner,purpose,review_due) values($1,$2,$3,$4,$5) returning *',[code,text(o,'title'),text(o,'owner'),text(o,'purpose'),date(text(o,'review-due'),'review-due')]);kind='study';
 }else if(cmd==='review-study'){
 const s=await lock(db,'study',text(o,'study'));const due=date(text(o,'review-due'),'review-due');if(due<today())throw Error('Next review cannot be in the past');
 [r]=await db.query('update studies set review_due=$1 where id=$2 returning *',[due,s.id]);kind='study';detail=`Review date ${s.review_due} -> ${due}; ${text(o,'reason')}`;
 }else if(cmd==='add-note'){
 const s=await active(db,text(o,'study'));const collected=date(text(o,'collected-on'),'collected-on');if(collected>today())throw Error('Collection cannot be in the future');
 [r]=await db.query('insert into notes(study_id,source_key,title,body,participant,collected_on,source_url) values($1,$2,$3,$4,$5,$6,$7) returning id,title',[s.id,`local:${randomUUID()}`,text(o,'title'),text(o,'body'),o.participant||'',collected,o.url||'']);kind='note';detail='New note held for permission and retention review';
 }else if(cmd==='add-finding'){
 const s=await active(db,text(o,'study'));[r]=await db.query('insert into findings(study_id,title,summary,owner) values($1,$2,$3,$4) returning *',[s.id,text(o,'title'),text(o,'summary'),text(o,'owner')]);kind='finding';
 }else if(cmd==='cite'){
 const f=await lock(db,'finding',text(o,'finding'));const n=await resolve(db,'note',text(o,'note'));const quote=text(o,'quote');const stance=text(o,'stance');
 if(f.status!=='draft')throw Error('Approved finding is locked; create a new finding to change its evidence');
 if(n.study_id!==f.study_id||!n.body.includes(quote))throw Error('Quote must match the source text in the same study');
 [r]=await db.query('insert into citations(finding_id,note_id,quote,stance) values($1,$2,$3,$4) returning id',[f.id,n.id,quote,stance]);kind='citation';detail=`Finding ${f.id}, note ${n.id}, ${stance}`;
 }else if(cmd==='review-note'){
 const n=await lock(db,'note',text(o,'note'));const permission=text(o,'permission');const review=date(text(o,'reviewed-on'),'reviewed-on');if(review>today())throw Error('Review cannot be in the future');
 const retention=o['retention-due']?date(o['retention-due'],'retention-due'):n.retention_due;const ref=text(o,'reference');if(permission==='allowed'&&(!retention||retention<today()))throw Error('Allowed use requires a current retention date');
 [r]=await db.query('update notes set permission=$1,permission_ref=$2,reviewed_on=$3,retention_due=$4 where id=$5 returning id,title,permission,retention_due',[permission,ref,review,retention,n.id]);
 await db.query("update findings set status='draft',approved_by=null,approved_on=null where id in(select finding_id from citations where note_id=$1)",[n.id]);kind='note';detail=`Permission ${n.permission} -> ${permission}; reference ${ref}; dependent findings returned to draft`;
 }else if(cmd==='approve-finding'){
 const f=await lock(db,'finding',text(o,'finding'));if(f.status==='approved')throw Error('Finding already approved');
 if(f.owner.trim().toLowerCase()===actor.toLowerCase())throw Error('Another reviewer must approve the finding');
 const c=(await db.query('select * from finding_checks where id=$1',[f.id]))[0];if(c.usable_support<1||c.blocked_citations>0)throw Error('Finding needs usable supporting evidence and no blocked citations');
 if(c.contradictions>0&&!o['acknowledge-contradictions'])throw Error('Review contradictory evidence and pass --acknowledge-contradictions');
 [r]=await db.query("update findings set status='approved',approved_by=$1,approved_on=current_date where id=$2 returning id,title,status",[actor,f.id]);kind='finding';detail=text(o,'reason');
 }else if(cmd==='add-decision'){
 const f=await lock(db,'finding',text(o,'finding'));if(!(await db.query('select id from approved_findings where id=$1',[f.id])).length)throw Error('Decision needs an approved finding with current evidence');
 [r]=await db.query('insert into decisions(finding_id,title,owner,due_on) values($1,$2,$3,$4) returning *',[f.id,text(o,'title'),text(o,'owner'),date(text(o,'due-on'),'due-on')]);kind='decision';
 }else if(cmd==='close-decision'){
 const d=await lock(db,'decision',text(o,'decision'));if(d.status!=='open')throw Error('Decision already closed');[r]=await db.query("update decisions set status='closed',outcome=$1,closed_on=current_date where id=$2 returning *",[text(o,'outcome'),d.id]);kind='decision';detail='Outcome recorded';
 }else if(cmd==='log'){
 kind=text(o,'type');r=await resolve(db,kind,text(o,'record'));detail=text(o,'text');
 }else throw Error(`Unsupported command ${cmd}`);
 await audit(db,kind,r.id,cmd,actor,detail||'Record created');return [r];
 });
}

export async function importDovetail(db,o){
 const file=text(o,'file');if(!/\.csv$/i.test(file))throw Error('Use readable CSV exports; encrypted .dovetailproject files are not supported');
 const kind=o.kind||'notes';if(!['notes','findings'].includes(kind))throw Error('kind must be notes or findings');
 const actor=text(o,'actor'),s=await active(db,text(o,'study'));
 const mapping=o.map?JSON.parse(fs.readFileSync(o.map,'utf8')):{title:'Title',body:'Content',source_url:'URL',source_modified:'Last modified'};
 for(const k of ['title','body','source_url'])if(typeof mapping[k]!=='string')throw Error(`Mapping needs ${k}`);
 const rows=parseCsv(fs.readFileSync(file,'utf8'));if(!rows.length)throw Error('CSV has no records');
 const keys=new Set();const parsed=rows.map((row,i)=>{
 const read=k=>{const col=mapping[k];if(!col)return '';if(!Object.hasOwn(row,col))throw Error(`CSV row ${i+2}: missing mapped header ${col}`);return row[col].trim();};
 const title=read('title'),body=read('body'),url=read('source_url'),modified=read('source_modified');
 if(!title||!body||!url)throw Error(`CSV row ${i+2}: title, content and stable source URL are required`);
 let u;try{u=new URL(url);}catch{throw Error(`CSV row ${i+2}: invalid URL`);}if(!['https:','http:'].includes(u.protocol))throw Error('Source URL must use http or https');
 if(keys.has(url))throw Error(`CSV row ${i+2}: duplicate source URL`);keys.add(url);
 return {title,body,url,modified,hash:hash({title,body,url,modified})};});
 return transaction(db,async()=>{
 const result={kind,study:s.code,rows:parsed.length,inserted:0,updated:0,unchanged:0,dry_run:!!o['dry-run'],warnings:'CSV contains text and fields, not media, formatting, permissions or reliable citation links. All imported material requires review.'};
 for(const x of parsed){
 const old=(await db.query(`select * from ${kind} where study_id=$1 and source_key=$2 for update`,[s.id,x.url]))[0];let id;
 if(kind==='notes'){
 if(old?.content_hash===x.hash){result.unchanged++;continue;}
 if(old){id=old.id;await db.query("update notes set title=$1,body=$2,source_url=$3,source_modified=$4,content_hash=$5,permission='pending',permission_ref='',reviewed_on=null where id=$6",[x.title,x.body,x.url,x.modified,x.hash,id]);await db.query("update findings set status='draft',approved_by=null,approved_on=null where id in(select finding_id from citations where note_id=$1)",[id]);result.updated++;}
 else{[{id}]=await db.query('insert into notes(study_id,source_key,title,body,source_url,source_modified,content_hash) values($1,$2,$3,$4,$5,$6,$7) returning id',[s.id,x.url,x.title,x.body,x.url,x.modified,x.hash]);result.inserted++;}
 }else{
 if(old&&old.title===x.title&&old.summary===x.body){result.unchanged++;continue;}
 if(old){id=old.id;await db.query("update findings set title=$1,summary=$2,status='draft',approved_by=null,approved_on=null where id=$3",[x.title,x.body,id]);result.updated++;}
 else{[{id}]=await db.query('insert into findings(study_id,source_key,title,summary,owner) values($1,$2,$3,$4,$5) returning id',[s.id,x.url,x.title,x.body,s.owner]);result.inserted++;}
 }
 await audit(db,kind==='notes'?'note':'finding',id,'import',actor,`Dovetail CSV ${old?'updated':'inserted'}; source ${x.url}`);
 }
 return [result];
 },!!o['dry-run']);
}
export function display(result){if(Array.isArray(result)){if(!result.length)return '(none)';return table(result,Object.keys(result[0]).map(key=>({key,label:key,width:80,format:v=>typeof v==='object'&&v!==null?JSON.stringify(v):v})));}return Object.entries(result).map(([key,value])=>`${key.toUpperCase()}\n${display(value)}`).join('\n\n');}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;const json=process.argv.includes('--json');try{db=await getDb();const result=await run(db,process.argv.slice(2));console.log(json?JSON.stringify(result,null,2):display(result));}catch(e){console.error(json?JSON.stringify({error:e.message,...(e.candidates?{candidates:e.candidates}:{})}):[e.message,e.candidates?display(e.candidates):''].filter(Boolean).join('\n'));process.exitCode=1;}finally{await db?.close();}}
