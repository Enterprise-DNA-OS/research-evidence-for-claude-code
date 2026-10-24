# Research Evidence for Claude Code

Keep research studies, source notes, exact quotations, reviewed findings and decision follow-ups in a database you own.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free under MIT. Install and run the demo. | Your research fields, source exports, review rules and paperwork. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |

[Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=dovetail) · [Instead of Dovetail](https://enterprisedna.co/omni/instead-of/dovetail?utm_source=github&utm_medium=readme&utm_campaign=dovetail)

## Start with a working review

Node 20 or later:

```bash
git clone https://github.com/Enterprise-DNA-OS/research-evidence-for-claude-code.git
cd research-evidence-for-claude-code
npm install
npm run demo
npm run research -- evidence --finding="Test an import example"
npm run docs
npm run view
```

Open this folder in Claude Code, Codex, OpenCode or Cursor. AGENTS.md and CLAUDE.md use the same recipes. PGlite runs locally. DATABASE_URL selects a dedicated PostgreSQL database; DATA_DIR changes the local directory. This is a trusted-operator workspace, not a shared public service. Never seed business data.

The fictional demo includes an overdue study review, contradictory interviews, a stale source, a withdrawn source and an overdue decision. No customer records or real interviews are included. Demo dates are relative to the first seed run. Reseeding does not reset existing records.

## The weekly work

Review the study queue, trace findings to their source quotations, check permission and retention dates, prepare an internal brief and follow through on decisions. Search holds back sources that have not passed review. Another reviewer name approves a finding. Decisions require a currently usable approved finding. Withdrawing permission or importing revised text returns dependent findings to draft. Time-expired evidence disappears from approved briefs without deleting the source history.

There are 28 CLI commands and 32 slash-command recipes. Every recurring job has one recipe in .claude/commands. All CLI output supports --json. Names match without case sensitivity; partial IDs work. Ambiguous matches list candidates and exit with code 1.

## Ten questions this build answers

These are demonstrated questions, not a claim that Dovetail cannot answer them.

1. Which studies are overdue for an owner review? attention.
2. Which findings have no usable supporting quotation? coverage.
3. Which findings contain contradictory evidence? coverage and evidence.
4. How many distinct recorded participant pseudonyms support the evidence base? coverage. Blank identities are not counted, and the count is not a representativeness score.
5. Which sources need a retention decision in the next month? retention.
6. Which interviews are held because their permission is unknown or withdrawn? compliance.
7. What exact source passage supports this finding? evidence.
8. Which decision follow-ups are late and who owns them? decisions.
9. Which decisions now depend on evidence that needs another review? decisions.
10. Who recorded a change or source-use decision? activity.

## Bring your Dovetail records across

Use Dovetail's readable raw-data CSV export, inspect its actual headings, then import into a study in one command.

```bash
npm run research -- import dovetail --study=ONBOARD --file=imports/notes.csv --map=fixtures/dovetail-map.json --actor="Your name" --dry-run
```

Remove --dry-run after the counts and mapping agree. Use --kind=findings for a separate Docs export. Imports are atomic and repeatable; changed source text requires review again. The importer does not decode encrypted .dovetailproject archives or infer missing quotation links. [Export, mapping and reconciliation guide](docs/replace-dovetail.md).

## Paperwork and views

Change brand.json to your business name, logo and colours. npm run docs writes a study brief and a decision record as private HTML, ready to print after review. npm run view writes the week and retention dashboards. They are read-only files, not a front end. Drafts, exports and generated files stay out of git.

## Your first hour: ten things to ask for

1. Put our name on the study brief.
2. Create our first study and its review owner.
3. Check our Dovetail export headings.
4. Import a small sample and reconcile every source URL.
5. Show the sources awaiting permission review.
6. Record the actual evidence for a source's permitted use.
7. Attach a quotation and the evidence that contradicts it.
8. Prepare a brief using only current approved findings.
9. Record a decision owner and follow-up date.
10. Add our research-method field with /customise.

/new-view adds a read-only report. [What a screen adds](docs/why-no-front-end.md).

## Checks and boundaries

npm test creates a disposable database, repeats migrations and seed, exercises all 28 commands, and checks imports, evidence gates, drafts, privacy filtering and HTML output. [Verification](docs/verification.md). Source-use checks support a responsible operator; they do not determine legal permission or certify compliance. [Rules and cited sources](docs/compliance.md).

The base works with text exports and explicit source references. It does not record interviews, transcribe media, reproduce collaborative tagging or connect to live channels. Enterprise DNA scopes those connections and a web view as part of a custom version.

Dovetail's paid subscription is privately quoted. A historical UK contract establishes selection evidence, not a current tariff or an NZ/AU invoice. [Research and six scores](docs/research.md).

MIT. Not affiliated with Dovetail or Anthropic. Hosting and coding-agent usage have their own costs.
