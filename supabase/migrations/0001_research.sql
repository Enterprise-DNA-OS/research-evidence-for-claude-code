create table studies (
 id uuid primary key default gen_random_uuid(), code text not null unique check(code ~ '^[A-Z0-9-]+$'),
 title text not null check(length(trim(title))>0), owner text not null, purpose text not null,
 review_due date not null, status text not null default 'active' check(status in ('active','closed')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table notes (
 id uuid primary key default gen_random_uuid(), study_id uuid not null references studies(id),
 source_key text not null, title text not null, body text not null, participant text not null default '',
 source_url text not null default '', collected_on date, source_modified text not null default '',
 permission text not null default 'pending' check(permission in ('pending','allowed','withdrawn')),
 permission_ref text not null default '', reviewed_on date, retention_due date,
 content_hash text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(study_id,source_key), check(permission <> 'allowed' or (length(trim(permission_ref))>0 and reviewed_on is not null and retention_due is not null))
);
create table findings (
 id uuid primary key default gen_random_uuid(), study_id uuid not null references studies(id), source_key text,
 title text not null, summary text not null, owner text not null, status text not null default 'draft' check(status in ('draft','approved')),
 approved_by text, approved_on date, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(study_id,source_key), check(status <> 'approved' or (approved_by is not null and approved_on is not null))
);
create table citations (
 id uuid primary key default gen_random_uuid(), finding_id uuid not null references findings(id), note_id uuid not null references notes(id),
 quote text not null check(length(trim(quote))>0), stance text not null check(stance in ('supports','contradicts')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(finding_id,note_id,quote,stance)
);
create table decisions (
 id uuid primary key default gen_random_uuid(), finding_id uuid not null references findings(id), title text not null,
 owner text not null, due_on date not null, status text not null default 'open' check(status in ('open','closed')),
 outcome text not null default '', closed_on date, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(status <> 'closed' or (length(trim(outcome))>0 and closed_on is not null))
);
create table activity (
 id uuid primary key default gen_random_uuid(), entity text not null, entity_id uuid not null,
 action text not null, actor text not null check(length(trim(actor))>0), detail text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table settings (
 id uuid primary key default gen_random_uuid(), name text not null unique, days integer not null check(days between 1 and 3650),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
insert into settings(name,days) values ('evidence_review_days',180);
create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
do $$ declare t text; begin foreach t in array array['studies','notes','findings','citations','decisions','activity','settings'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated_at()',t);
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 end loop; end $$;
create function validate_citation() returns trigger language plpgsql as $$ begin
 if (select study_id from notes where id=new.note_id) is distinct from (select study_id from findings where id=new.finding_id) then raise exception 'Citation must belong to the same study'; end if;
 if not exists(select 1 from notes where id=new.note_id and position(new.quote in body)>0) then raise exception 'Quote must be an exact excerpt of the note'; end if;
 return new; end $$;
create trigger citation_check before insert or update on citations for each row execute function validate_citation();
create view note_checks as select n.*,s.code as study,s.purpose,
 (n.permission='allowed' and n.reviewed_on <= current_date and n.reviewed_on >= current_date-(select days from settings where name='evidence_review_days') and n.retention_due>=current_date and (n.collected_on is null or n.collected_on<=current_date)) as usable,
 concat_ws('; ',case when n.permission<>'allowed' then 'permission '||n.permission end,
 case when n.reviewed_on is null then 'review missing' when n.reviewed_on>current_date then 'future review' when n.reviewed_on<current_date-(select days from settings where name='evidence_review_days') then 'review stale' end,
 case when n.retention_due is null then 'retention date missing' when n.retention_due<current_date then 'retention overdue' end,
 case when n.collected_on>current_date then 'future collection date' end) as issue
 from notes n join studies s on s.id=n.study_id;
create view finding_checks as select f.*,s.code as study,
 (select count(*)::int from citations c where c.finding_id=f.id) as citations,
 (select count(*)::int from citations c join note_checks n on n.id=c.note_id where c.finding_id=f.id and n.usable and position(c.quote in n.body)>0 and c.stance='supports') as usable_support,
 (select count(*)::int from citations c join note_checks n on n.id=c.note_id where c.finding_id=f.id and (not coalesce(n.usable,false) or position(c.quote in n.body)=0)) as blocked_citations,
 (select count(*)::int from citations c where c.finding_id=f.id and c.stance='contradicts') as contradictions,
 (select count(distinct nullif(n.participant,''))::int from citations c join note_checks n on n.id=c.note_id where c.finding_id=f.id and n.usable) as known_participants
 from findings f join studies s on s.id=f.study_id;
create view approved_findings as select * from finding_checks where status='approved' and usable_support>0 and blocked_citations=0;
create view decision_queue as select d.*,f.study,f.title as finding,
 (d.status='open' and d.due_on<current_date) as overdue,
 exists(select 1 from approved_findings a where a.id=d.finding_id) as evidence_current
 from decisions d join finding_checks f on f.id=d.finding_id;
create view attention_queue as
 select 'study' as kind,id,title,owner,review_due as due_on,'Study review overdue' as issue from studies where status='active' and review_due<current_date
 union all select 'note',id,title,''::text,retention_due,issue from note_checks where not coalesce(usable,false)
 union all select 'finding',id,title,owner,null::date,'Evidence incomplete or withheld' from finding_checks where usable_support=0 or blocked_citations>0
 union all select 'decision',id,title,owner,due_on,case when overdue then 'Decision follow-up overdue' else 'Decision evidence no longer current' end from decision_queue where status='open' and (overdue or not evidence_current);
