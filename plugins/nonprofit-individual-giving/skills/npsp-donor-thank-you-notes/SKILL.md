---
name: npsp-donor-thank-you-notes
description: Drafts personalized donor thank-you notes from a list of new gifts in Salesforce NPSP, tiered by gift size and donor type, and tracks NPSP acknowledgment status. Use when a fundraiser says "write thank-yous for this week's gifts", "draft a thank-you for this donor", "we got a first-time gift from...", or shares an NPSP report of recent gifts.
metadata:
  packages: npsp
  version: 0.1.0
  status: draft
---

# Donor Thank-You Notes

Draft personal thank-you notes that go beyond the tax receipt. The organization uses Salesforce NPSP.

## Inputs

An NPSP report or list of recent gifts with, ideally:

- Donor name, Formal and Informal Greeting, household
- Amount, close date, payment method
- Campaign and GAU designation
- Number of prior gifts, last gift amount (to spot first-time and upgraded donors)
- Tribute information (honoree, notification contact)
- Soft credits

Ask the user for approved impact examples or statistics. Never invent them. If none are given, use a placeholder like [impact example] and flag it.

## Steps

1. Group gifts into tiers (defaults below; ask if the org uses different tiers or signers).
2. For each gift, find the personal hook: first gift, upgrade, giving anniversary, consecutive years, tribute, specific program designation, recent event attendance.
3. Draft the note in the right length and voice for the tier and signer.
4. For tribute gifts, draft a separate notification to the honoree or their family. Do not include the gift amount.
5. Check for duplicates: one note per household unless gifts came from different household members on purpose.
6. Output an NPSP update list: set Acknowledgment Status to Acknowledged and Acknowledgment Date for each gift once sent.

## Default tiers

| Gift | Format | Signer | Timing |
|---|---|---|---|
| Under $250 | Standard letter with a personal line | Fundraiser or Development Director | Within 48 hours |
| $250 to $999 | Handwritten-style note | Fundraiser | Within 48 hours |
| $1,000 and up | Phone call plus letter | Executive Director | Call within 48 hours, letter within 1 week |
| First-time donor (any amount) | Add a welcome line and what to expect next | As above | As above |

## Letter structure

1. Personal opening using the Informal Greeting. Name the hook.
2. The gift and what it supports (designation).
3. One concrete impact example from the approved list.
4. Warm close. No new ask.

Keep standard letters under 150 words and notes under 80 words.

## Rules

- Use the greeting fields from NPSP. Flag records that may list a deceased household member.
- Do not ask for another gift in a thank-you.
- Tax receipt language (amount, goods or services statement) belongs in the receipt. For receipt wording, defer to the donor-and-funder-relations skill if it is installed.
- For DAF gifts, thank the donor advisor by name but do not issue a tax receipt; the DAF sponsor already did.
- Do not mention gift amounts in anything that may be shared, such as a tribute notification.
