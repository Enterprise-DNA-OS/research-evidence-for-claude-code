import {readFileSync} from 'node:fs';
import path from 'node:path';
import {getDb,REPO_ROOT} from './lib/db.mjs';
export async function seed(db){ await db.exec('BEGIN'); try{await db.exec(readFileSync(path.join(REPO_ROOT,'supabase/seed.sql'),'utf8'));await db.exec('COMMIT');}catch(e){await db.exec('ROLLBACK');throw e;} }
if(process.argv[1] && path.resolve(process.argv[1])===path.join(REPO_ROOT,'scripts/seed.mjs')){const db=await getDb();try{const [{n}]=await db.query('select count(*)::int n from studies');if(n && !process.argv.includes('--demo-again'))throw Error('Database has studies. Demo reseeding requires --demo-again. Never seed business data.');await seed(db);console.log('Fictional research demo seeded');}finally{await db.close();}}
