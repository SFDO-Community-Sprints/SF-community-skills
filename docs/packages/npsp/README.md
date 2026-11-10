# Nonprofit Success Pack (NPSP)

Notes for skill authors. The generated [data-model.md](data-model.md) lists every object and field; this page covers how they fit together and what trips people up.

- **Source:** https://github.com/SalesforceFoundation/NPSP (plus the dependency repos listed in `packages.json`)
- **Trial org:** https://trailhead.salesforce.com/promo/orgs/learn-nonprofit-success-pack-on-trailhead

## Namespaces

NPSP is several managed packages installed together:

| Namespace | Package | Highlights |
|---|---|---|
| `npsp` | Nonprofit Success Pack | GAUs and Allocations, soft credits, tributes, acknowledgments, Engagement Plans, Levels, Gift Entry, Batches |
| `npe01` | Contacts & Organizations | Payments (`npe01__OppPayment__c`), preferred email/phone fields, account model |
| `npo02` | Households | Giving rollups on Account and Contact (Total Gifts, Last Gift Date, Largest Gift, ...), legacy Household object |
| `npe03` | Recurring Donations | `npe03__Recurring_Donation__c` |
| `npe4` | Relationships | Contact-to-contact relationships |
| `npe5` | Affiliations | Contact-to-organization affiliations |

## Key concepts

- **Household Accounts.** Each individual donor belongs to a Household Account. Giving rolls up to both the Household and the Contact (`npo02__` rollup fields). Use the Household's Formal and Informal Greeting for letters.
- **Opportunities are gifts.** Donations, major gifts, matching gifts, grants, and in-kind gifts are Opportunities, distinguished by Record Type. Closed Won Opportunities count toward rollups.
- **Payments.** Each Opportunity can have one or more Payments (`npe01__OppPayment__c`); pledges are Opportunities with scheduled Payments.
- **GAUs and Allocations.** General Accounting Units (`npsp__General_Accounting_Unit__c`) represent funds or designations. Allocations (`npsp__Allocation__c`) split an Opportunity's amount across GAUs.
- **Soft credits.** Contact roles on the Opportunity (e.g. Household Member, Soft Credit, Matched Donor) and Partial Soft Credits give credit to people who didn't make the hard-credit gift.
- **Tributes.** Tribute Type (`Honor` or `Memorial`), Honoree, Notification Recipient, and Tribute Notification Status fields on Opportunity.
- **Acknowledgments.** `npsp__Acknowledgment_Status__c` (To Be Acknowledged, Acknowledged, Do Not Acknowledge, Email Acknowledgment Now, Email Acknowledgment Not Sent) and `npsp__Acknowledgment_Date__c`.
- **Recurring Donations.** Enhanced Recurring Donations generate installment Opportunities. Exclude them from major-gift pipeline views unless asked.

## Gotchas

- **Stage names, Record Types, Campaigns, and GAUs are org-specific.** Skills must ask for them, not assume them.
- **Rollups are calculated.** They may lag until the nightly batch runs; don't tell users to edit rollup fields.
- **Duplicate Contacts are common.** Skills that create records should insist on a duplicate check first.
- **Many orgs customize heavily.** Write skills around standard NPSP behavior and invite the user to describe their customizations.

## Help resources

- NPSP documentation on Salesforce Help (search "Nonprofit Success Pack")
- Trailhead: "Nonprofit Success Pack Basics" and related modules
- Trailblazer Community: Nonprofit Hub group

_Add links here as you find authoritative pages._
