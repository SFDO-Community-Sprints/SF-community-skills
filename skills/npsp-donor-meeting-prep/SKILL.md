---
name: npsp-donor-meeting-prep
description: Prepares a one-page donor briefing from Salesforce NPSP data before a visit, call, or event conversation. Use when a fundraiser says "prep me for my meeting with...", "I'm meeting [donor] on Thursday", "brief me on the Lee household", or shares an NPSP contact or giving history ahead of a donor conversation.
metadata:
  packages: npsp
  version: 0.1.0
  status: draft
---

# Donor Meeting Prep

Produce a one-page briefing an individual giving fundraiser reads before meeting a donor. The organization uses Salesforce NPSP.

## Inputs

Collect what is available. Do not block on missing items; note gaps in the brief.

- Donor name and meeting date, format, and purpose (cultivation, solicitation, stewardship, thank-you)
- NPSP Contact and Household Account data, pasted or exported, or read through a Salesforce connector if one is connected
- Opportunity history, recent Activities and Tasks, Engagement Plans
- Any notes the fundraiser adds

If no NPSP data is provided and no Salesforce connector is available, ask the user to paste or export the Contact record and the donor's Opportunity history.

## Steps

1. Pull the giving summary from Household rollups: Total Gifts, First Gift Date, Last Gift Date and Amount, Largest Gift, Number of Gifts, and gifts this year and last year.
2. List the last 5 closed Opportunities (date, amount, campaign, GAU designation) and any open Opportunities with stage and amount.
3. Summarize the last 3 logged Activities or contact reports. Note any promises the organization made that are still open.
4. Note relationships: household members, soft credits, board or staff connections, matching gift employer.
5. Identify giving interests from GAU Allocations, campaign responses, and notes.
6. Set the meeting goal. If the purpose is solicitation, suggest an ask amount.
7. Draft 3 to 5 talking points and 3 to 5 open questions.
8. List topics to avoid or handle carefully, based on the record.

## Rules

- Ask amount default: 1.5x to 2x the donor's largest single gift, adjusted for capacity notes in the record. Ask the user whether their org requires approval above a set amount.
- Use the Preferred Name, Formal Greeting, and Informal Greeting fields from NPSP. Flag a possible deceased household member if the record shows one.
- Never include wealth screening ratings or estimated net worth in anything that leaves Resource Development.
- Do not invent program results, statistics, or donor facts. Mark anything unknown as "Not in record."
- Flag data issues that distort the picture: likely duplicate Contacts, missing soft credits, open Opportunities with past close dates.

## Output template

```
DONOR BRIEF: [Name] | Meeting [date], [format] | Prepared [today]

Donor snapshot
- Household, preferred name, salutation, location, connection to org

Giving summary
- Lifetime: $X across N gifts since [year] | Largest: $X ([date])
- Last gift: $X on [date] to [designation]
- This year: $X | Last year: $X

Relationship history
- Last 3 interactions with date and one line each
- Open commitments from us

Meeting goal and ask
- Goal: [one sentence]
- Suggested ask: $X for [purpose] (basis: ...)

Talking points
1. ...

Questions to ask
1. ...

Topics to avoid or handle with care
- ...

Data gaps or issues
- ...
```

Keep it to one page. After the meeting, the npsp-donor-meeting-follow-up skill handles the contact report.
