# Research Evidence for Claude Code: operating instructions

Read README.md and docs/replace-dovetail.md before using real records. This is a trusted-operator research workspace. The seed is fictional. Put the business identity in brand.json. Claude Code, Codex, OpenCode and Cursor use the same scripts.

## Evidence first

Every answer starts with the CLI. Preserve exact quotations and contradictory evidence. Do not infer permission from an import, infer participant identity, invent an interview, or represent a small sample as representative. Use pseudonyms. Unreviewed, withdrawn, stale or overdue sources are held from search, ordinary note display and approved briefs. show --review-source explicitly opens a held source for the trusted operator's review. The full private export also includes held text. Neither is a permission to disclose it.

## One route per recurring job

| Request | Recipe |
|---|---|
| studies | /studies |
| notes | /notes |
| findings | /findings |
| decisions | /decisions |
| coverage | /coverage |
| retention | /retention |
| attention | /attention |
| compliance | /compliance |
| activity | /activity |
| help | /help |
| show | /show |
| search | /search |
| evidence | /evidence |
| weekly review | /weekly-review |
| add study | /add-study |
| add note | /add-note |
| add finding | /add-finding |
| cite | /cite |
| review note | /review-note |
| approve finding | /approve-finding |
| add decision | /add-decision |
| close decision | /close-decision |
| log | /log |
| import | /import |
| export | /export |
| draft brief | /draft-brief |
| draft follow up | /draft-follow-up |
| customise | /customise |
| new view | /new-view |
| docs | /docs |
| view | /view |

## Boundaries

Writes identify the operator through --actor. These names are an internal record, not authentication or a tamper-proof audit. Another name must review a finding. Never approve without the operator asking to record a real review. Respect the documented collection purpose and the source owner's restrictions. No sends, publication, recruitment, contact with participants, transcription services or live connections. Drafts stay in drafts/. No personal details in git. Never seed a real business database.

Use a dedicated owner-controlled database and restrict filesystem access. RLS is enabled without public policies. This is not a multi-user permission system. Read docs/compliance.md before interpreting its checks.

## Implementation

scripts/research.mjs is the only domain CLI. supabase/migrations contains forward migrations. scripts/lib/db.mjs chooses local PGlite or DATABASE_URL for PostgreSQL. views.json and documents.json use the shared renderer. Run npm test after changes. Use --json for machine output.

Built and run through Omni by Enterprise DNA: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=dovetail
