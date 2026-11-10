# Evaluating skills

Skills are evaluated in tiers, from free and automatic to manual and expert. Each tier catches different problems.

| Tier | What it catches | When | Cost |
|---|---|---|---|
| 1. Static validation | Spec violations, portability problems, broken references | Every PR (CI) | Free |
| 2. Trigger routing | Weak or overlapping descriptions | Every new or changed skill | Cents |
| 3. Behavioral evals | Skills that don't change behavior, or change it wrongly | Before `status: stable` | Under a dollar per skill, typically |
| 4. Real-agent testing | Problems specific to an agent or a real org | New skills; major changes | Your time |
| 5. Domain review | Bad nonprofit practice, wrong data model, privacy issues | Every PR | Your time |
| 6. SkillsBench (optional) | Benchmark-grade, deterministic scoring | Skills with verifiable outputs | Docker + API keys |

## 1. Static validation

`npm run validate` checks every skill against the Agent Skills spec and this repo's rules (see [AGENTS.md](../AGENTS.md)). CI also runs the reference `skills-ref` validator from agentskills.io.

## 2. Trigger routing

Agents choose skills from their descriptions, so a skill with a weak description never runs. In `evals/<name>/evals.json`:

```json
"triggers": {
  "should_trigger": ["Can you write thank-yous for this week's gifts?"],
  "should_not_trigger": ["Write a thank-you email to our volunteers"]
}
```

`npm run eval -- --triggers` shows a model the descriptions of every skill in the repo and asks which one fits each prompt. A `should_trigger` prompt passes when it picks this skill; a `should_not_trigger` prompt passes when it picks anything else. Because the whole catalog is in play, this also catches collisions between skills, which matters more as the catalog grows across packages.

Good `should_not_trigger` prompts are near misses: a similar request in another domain, or a request another skill should take.

## 3. Behavioral evals

Each case is a realistic request plus a list of checkable expectations:

```json
{
  "id": 1,
  "prompt": "Here's this week's gifts report. Please draft the thank-yous.",
  "files": ["evals/fixtures/npsp/recent-gifts-report.csv"],
  "expected_output": "Tiered drafts, a tribute notification without the amount, and an acknowledgment update list.",
  "expectations": [
    "There is a separate notification to Alex Testwell that does not state the gift amount",
    "Impact statistics are not invented"
  ]
}
```

`npm run eval -- <skill>` runs each case twice, once with the skill loaded and once without (the baseline), and a model grades each expectation. The report shows pass counts for both. A good skill passes most expectations with the skill and clearly beats the baseline. If the baseline already passes everything, the expectations aren't testing what the skill adds.

The format matches the `evals.json` used by Anthropic's skill-creator skill, so you can also iterate with that tool.

**Writing good expectations**
- Make each one independently checkable from the response alone: "The DAF gift's donor of record is the fund", not "Handles DAFs correctly".
- Test what the skill adds: org defaults, package-specific handling, safety rules.
- Include at least one "does not invent" check.
- Five to ten expectations per case; two or three cases per skill.

**Options:** `--provider openai --model <id>` runs against OpenAI instead of Anthropic (useful because ChatGPT is a target). `--judge-model` picks a different grader. `--no-baseline` halves the cost while iterating. Results are saved to `eval-results/` (git-ignored).

**API keys:** set `ANTHROPIC_API_KEY` (or log in with `ant auth login`), or `OPENAI_API_KEY`. In CI, a maintainer adds the `run-evals` label to a PR to run evals for the skills it changes, using the repo's secret. That only works for branches in this repo, because GitHub doesn't share secrets with fork PRs. For fork PRs, a maintainer runs evals locally.

## Test data

Getting realistic domain data is the hardest part. The approach here:

- **Shared synthetic fixtures** in `evals/fixtures/<prefix>/`, shaped like real report exports with real field labels and entirely fictional people. Reuse these before creating new ones; a new skill should usually need zero new fixtures.
- **Small and hand-checkable.** A reviewer should be able to verify a good answer by reading the fixture (e.g. the check batch totals $9,375).
- **Practitioner-sourced cases.** People who do the work know the edge cases. The "Eval case" issue form lets anyone describe "given this input, a good answer must..." in plain language, and maintainers turn it into JSON.
- **Sprint sessions.** Community Sprints are a good place to run eval-writing sessions where practitioners and developers pair up.

Never use real constituent data, even anonymized exports from a real org.

## 4. Real-agent testing

Evals call a model API directly. Real agents add their own system prompts, skill loading, and Salesforce connections. See [testing/README.md](testing/README.md) to set up an org and test in each agent.

## 5. Domain review

Every PR that adds or changes a skill needs a review from someone who knows the work. The PR template's checklist covers:

- The skill matches how the package actually works (objects, fields, automation).
- The process reflects sound practice for the role.
- Privacy and sensitive-data handling are right.
- Nothing is invented: impact, facts, codes.

## 6. SkillsBench (optional)

[SkillsBench](https://github.com/benchflow-ai/skillsbench) benchmarks skills with deterministic pytest verifiers in Docker. It doesn't suit prose outputs like thank-you notes, but it fits skills with verifiable outputs. For example, an `npsp-gift-processing` task could require a batch summary CSV whose totals and donor-of-record assignments are checked exactly. Contributing a task there is a good way to get broader visibility for a mature skill. Follow the SkillsBench contributing guide; nothing in this repo's CI depends on it.
