# Source-use and retention checks

This research workspace checks the record supporting a decision. It does not determine legal permission, certify compliance or decide whether an exception applies. The operator establishes purpose, authority, permitted audience and retention obligations. It is not for clinical research, medical advice, recruitment or regulated trial management. Sources checked 24 October 2026.

| Check | Implemented behavior | Basis and limits |
|---|---|---|
| Purpose | Every study requires a purpose; each source-use review records a reference | [NZ IPP 10](https://www.privacy.org.nz/privacy-principles/10/) limits reuse beyond the collection purpose, with exceptions. The software cannot determine whether the stated purpose or exception is valid. |
| Permission evidence | New/imported notes start pending. Only explicitly allowed and reviewed notes enter search and usable evidence | An internal conservative review control supporting [Australian APP 6](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-6-app-6-use-or-disclosure-of-personal-information). Consent is not the only lawful basis; record the applicable authority in the review reference. |
| Retention review | Missing or past retention dates hold a source from reuse and appear in the queue | [NZ IPP 9](https://www.privacy.org.nz/privacy-principles/9/) addresses keeping information only as long as needed. The date is operator supplied, not a statutory duration. The command does not delete anything. |
| Withdrawal and disposition | Withdrawn sources are withheld; related findings return to draft | [Australian APP 11](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-11-app-11-security-of-personal-information) includes protection and destruction/de-identification obligations, subject to exceptions. An operator must review retained copies, backups and legal holds. Holding text from search is not deletion. |
| Evidence freshness | Reviews older than 180 days are held | Internal default in settings, not law. /customise changes it to the business policy. |
| Quotation accuracy | Citations must quote source text exactly within the same study | Internal provenance control, not automatic validation of the finding's interpretation. Contradictions require explicit review. |

A finding needs current supporting evidence and no blocked citation to appear in an approved brief. Another actor name records approval. Names are not authenticated identities. The owner connection can alter the database and activity history, so this is not a tamper-proof audit or a multi-user access system.

Source metadata and draft finding summaries remain visible to the trusted operator, including when a source is held. The explicit source-review display and private full backup contain held source text. Generated files are internal drafts. Review audience, purpose and overseas processing before sharing or giving a coding agent access. No online transfer is performed by this code.

Choose a dedicated restricted database, filesystem permissions, encryption, backups and a retention/disposal procedure appropriate to the business. Pseudonyms can still be personal information. Neither this software nor a clean compliance command proves that handling is lawful.
