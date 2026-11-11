---
name: npsp-log-gifts
description: Logs one or many donations into Salesforce NPSP from check images, Excel/CSV files, or pasted text. Matches or creates Contacts/Household Accounts, matches open Opportunities (or creates new), and reports record types, ownership, required fields, donor-email automations, and acknowledgement status. Use when someone says "log these gifts", "enter today's checks", or shares checks or a gift file.
metadata:
  packages: npsp
  version: 0.2.0
  status: draft
---

# Log Gifts

Log received gifts into Salesforce NPSP: parse them, match donors and open Opportunities, review every planned record with the user, then write Contacts, Accounts, Opportunities, and Payments. The org uses the NPSP Household Account model. Person Accounts are never used.

## How it works

- **Always:** accept gift details from check images, Excel/CSV files, or pasted text, and produce a parsed gift table for the user to review.
- **Connected:** a Salesforce connection with access to NPSP is required to match, create, and update records.
- **Not connected:** stop writing after the parsed table and say clearly that nothing was written to Salesforce. Still give the user what they need to enter the gifts by hand in NPSP Gift Entry: the special-gift handling below for each gift, the questions they must answer (record type, Campaign, GAU), and the batch summary.

## Phase 1: Collect and parse the gifts (always first)

1. The moment the skill starts, ask the user to upload or paste the gifts (check images, Excel/CSV, or text) if they haven't already. Accept one gift or many.
2. Extract per gift: donor first/last name (or organization name), address, email, phone, amount, date (received/check date), payment method, check number, Campaign/fund, designation, memo/notes, soft-credit or honoree info, and also record type, owner, stage, or Opportunity name if the file has columns for them.
3. Identify special gift types from the memo, letter, or notice: donor-advised fund (DAF) grant, stock, matching gift, in-kind, pledge payment, tribute. See Special gift types.
4. Required for every gift: donor name, amount, and Close Date (an Opportunity cannot be created without one). Use the gift's received/check date as the Close Date when the data has one. If a gift has no usable date, mark it "[Close Date missing - please provide]" and ask the user for it. Never assume today's date or any other date.
5. Show a numbered parsed table, including a Close Date column. Mark unreadable or missing values as "[unclear - please confirm]". Never guess amounts, dates, or names.

## Phase 1b: Opening questions (after the data is in)

Once the gifts are parsed, look up the org options and send ONE bundled message with these questions. Skip any question the data already answers for every gift (for example, a file with a Campaign or Stage column), and say which values you took from the file.

1. **Record type** for the Opportunities: list the active Opportunity record types and mark the default.
2. **Record owner** for new Contacts, Accounts, and Opportunities: the running user, another named user, or a queue.
3. **Campaign** to attach: a Campaign name, "none", or "use the Campaign in each gift's data".
4. **GAU** for restricted or designated gifts: list the active General Accounting Units. Restricted gifts must go to the GAU that matches the restriction. Ask only when a gift has a designation or restriction.
5. **Opportunity name**, asked only if the org has no auto-numbering or automation that names Opportunities. Offer the default "[Contact Full Name] [Close Date] [Amount]", with the Close Date in m/d/yyyy format (no leading zeros) and the Amount with a "$" before it, for example "Jordan Sampleton 11/9/2026 $100.00", and ask if that is acceptable.

In the same message, ask about anything marked unclear in the parsed table, and for the Close Date of every gift that is missing one. A gift without a Close Date is not written until the user provides it or excludes the gift. Never invent Campaign names, GAUs, or record types.

Do not move on until these are answered.

## Phase 2: Org rules (once per run, before any matching)

These checks run in the background and are not listed for the user. Use them to avoid errors and to raise a question only when a decision is needed.

- **Record types and stage:** use the record types to build the record type question. Stage is never asked: every Opportunity is set to the won stage (the stage marked Won, normally Closed Won) because this skill enters received gifts. Look up the won stage for the chosen record type. If it has several won stages, use the one named Closed Won, or otherwise the first. If no won stage is valid for the record type, tell the user and ask which stage to use.
- **Required fields and validation rules** on Account, Contact, and Opportunity: read the field metadata and query the active validation rules (including their error conditions and messages), and keep them for the pre-save check in Phase 5. Ask the user only for values that are required and missing from the gift data, in one batched message. If validation rules cannot be read in this org, say so in the review and mark every gift's pre-save check "[unverified]".
- **Opportunity naming:** check for an auto-number Name field or an active flow or trigger that sets the Opportunity Name on create. If one exists, follow it and do not ask about naming or set a Name. Otherwise the Opportunity name question applies, using the default format "[Contact Full Name] [m/d/yyyy] [$Amount]". For organization donors, use the Account name in place of the Contact name.
- **Automatic payment creation:** read the NPSP Payments settings (NPSP Settings > Donations > Payments) to find out whether automatic payment creation is on, and which Opportunity record types and Types are excluded. With the chosen record type and each gift's Opportunity Type, this tells you whether NPSP will create a payment for each new Opportunity:
  - Off, or the record type or Type is excluded: the skill creates the payment itself.
  - On and not excluded: expect NPSP to create one, and update it instead of adding another.
  - Settings can't be read: mark it "[unverified]" and treat it as unknown.
- **Ownership:** apply the owner chosen in the opening questions to new records. Never change the owner of existing records unless the user asks.
- **Donor email automations:** check for active flows, process builders, triggers, and NPSP settings that email donors when an Opportunity is created or updated. Setting Acknowledgment Status to "Email Acknowledgment Now" sends an email through NPSP. Do not describe these up front; use the result only to fill the "Will donor be emailed?" column in the review (yes / no / unverified).
- **Acknowledgement field:** use Acknowledgment Status (`npsp__Acknowledgment_Status__c`; values To Be Acknowledged, Acknowledged, Do Not Acknowledge, Email Acknowledgment Now, Email Acknowledgment Not Sent) unless the org uses its own field. Use it only to fill the acknowledgement column in the review.

## Phase 3: Match donors (bulk)

1. Search Contacts in bulk for all donors: by email first, then exact name plus address or postal code, then name alone. Search Accounts by name for organization donors.
2. Decide the donor of record for special gift types before matching (for example, the DAF sponsor or the matching employer is an Organization Account). See Special gift types.
3. Honor Do Not Contact and Deceased flags: surface them in the review and do not trigger acknowledgements for those donors without user approval.
4. **Exact single match:** reuse it. Compare the supplied address, email, and phone to the record. Propose updates only for blank fields or clearly newer data, and ask before overwriting populated values.
5. **Multiple possible matches:** show the top 3 with distinguishing fields and ask the user to pick one or create new.
6. **No match:** propose a new Contact (NPSP creates the Household Account automatically for individuals) or a new Organization Account for organizations. Never create a Contact without this duplicate check, and never create Person Accounts.
7. Check for an existing Household Account on a matched Contact so duplicates are not made.

## Phase 4: Match Opportunities (bulk)

1. Run one query for open (not Closed) Opportunities for all matched donors' Contacts and Accounts, including Primary Contact, Amount, Close Date, Stage, record type, Campaign, owner, Acknowledgment Status, and Recurring Donation link.
2. Treat as potential matches: open Opportunities for the same donor with a similar amount, a close date near the gift date, or the same Campaign. Also check unpaid scheduled NPSP Payments on open pledges and Recurring Donation installments.
3. A pledge payment ("payment 2 of 3") or Recurring Donation installment is applied to the existing Opportunity or its scheduled Payment, not entered as a new Opportunity.
4. For each gift with potential matches, show them and ask: update an existing Opportunity, or create a new one. Gifts with no match default to create new.
5. Warn about possible duplicates: a Closed Won Opportunity with the same donor, amount, and date.

## Phase 5: Review before writing

1. Test every planned record (each Contact, Account, Opportunity, and Payment, with its stage, amount, and other values) against the active validation rules and required fields from Phase 2. A gift that would fail, for example a Closed Won gift with no amount, is flagged in the review with the rule's name or message, and the user is asked for the missing value or an alternative before approval.
2. Reconcile: when the gifts come with a deposit slip or payout total, compare the gift count and total to it. For online platforms, reconcile the gross amount and record fees as the org's finance policy requires.
3. Flag gifts over $5,000 for the Development Director (default; ask what threshold the org uses).
4. Present one consolidated review (see Output). Do not write to Salesforce until the user approves. The user may approve all or exclude individual gifts.

## Phase 6: Write

1. Create or update Contacts and Accounts first, then Opportunities with the Primary Contact (Contact Role) set per NPSP, using the confirmed record type, Opportunity name, owner, won stage, Close Date, amount, and Campaign.
2. Add the details special gift types need:
   - **Soft credits:** an Opportunity Contact Role with the org's soft credit role for the DAF advisor, the employee on a matching gift, or a household member or solicitor the user names.
   - **Tributes:** Tribute Type (Honor or Memorial), Honoree Name, and Honoree Contact if the honoree is in NPSP. Record the notification contact and address in Honoree Information.
   - **GAU Allocations:** for restricted or designated gifts, allocate to the GAU the user confirmed.
3. When updating an existing Opportunity, change only the fields the user approved.

### Payments

Create or update an NPSP Payment (`npe01__OppPayment__c`) for every gift that has payment details, whether it came from a check image, an imported file, or pasted text. Payment fields: Opportunity (required lookup), Payment Amount, Payment Method (Cash, Check, Credit Card, ACH, or PayPal), Paid, Payment Date, Scheduled Date, Check/Reference Number, and Custom Payment Field or any other custom payment field the org has.

- **Paid is always true**, because this skill enters received gifts, even when the file has no Paid column or says otherwise.
- **Check images:** Payment Method = Check, the Check/Reference Number read from the check, the payment amount and date, and Paid = true. If the check number is unreadable, ask the user before writing. Never guess it.
- **Imported files and pasted text:** create the payment whenever the data has a payment method, payment amount, Paid value, payment date, or reference number. Map columns to the payment fields, show the mapping in the review, and confirm any ambiguous column. When the file has an Opportunity lookup column (name or ID), link the payment to that Opportunity; otherwise link it to the Opportunity created or updated for that gift. Payment Date defaults to the gift's received/Close Date. Leave other payment fields unset if the data doesn't provide them.
- **Payment Method values:** match them to the picklist above and ask about any value that doesn't match (for example, stock).

One payment per gift. Decide for each gift whether NPSP or the skill creates it:

- **The skill creates it** when automatic payment creation is off, when the Opportunity's record type or Type is excluded in the NPSP Payments settings, or when an existing Opportunity has "Do Not Automatically Create Payment" checked.
- **Otherwise NPSP creates one** when the Opportunity is saved. After saving, find it and update it with the gift's method, Paid, date, and Check/Reference Number instead of adding a second. If none appears, create it.
- If an existing Opportunity already has a payment (including a scheduled pledge payment), update that payment rather than adding another.
- For a new Opportunity, leave "Do Not Automatically Create Payment" as is.
- If the settings are unverified, create the payment only after checking that the Opportunity has none.

Report each result with record links, including the payment. On any failure, show the error and continue with the remaining gifts. After writing, hand the new gifts to the `npsp-donor-thank-you-notes` skill if the user wants thank-yous drafted.

## Special gift types

| Type | Donor of record | Soft credit | Tax receipt |
|---|---|---|---|
| Donor-advised fund (DAF) | DAF sponsor organization (Organization Account) | Donor advisor | No. Send a thank-you without receipt language |
| Stock | Individual donor | As usual | Yes, describe the shares; no dollar value on the receipt |
| Matching gift | Employer or foundation (Organization Account) | Employee | Receipt to the company per its process |
| In-kind | Individual or business | As usual | Describe the items only; no dollar value |
| Pledge payment | Original pledge donor | As on the pledge | Yes, for the amount paid |

Stock value for internal records: the average of the high and low price on the transfer date. If the high and low aren't provided, ask; never look up or guess a price. Stock is not part of a check deposit, so keep it out of the deposit reconciliation.

## Output

**Parsed gifts**

```
| # | Donor | Amount | Close Date | Method / Check # | Campaign | Gift type | Notes |
|---|---|---|---|---|---|---|---|
```

**Review before writing**

```
| # | Donor match | Contact/Account action | Opportunity action | Payment | Acknowledgement status after save | Will donor be emailed? | Pre-save validation |
|---|---|---|---|---|---|---|---|
| [n] | [existing link / new / multiple - need choice] | [reuse / update fields X / create] | [update existing link / create new, record type] | [create / update: method, amount, paid, date, Check/Ref #, or "[no payment data]"; created by: skill / NPSP / unverified] | [current -> expected value] | [yes / no / unverified, per automation] | [passes / would fail: rule name and missing value / unverified] |

Soft credits, tributes, GAU allocations: [per gift, or "[none]"]
Reconciliation: [count] gifts, $[total] | Deposit/payout: $[total] | Match: [yes / no, difference]
Flagged for director (over threshold): [gifts, or "[none]"]
Exceptions (not written): [gift, issue, action needed, or "[none]"]
```

**Questions for you:** numbered, only items needing a decision, or "[none]".

**Results (after approval)**

```
[Gift #]: [Contact/Account link], [Opportunity link], [Payment link], [created/updated], [acknowledgement status], [errors if any]
Footer: [sources used; anything unverified or skipped]
```

**Batch summary** (for finance, after writing; also when not connected, for manual entry)

```
BATCH SUMMARY: [batch name, e.g. 2026-11-09 Checks] | [date]
Gift count: N | Batch total: $X | Deposit/payout total: $X | Match: Yes/No
By payment method: | Method | Count | Amount |
By GAU: | GAU | Count | Amount |
Flagged for director: | Donor | Amount | Designation |
Exceptions (not entered): | Item | Issue | Action needed |
```

## Key principles

- Ask before overwriting populated data or sending anything to a donor. Flag any gift whose save would trigger an automated email.
- Never invent donor data, amounts, dates, check numbers, Campaigns, or GAUs. Unclear check text goes back to the user.
- Any gift that cannot be matched, coded, or reconciled goes on the exceptions list, not into Salesforce with a guess.
- Individuals use Contacts with Household Accounts. Person Accounts are never used.
- For receipt wording, defer to a general donor-and-funder-relations skill if one is installed.
