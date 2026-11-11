---
name: npsp-lapsed-donors-report-notes
description: Finds lapsed (LYBUNT/SYBUNT) donors in Salesforce NPSP who are safe to contact, then shows a report or drafts personalized emails or printed letters. Each run lets you choose how lapsed is defined, who to include, and what to produce. Use when someone says "who are our lapsed donors", "pull a LYBUNT report", or "draft notes to donors who haven't given this year".
metadata:
  packages: npsp
  version: 0.1.0
  status: draft
---

# Lapsed Donors: Reports and Notes

Find lapsed donors who are safe to contact, then show a report or draft re-engagement emails or printed letters. The organization uses Salesforce NPSP. Draft only: the user reviews and sends.

## How it works

- **Always:** works from details the user types in. If no donor data is available, ask the user to paste a donor list (name, last gift date, last gift amount, email or address) and draft notes from that.
- **Connected:** Salesforce supplies donors (Contacts), their gift history, the Do Not Contact and Deceased fields on the Contact, email and mailing address from either the Contact or its Account (the user's choice), and (if present) the organization's fiscal year setting.

## Phase 1: Choose options

Ask once, in a single message with all choices shown.

1. **Contact information source:** should email and mailing address come from the Contact or from the Contact's Account? Contact level uses the donor's own email and mailing address. Account level uses the Account's address (and the Account's email field, if the org has one). Also ask what to do when the chosen level has no email or address: skip the donor (default) or fall back to the other level.
2. **Gift type (Opportunity record type):** show the Opportunity record types that exist in Salesforce (for example Donation, Grant, Membership) and ask which count as gifts for this run, or all. Donors are people (Contacts); the record type only decides which gifts are counted. If the org has no Opportunity record types (or only one), do not ask; count all won Opportunities as gifts and note that in the output footer.
3. **Lapsed definition** ("how should we measure lapsed?"):
   - **Calendar year:** LYBUNT = gave last calendar year but not yet this calendar year (cutoff Jan 1). SYBUNT = gave in an earlier year but not last year or this year.
   - **Fiscal year:** same logic, but year boundaries come from the organization's fiscal year start in Salesforce company information. If it can't be read, tell the user and ask for the fiscal year start month.
   - **Real time (rolling):** lapsed = last gift 360+ days ago. Ask whether to split into LYBUNT-like (360-720 days) and SYBUNT-like (720+ days) or keep one group. Default: split.
4. **Output type:** Email, Printed letter, or Report only. Report only shows the summary and donor table without drafting notes, which keeps large result sets short. Email and Printed letter also draft a note for each donor. Do not ask where the results should go here; that comes at the end (Phase 4).
5. **Optional narrowing** (by default, include every qualifying donor). Offer the options below, plus any other segmentation fields on the Contact (for example Level). Show the actual picklist values found in the org so the user can pick from them:
   - Last gift amount: minimum, maximum, or a range.
   - Lifetime giving: minimum.
   - Giving history: minimum number of gifts, or number of years given.
   - Campaign: donors whose last gift came through selected Campaign(s), or exclude certain Campaigns.
   - Contact owner or portfolio.
   - Recently contacted: skip donors with a logged email, call, task, or event in the last N days (default: do not apply).
6. **Open Opportunities:** how to treat donors who have an open Opportunity (a pledge or ask already in progress): exclude them, include and flag them, or include only them. Ask every run; suggest exclude if the user has no preference.

**Branding, signature, and tone:** ask as a follow-on question only if the user chose Email or Printed letter; skip it for Report only. Ask whether the user has a shared document or canvas with the branding, signature, and tone they'd like used, and to share the link. If provided, read it and apply it as written. If not, close each note with a plain-text signature (the user's name and title from their profile if available, otherwise ask, and the organization name) and add a plain-text "[add branding/signature]" note. If the user later asks for drafts after a Report only run, ask this question then.

## Phase 2: Gather (bulk, no per-donor lookups)

1. The list is Contact-based: every row is a donor Contact, whichever contact information source the user chose.
2. **Gift summary fields:** use the Contact's NPSP rollups: Last Gift Date (`npo02__LastCloseDate__c`), Last Gift Amount (`npo02__LastOppAmount__c`), Total Gifts (`npo02__TotalOppAmount__c`), Total Number of Gifts (`npo02__NumberOfClosedOpps__c`), and the yearly totals: Total Gifts This Year, Last Year, and Two Years Ago (`npo02__OppAmountThisYear__c`, `npo02__OppAmountLastYear__c`, `npo02__OppAmount2YearsAgo__c`).
   - Calendar-year LYBUNT/SYBUNT uses the yearly totals. NPSP can be set to calculate these by fiscal year; if it is and the user chose calendar year, use Last Gift Date and won Opportunity Close Dates instead.
   - Fiscal-year and rolling use Last Gift Date.
   - If the summary fields are empty for most Contacts, say so and fall back to won Opportunities linked to the Contact through the Primary Contact or the primary Opportunity Contact Role.
3. **Specific record types:** if the user chose specific Opportunity record types, the summary fields cannot split by type. Instead, calculate last gift date, last gift amount, lifetime total, and years given from won Opportunities of those record types, joined to Contacts in one bulk query.
4. **Exclusions come from the Contact only:** anyone with Do Not Contact (`npsp__Do_Not_Contact__c`) true, and anyone with Deceased (`npsp__Deceased__c`) true. Account-level flags are not checked. If the Contact has no Do Not Contact field, tell the user and ask whether to continue without it before going further.
5. **Contact information:**
   - Contact level: read the primary email and mailing address (street, city, state, postal code) from the Contact.
   - Account level: read the address from the Contact's Account (billing address, or the shipping address if billing is empty) and the email from an Account email field if the org has one. If the Account has no email field, say so and ask whether to use the Contact's email instead.
   - Fetch the Account details in the same bulk query as the Contacts. Both levels also pull the Contact's name and salutation for the greeting.
6. **Required for a donor to be included:** a gift in the lapsed window, plus (for Email) an email or (for Printed letter) a complete mailing address with street, city, and postal code, at the chosen level or at the other level if the user chose to fall back. Report only has no email or address requirement; show whichever is on file and mark the rest "[not on record]". Donors missing the required item are counted as skipped, not filled in.
7. **Narrowing:** apply the options from Phase 1. Campaign comes from the Campaign on the donor's last gift Opportunity; a donor whose last gift has no Campaign is treated as having none.
8. **Open Opportunities and recent contact:** check open Opportunities for the candidate Contacts in one bulk query and apply the user's open-Opportunity choice. If the recently-contacted option was chosen, check logged activities for the candidates in one bulk query and exclude donors with activity inside the window. If activity data isn't available, say so and skip that filter.
9. **Pull for each Contact:** name, salutation, last gift date, last gift amount, lifetime total, number of gifts, Campaign of last gift (if any), email and mailing address (with which level supplied them), owner, and open-Opportunity status.
10. Do not cap the list. Return every qualifying donor and report the total count.

## Phase 3: Segment

1. Label each donor LYBUNT or SYBUNT (or the rolling equivalent). Sort by last gift amount, highest first.
2. Count donors skipped, with a reason for each count: Do Not Contact, Deceased, missing the needed email or address at the chosen level, open Opportunity (if excluded), and recently contacted (if applied). Report these counts, not names.

## Phase 4: Draft

1. Show the segment table first.
2. Then, for each donor (or a template plus merge fields if more than 10), draft a short, warm note: thank them for their specific last gift (amount and date), mention impact in general terms the user supplied, and offer a soft invitation to reconnect.
   - LYBUNT notes have a "we missed you this year" tone.
   - SYBUNT notes have an "it's been a while, we're grateful" tone.
   - Never invent programs, outcomes, or statistics. Use an "[add impact detail]" placeholder when none were provided.
3. Format by output type:
   - **Email:** subject line, greeting with the donor's preferred name or salutation, body, signature block. Address it to the primary email.
   - **Printed letter:** date, recipient name and primary mailing address block, salutation, body, signature block with space for a handwritten signature, branding line.
   - **Report only:** skip drafting. Show the summary and donor table, then end by offering to draft emails or printed letters for all or a chosen subset of these donors.
4. For Email or Printed letter, show the summary and drafts in the conversation, then end by asking where to save them: for Email, a shared document or canvas, or email drafts; for Printed letter, a shared document or canvas, or a document file. A shared document or canvas holds the summary table and all drafts together. If the chosen destination can't be created, say so and offer a shared document instead. Nothing is sent automatically.

## Output

```
Who needs a touch? [definition used, cutoff date(s), delivery format]

Summary: [N donors qualify: X LYBUNT, Y SYBUNT; Z skipped for do-not-contact flags; W skipped for missing email/address; or "[no lapsed donors found for this definition]"]

| Donor | Segment | Last Gift | Amount | Lifetime | Send To (email or address) |
|---|---|---|---|---|---|
| [name linked to record] | [LYBUNT/SYBUNT] | [date] | [amount] | [total] | [primary email or address] |

Drafts: [one per donor, or a template with merge fields; or "[Report only: no drafts requested]"]

Next step: [Report only: offer to draft emails or printed letters. Email: ask shared document or email drafts. Printed letter: ask shared document or document file.]

Signature/branding used: [applied from the user's shared document, or "[none provided: plain-text signature and placeholder note used]", or "[not applicable: Report only]"]

Footer: [fields used for last gift and do-not-contact checks; anything skipped]
```

## Key principles

- The lapsed definition and do-not-contact exclusions are applied from the data before drafting. Flagged donors never appear in the table or drafts.
- Draft only; the user reviews and sends.
- Gift amounts and dates come only from Salesforce (or the pasted list). An empty field shows "[not on record]".
- For thank-yous on new gifts, use `npsp-donor-thank-you-notes` instead.
