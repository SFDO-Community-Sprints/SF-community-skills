---
name: npsp-gift-processing
description: Guides entry of a donation batch into Salesforce NPSP Gift Entry (donor matching, coding, soft credits, tributes, pledge payments, DAF and stock gifts) and a batch summary for finance. Use when someone says "process today's checks", "enter this online giving payout", "we got a stock gift", "how do I enter a DAF gift", or shares check scans, a deposit slip, or a giving platform export.
metadata:
  packages: npsp
  version: 0.1.0
  status: draft
---

# Gift Processing

Walk the user through entering a batch of gifts correctly in Salesforce NPSP and produce a batch summary for finance. Prepare the entries and checks; the user enters them in NPSP unless a Salesforce connector with write access is connected.

## Inputs

- Check scans and deposit slip, online giving export (Stripe, PayPal, Classy, etc.), DAF grant letters, stock transfer notices, matching gift notices
- The org's Campaign list and GAU list. Ask for these if not provided. Do not invent codes.

## Steps

1. **Set up the batch.** Batch name (date plus source, e.g. 2026-11-09 Checks), expected gift count, expected total from the deposit or payout.
2. **Match each donor.** Search NPSP by name, email, and address before creating any Contact. Flag likely duplicates instead of creating new records.
3. **Enter gift details.** Amount, Close Date (date received), Payment Method, check number or transaction ID.
4. **Code the gift.** Campaign, Opportunity Record Type (Donation, Major Gift, Matching Gift, In-Kind), and GAU Allocation. Restricted gifts must go to the GAU that matches the restriction.
5. **Add soft credits.** Spouse or household member, DAF advisor, board member or volunteer who solicited, employee for matching gifts.
6. **Add tribute details.** Honoree name, Tribute Type (Honor or Memorial), notification contact and address.
7. **Apply to existing commitments.** If the donor has an open pledge or Recurring Donation, apply the payment to it. Do not create a new Opportunity.
8. **Reconcile.** Batch count and total must match the deposit or payout. For online platforms, reconcile the gross amount and record fees as the org's finance policy requires.
9. **Produce the batch summary** for finance (template below).
10. **Hand off** new gifts to the npsp-donor-thank-you-notes skill.

## Special gift types

| Type | Donor of record | Soft credit | Tax receipt |
|---|---|---|---|
| Donor-advised fund (DAF) | DAF sponsor organization | Donor advisor | No. Send a thank-you without receipt language |
| Stock | Individual donor | As usual | Yes, describe shares; do not state a dollar value on the receipt |
| Matching gift | Employer or foundation | Employee | Receipt to the company per its process |
| In-kind | Individual or business | As usual | Describe items only; no dollar value |
| Pledge payment | Original pledge donor | As on the pledge | Yes, for the amount paid |

Stock value for internal records: average of the high and low price on the transfer date (IRS standard for publicly traded stock).

## Rules

- Gifts over $5,000 are flagged to the Development Director (default; ask what threshold the org uses).
- Receipts go out within 48 hours of entry unless the org has its own standard.
- Never create a new Contact without a duplicate check.
- Any gift that cannot be matched, coded, or reconciled goes on the exceptions list, not into NPSP with a guess.
- For receipt wording, defer to the donor-and-funder-relations skill if it is installed.

## Batch summary template

```
BATCH SUMMARY: [Batch name] | Entered by [name] | [date]

Gift count: N | Batch total: $X | Deposit/payout total: $X | Match: Yes/No

By payment method
| Method | Count | Amount |

By GAU
| GAU | Count | Amount |

Flagged for director (over threshold)
| Donor | Amount | Designation |

Exceptions (not entered)
| Item | Issue | Action needed |
```
