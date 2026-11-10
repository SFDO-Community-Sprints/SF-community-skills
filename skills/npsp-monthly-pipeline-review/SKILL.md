---
name: npsp-monthly-pipeline-review
description: Reviews an individual giving pipeline from a Salesforce NPSP open Opportunities report, flags stalled prospects and overdue close dates, and recommends priority actions for the month. Use when a fundraiser says "review my pipeline", "how's my portfolio looking", "who should I focus on this month", "prep for my pipeline meeting", or shares an Opportunities report export.
metadata:
  packages: npsp
  version: 0.1.0
  status: draft
---

# Monthly Pipeline Review

Turn an NPSP Opportunities export into a one-page pipeline summary with priorities. The organization uses Salesforce NPSP.

## Inputs

An export of open Opportunities with these columns where possible:

- Opportunity Name, Donor (Primary Contact or Account), Owner
- Amount, Stage, Probability, Close Date, Record Type
- Last Activity Date, Next Step
- Optional: last month's export for comparison, a list of LYBUNT donors (gave last year, not this year)

Ask the user for this year's individual giving goal, and whether their org uses custom stage names. If no export is provided, ask for one and list the columns above.

## Steps

1. Exclude Recurring Donation installments from the major and mid-level pipeline unless the user asks to include them.
2. Total the pipeline by stage: count and dollars. If Probability is populated, add a weighted total.
3. Compare to last month's export and to the annual goal, if provided.
4. Flag stalled Opportunities:
   - No activity in 60 days (default)
   - Close Date in the past
   - No Next Step
5. List Opportunities expected to close this month.
6. If LYBUNT data is provided, list the top 10 lapsed donors by last year's giving.
7. Recommend 5 to 10 priority actions, each with donor, action, owner, and due date.

## Default stages

Use the stage names in the export. If stages are unclear, assume a typical moves management sequence: Identification, Qualification, Cultivation, Solicitation, Pledged, Closed Won, Closed Lost. Map the org's names onto this order before totaling.

## Output template

```
PIPELINE REVIEW: [Owner or team] | [Month Year]

Totals
| Stage | Count | Amount | Weighted |
...
Total open: $X | Change since last month: +/- $X | Goal progress: X%

Closing this month
| Donor | Amount | Stage | Next step |

Stalled (needs attention)
| Donor | Amount | Issue | Days since activity |

Lapsed donors to reengage (LYBUNT)
| Donor | Last year | Last gift date |

Top priority actions
1. [Donor]: [action] | Owner | Due [date]
```

## Rules

- Do not change data. Report data quality issues as a separate short list: past close dates, missing amounts, duplicate Opportunities.
- Recommend specific actions, not general advice. "Call Maria Chen to schedule a site visit" is useful. "Increase engagement" is not.
- Keep it to one page. Detail goes in an appendix only if the user asks.
