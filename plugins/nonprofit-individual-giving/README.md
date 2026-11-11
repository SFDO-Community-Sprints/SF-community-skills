# Nonprofit Individual Giving

Skills for individual giving fundraisers at nonprofits using Salesforce Nonprofit Success Pack (NPSP).

- **Department:** Resource Development
- **Persona:** Individual Giving Fundraiser

## Skills

<!-- BEGIN GENERATED skills-table -->
| Skill | Packages | Status | Version |
|---|---|---|---|
| [npsp-donor-meeting-prep](../../skills/npsp-donor-meeting-prep/SKILL.md) | Nonprofit Success Pack | draft | 0.1.0 |
| [npsp-donor-meeting-follow-up](../../skills/npsp-donor-meeting-follow-up/SKILL.md) | Nonprofit Success Pack | draft | 0.1.0 |
| [npsp-donor-thank-you-notes](../../skills/npsp-donor-thank-you-notes/SKILL.md) | Nonprofit Success Pack | draft | 0.1.0 |
| [npsp-monthly-pipeline-review](../../skills/npsp-monthly-pipeline-review/SKILL.md) | Nonprofit Success Pack | draft | 0.1.0 |
| [npsp-log-gifts](../../skills/npsp-log-gifts/SKILL.md) | Nonprofit Success Pack | draft | 0.2.0 |
| [npsp-lapsed-donors-report-notes](../../skills/npsp-lapsed-donors-report-notes/SKILL.md) | Nonprofit Success Pack | draft | 0.1.0 |
<!-- END GENERATED skills-table -->

## What each skill produces

| Skill | Use it when | Output |
|---|---|---|
| npsp-donor-meeting-prep | You have a donor meeting coming up | One-page donor brief with giving summary, talking points, and suggested ask |
| npsp-donor-meeting-follow-up | You just met with a donor | Contact report, follow-up email, NPSP update checklist |
| npsp-donor-thank-you-notes | New gifts came in | Tiered, personalized thank-you drafts and acknowledgment updates |
| npsp-monthly-pipeline-review | It's time for your monthly pipeline check | Pipeline summary, stalled list, priority actions |
| npsp-log-gifts | You have checks, a gift file, or pasted gifts to log | Parsed gift table, donor and Opportunity matching, a review before writing, NPSP records and payments, finance batch summary |
| npsp-lapsed-donors-report-notes | You want to re-engage donors who haven't given recently | LYBUNT/SYBUNT report of donors safe to contact, with optional email or letter drafts |

## How data gets in

These skills work without a Salesforce connection: paste data or upload an NPSP report export. If the assistant has a Salesforce connector, it can read records directly.

## Defaults

Each skill ships with defaults, such as thanking donors within 48 hours or flagging gifts over $5,000. Tell the assistant your org's standard and it will use that instead. It asks for anything that varies too much to assume, such as your Campaign and GAU list or your annual goal.

## Works alongside

If a general nonprofit skill for donor and funder relations is installed (for example, `donor-and-funder-relations` in the Claude for Nonprofits plugin), these skills defer to it for receipt language and donor privacy.
