# Verification

The smoke suite uses an isolated temporary PGlite directory unless TEST_DATABASE_URL points to an empty disposable PostgreSQL database. It refuses a nonempty PostgreSQL database. It never uses DATABASE_URL from the operator's environment for tests.

It exercises all 28 CLI commands, repeat migrations and seed, exact quotation checks, cross-study rejection, independent review, withdrawal propagation, private drafts, JSON export, CSV mapping, dry-run rollback, repeat imports, changed records, malformed input, ambiguity exit codes and generated HTML. The seed intentionally contains stale and overdue records.

The GitHub workflow runs the same test on Windows and Linux and on PostgreSQL. A workflow definition is not evidence of a completed run. This file records the test design; the run report records observed results.

The fixture is synthetic. No live Dovetail account, actual customer export, Windows desktop or live business database is used by the local smoke suite. A real migration starts with a dry run and source reconciliation.

## Observed on 24 October 2026

The local Linux run passed 92 checks on Node 22 with PGlite. The same 92 checks passed on a fresh PostgreSQL 16.2 database. npm run demo, npm run docs and npm run view completed.

[GitHub Actions run](https://github.com/Enterprise-DNA-OS/research-evidence-for-claude-code/actions/runs/40055095594) did not start its jobs because GitHub reported failed account payments or a spending limit. Windows and the hosted PostgreSQL 17 job are therefore unverified. No failed test assertion was reported by that run. The workflow remains available for rerun once the account restriction is resolved.
