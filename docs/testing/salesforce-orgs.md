# Step 1: Set up a Salesforce org

Use a free Developer Edition or trial org with the package installed. Never test with a production org or real constituent data.

_Last verified: 2026-11-11_

## Nonprofit Success Pack (NPSP)

1. Create a Developer Edition org with NPSP installed from the Trailhead promo page: https://trailhead.salesforce.com/promo/orgs/learn-nonprofit-success-pack-on-trailhead
   - Use an email address that is not already associated with an NPSP org.
2. Log in and confirm NPSP is installed (look for the NPSP Settings tab).
3. Add sample data:
   - Check what the org already includes (Households, Contacts, Opportunities).
   - Add records that match the scenarios in `evals/fixtures/npsp/` (for example, a first-time donor, a tribute gift, a household with two gifts, an open major gift opportunity) so you can compare agent output against the fixtures.
   - _TODO: a scripted data plan to load the fixtures automatically. Contributions welcome._

## Other packages

| Package | Org setup |
|---|---|
| Education Data Architecture (EDA) | TBD, contributions welcome |
| Program Management Module (PMM) | TBD, contributions welcome |
| Volunteers for Salesforce (V4S) | TBD, contributions welcome |
| Membership Essentials | TBD, contributions welcome |
| Grants Content Kit | TBD, contributions welcome |
| Declarative Lookup Rollup Summaries (DLRS) | Sign up for a free [Developer Edition org](https://developer.salesforce.com/signup), then install DLRS from https://install.salesforce.org/products/dlrs/latest. Pair it with the NPSP org above to test rollups on NPSP objects. |
| Summit Events App | Sign up for a free [Developer Edition org](https://developer.salesforce.com/signup), then install from https://install.salesforce.org/products/SummitEventsApp/latest. Public registration pages also need a Salesforce Site; follow the [package documentation](https://sfdo-community-sprints.github.io/summit-events-app-documentation/). |

When you add setup steps for a package, also set `orgSetup` for it in `packages.json`.

## Next

[Add the skill to an agent](README.md#testing-skills-in-real-agents).
