## Summary

<!-- What does this change and why? -->

## Skills changed

<!-- e.g. npsp-log-gifts (new), npsp-donor-thank-you-notes (updated, 0.1.0 → 0.2.0) -->

## Checklist

**Build**
- [ ] `npm run validate` passes
- [ ] `npm run build` run and generated files committed
- [ ] Object, field, and picklist names checked against `docs/packages/<prefix>/data-model.md`
- [ ] `metadata.version` bumped for changed skills; plugin `version` bumped if its skills changed

**Test**
- [ ] Trigger prompts added to `evals/<skill>/evals.json` (`npm run eval -- --triggers` results: ___ )
- [ ] Behavioral eval cases added or updated (`npm run eval -- <skill>` results: with skill ___ / without ___ )
- [ ] Tested in at least one real agent ([guide](../docs/testing/README.md)). Agent(s) and model(s): ___
- [ ] No real constituent data in skills, fixtures, or evals

**Domain review** (by someone who does this work)
- [ ] Matches how the package actually works (objects, fields, automation)
- [ ] Reflects sound practice for the role
- [ ] Handles privacy and sensitive data appropriately
- [ ] Never invents impact, record facts, or org-specific codes

Reviewer: @
