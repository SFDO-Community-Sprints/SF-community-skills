# Declarative Lookup Rollup Summaries (DLRS)

Notes for skill authors. The generated [data-model.md](data-model.md) lists every object and field in the package source.

- **Source:** https://github.com/SFDO-Community/declarative-lookup-rollup-summaries
- **Namespace:** `dlrs`
- **Trial org:** install into a free Developer Edition org (see [testing/salesforce-orgs.md](../../testing/salesforce-orgs.md))

DLRS is a general-purpose admin tool, not a nonprofit data model. Many nonprofits use it alongside NPSP or EDA to roll up values that native roll-up summary fields can't, such as across lookup relationships or with filter criteria.

## Key concepts

- **Rollup definition:** one rollup from a child object to a parent, e.g. the sum of Opportunity Amount onto Account. Defined by Parent Object, Child Object, Relationship Field, Field to Aggregate, Aggregate Operation (Sum, Max, Min, Avg, Count, Count Distinct, Concatenate, and others), Aggregate Result Field, and optional Relationship Criteria (a SOQL WHERE clause).
- **Two storage formats:** the Lookup Rollup Summary custom metadata type (`dlrs__LookupRollupSummary2__mdt`, the current format) and the older Lookup Rollup Summary custom object (`dlrs__LookupRollupSummary__c`). Check which one an org uses.
- **Calculation Mode:** Realtime, Scheduled, Developer, or Process Builder. Realtime and Scheduled need a generated Apex trigger deployed on the child object ("Manage Child Trigger").
- **Jobs and logs:** full recalculations run as jobs (Lookup Rollup Calculate Job); scheduled mode queues parent records as Lookup Rollup Summary Schedule Items; failures land in Lookup Rollup Summary Log (`dlrs__LookupRollupSummaryLog__c`).

## Gotchas

- A rollup only works after its child trigger is deployed, and the trigger needs test coverage to deploy to production.
- Rollups onto NPSP objects can collide with NPSP's own rollups (e.g. Total Gifts). Check before adding a rollup to an `npo02__` field.
- Lookup Child and Lookup Parent objects are part of the package; they are not where rollups are defined.
- _TODO: more gotchas from practitioners. Contributions welcome._

## Help resources

- Documentation: https://sfdo-community-sprints.github.io/DLRS-Documentation/
- Install: https://install.salesforce.org/products/dlrs/latest
- Releases: https://github.com/SFDO-Community/declarative-lookup-rollup-summaries/releases
