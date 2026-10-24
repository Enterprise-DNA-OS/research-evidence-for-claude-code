# Verification

The smoke suite uses an isolated temporary PGlite directory unless TEST_DATABASE_URL points to an empty disposable PostgreSQL database. It refuses a nonempty PostgreSQL database. It never uses DATABASE_URL from the operator's environment for tests.

It exercises all 27 CLI commands, repeat migrations and seed, exact quotation checks, cross-study rejection, independent review, withdrawal propagation, private drafts, JSON export, CSV mapping, dry-run rollback, repeat imports, changed records, malformed input, ambiguity exit codes and generated HTML. The seed intentionally contains stale and overdue records.

The GitHub workflow runs the same test on Windows and Linux and on PostgreSQL. A workflow definition is not evidence of a completed run. This file records the test design; the run report records observed results.

The fixture is synthetic. No live Dovetail account, actual customer export, Windows desktop or live business database is used by the local smoke suite. A real migration starts with a dry run and source reconciliation.
