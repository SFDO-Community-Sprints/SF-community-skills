# NPSP synthetic fixtures

Fictional data shaped like NPSP report exports, shared by every NPSP skill's evals. Every person and organization here is made up. Names use obviously fictional surnames (Sampleton, Fixture, Testwell, Mockford, Placeholder) so nobody mistakes them for real donors.

| File | Shape | Used by |
|---|---|---|
| `recent-gifts-report.csv` | Closed Won Opportunities from the last week, with household rollups, tribute, and acknowledgment fields | npsp-donor-thank-you-notes |
| `open-opportunities.csv` | Open Opportunities with stage, probability, close date, last activity, next step | npsp-monthly-pipeline-review |
| `check-batch.md` | A deposit slip and the gifts in it, including a DAF grant, a stock gift, a pledge payment, and a matching gift | npsp-log-gifts |
| `lapsed-donors-contacts.csv` | Contacts with NPSP gift rollups, Do Not Contact and Deceased flags, and open-opportunity status, as of 2026-11-10 | npsp-lapsed-donors-report-notes |
| `household-record.md` | One Household Account with Contacts, rollups, recent Opportunities, and Activities | npsp-donor-meeting-prep |
| `meeting-notes.md` | A fundraiser's rough notes after a donor lunch | npsp-donor-meeting-follow-up |

To add a fixture: keep it fictional, keep it small (a person should be able to check a good answer by hand), and use the real NPSP field labels so skills learn the right vocabulary.
