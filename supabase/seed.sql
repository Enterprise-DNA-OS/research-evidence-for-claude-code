insert into studies(id,code,title,owner,purpose,review_due) values
 ('10000000-0000-4000-8000-000000000001','ONBOARD','First-week onboarding','Mara','Improve the first-week setup experience',current_date-4),
 ('10000000-0000-4000-8000-000000000002','REPORTS','Monthly reporting needs','Tane','Understand how operators prepare monthly reports',current_date+21)
 on conflict do nothing;
insert into notes(id,study_id,source_key,title,body,participant,source_url,collected_on,permission,permission_ref,reviewed_on,retention_due) values
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','demo-1','Setup interview A','I stopped at the import step because I could not tell which columns were required. A worked example would let me finish.','P-01','https://example.invalid/research/demo-1',current_date-14,'allowed','Fictional consent record C-01',current_date-10,current_date+180),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','demo-2','Setup interview B','The template was clear. I finished the import without help, but could not find the next step.','P-02','https://example.invalid/research/demo-2',current_date-12,'allowed','Fictional consent record C-02',current_date-10,current_date+90),
 ('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','demo-3','Historic setup interview','I need a printable checklist before I start.','P-03','',current_date-220,'allowed','Fictional consent record C-03',current_date-200,current_date-7),
 ('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000002','demo-4','Reporting interview','We reconcile the report totals against our month-end notes.','P-04','',current_date-5,'pending','',null,null),
 ('20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000002','demo-5','Withdrawn reporting interview','A former participant asked us to stop reusing their interview.','P-05','',current_date-30,'withdrawn','Fictional withdrawal W-05',current_date-1,current_date+10)
 on conflict do nothing;
insert into findings(id,study_id,title,summary,owner,status,approved_by,approved_on) values
 ('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Test an import example','Test a worked import example while keeping the existing template; two participants had different experiences.','Mara','approved','Tane',current_date-3),
 ('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','Printable setup checklist','Revisit the old checklist suggestion before relying on it.','Mara','draft',null,null),
 ('30000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002','Month-end reconciliation','Confirm permission before using the reporting interview.','Tane','draft',null,null)
 on conflict do nothing;
insert into citations(id,finding_id,note_id,quote,stance) values
 ('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','A worked example would let me finish.','supports'),
 ('40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','The template was clear.','contradicts'),
 ('40000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003','I need a printable checklist before I start.','supports')
 on conflict do nothing;
insert into decisions(id,finding_id,title,owner,due_on) values
 ('50000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','Prepare the worked example for review','Tane',current_date-2)
 on conflict do nothing;
