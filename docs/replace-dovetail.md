# Move readable Dovetail records into your own database

Checked 24 October 2026 against [Dovetail's current export documentation](https://docs.dovetail.com/help/projects/download-project-data).

## Export the source

In a project, open the top-right menu, select the record type and download its CSV. Start with raw data; export Docs separately. Dovetail documents text content, custom fields, modified dates and source URLs for those exports. Download original media and transcripts separately when your retention policy permits it. A full .dovetailproject archive is encrypted for Dovetail-to-Dovetail transfer and cannot be read by this importer.

## Set up the destination

Run npm install and npm run migrate on a new, dedicated database. Do not seed it. Create the study:

```bash
npm run research -- add-study --code=SETUP --title="Setup interviews" --owner="Research lead" --purpose="Improve first-week setup" --review-due=2026-11-30 --actor="Your name"
```

Dates and purpose are examples. Supply the actual study values.

## Map the real headings

Inspect the CSV. fixtures/dovetail-notes.csv is a synthetic importer-contract fixture, not a captured vendor export. Dovetail does not document stable header spellings, so verify and edit the mapping for your actual file. The default mapping is Title, Content, URL and Last modified. The JSON keys title, body and source_url are required. source_modified is optional. Unmapped columns stay in the source CSV and are not silently presented as imported. Participant identity, permission and retention are never inferred.

| Destination | Mapping key | Rule |
|---|---|---|
| Note title or finding title | title | Required text |
| Note body or finding summary | body | Required text; line breaks retained |
| Stable source key | source_url | Required HTTP(S) URL, unique within a study and record type |
| Source modified value | source_modified | Optional raw source value, not used as a legal or review date |

## One-command import

```bash
npm run research -- import dovetail --study=SETUP --file=imports/notes.csv --map=fixtures/dovetail-map.json --actor="Your name" --dry-run
npm run research -- import dovetail --study=SETUP --file=imports/notes.csv --map=fixtures/dovetail-map.json --actor="Your name"
```

For Docs, use the same command with --kind=findings and the corresponding CSV. Each file imports in one transaction. A bad row aborts the file. A dry run rolls back all writes, including history. Repeating the same export does not duplicate records. Revised note text resets source review and dependent finding approvals. Revised Docs become draft findings.

## Reconcile before switching

Compare imported and unchanged counts with CSV rows. Compare every source URL and a sample of long, multiline passages. Inspect held text with show --type=note --record="<note>" --review-source during the authorised internal review. Record actual purpose/permission evidence with review-note and a business-approved retention review date. Rebuild quotation links explicitly using cite: a quotation must be an exact passage from a note in the same study. Review contradictions before approving a finding.

CSV does not preserve rich layout, media or the source's highlight/tag relationships. This import carries raw-data text and Docs text only. It does not migrate Channels, dashboards, user permissions, comments, media clips, automatic tags, custom fields without explicit mapping, or the encrypted project archive. Keep the original exports privately until reconciliation and retention review are complete. Large histories and missing evidence take longer than a day; a small readable export can be imported and checked in one working session.

## Take a backup

npm run research -- export writes a complete private JSON snapshot under exports/. It includes source text that ordinary search withholds, so restrict access. It is portable data with references and IDs, not a tested restore workflow. Keep source exports and backup copies according to your own policy.
