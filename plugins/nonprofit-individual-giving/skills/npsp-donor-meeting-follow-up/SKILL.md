---
name: npsp-donor-meeting-follow-up
description: Turns rough notes from a donor meeting into an NPSP contact report, a follow-up email, and a list of Salesforce updates. Use when a fundraiser says "here are my notes from lunch with...", "write up my donor visit", "log this meeting", "draft a follow-up to the donor I just met", or pastes meeting notes or a voice memo transcript.
metadata:
  packages: npsp
  version: 0.1.0
  status: draft
---

# Donor Meeting Follow-Up

Convert meeting notes into three outputs: a contact report for NPSP, a follow-up message to the donor, and a checklist of record updates. The organization uses Salesforce NPSP.

## Inputs

- Raw notes, bullet points, or a transcript from the meeting
- Donor name, meeting date, attendees
- The pre-meeting brief, if one exists
- The donor's open Opportunity, if any

If the date, attendees, or donor name is missing, ask before writing.

## Steps

1. Write the contact report using the template below. Keep it factual.
2. Extract every commitment made by either side and give each an owner and due date.
3. Draft the follow-up email or letter to the donor: thank them for their time, recap what was discussed in one or two sentences, confirm each commitment from the organization, and state the next step.
4. List the NPSP updates:
   - Log a completed Task or Activity with the contact report in the description
   - Update the Opportunity stage, amount, and close date if anything changed
   - Create a follow-up Task with a due date for the next step
   - Update Contact fields for new interests, communication preferences, or relationship info
5. Flag anything that needs a colleague, such as a program staff tour or an ED call.

## Rules

- Log the contact report within 48 hours of the meeting and send the follow-up within 2 business days, unless the user's org has its own standard.
- Write contact reports as if the donor may read them. Donors can request their records. No opinions, guesses about motives, or gossip.
- Keep sensitive personal information (health, family conflicts, finances shared in confidence) out of NPSP. Record only that a topic exists if needed, such as "Donor shared a personal update; follow up with care."
- Every next step needs a date. If the notes have none, propose one and mark it as proposed.
- Do not promise gift recognition, naming, or program commitments the notes do not show.

## Contact report template

```
Date: 
Attendees: 
Type: Visit / Call / Event / Virtual
Purpose: 
Discussion: 3 to 6 sentences, factual
Donor interests noted: 
Outcome: e.g. agreed to consider $X for [purpose] by [date]
Commitments: [who] will [what] by [date]
Next step and due date: 
```

## Output order

1. Contact report
2. Follow-up message draft
3. NPSP update checklist
4. Items needing a colleague

For receipt or tax language in follow-ups, defer to the donor-and-funder-relations skill if it is installed.
