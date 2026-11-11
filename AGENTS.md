# AGENTS.md

Guidance for coding agents (and people) contributing to this repo. Read this before adding or changing a skill.

## What this repo is

A community-maintained collection of [Agent Skills](https://agentskills.io) for the open-source Salesforce packages used by nonprofits and education institutions, including community tools such as DLRS and the Summit Events App. Skills are consumed by several agents with different capabilities, so portability is the main design constraint.

| Agent | What it accepts |
|---|---|
| Claude Code, Codex | Plugins from this repo's marketplaces (full skill folders) |
| Claude.ai, ChatGPT, Gemini app | Uploaded skill zip (folder with SKILL.md and optional files) |
| Slackbot | One markdown instructions body; description max 400 characters; no scripts or extra files |
| Agentforce Coworker | Assumed to be like Slackbot (one markdown body); format not yet documented |

## Layout and sources of truth

- `skills/<name>/SKILL.md`: **source of truth** for every skill. A flat list; no nesting by plugin.
- `plugins/<name>/plugin.yaml`: **source of truth** for a plugin (metadata and the list of skills it includes).
- `plugins/<name>/README.md`: hand-written, except the block between `<!-- BEGIN GENERATED skills-table -->` markers.
- `packages.json`: registry of package prefixes, source repos, and namespaces.
- `evals/<name>/evals.json`: trigger and behavioral eval cases. `evals/fixtures/<prefix>/`: shared synthetic data.
- `docs/packages/<prefix>/README.md` (hand-written) and `data-model.md` (generated): package knowledge.

**Generated, never edit by hand:** `plugins/*/skills/`, `plugins/*/.claude-plugin/`, `plugins/*/.codex-plugin/`, `.claude-plugin/marketplace.json`, `.agents/plugins/marketplace.json`, generated README table blocks, `docs/packages/*/data-model.md`. Run `npm run build` (or `npm run docs:packages`) instead.

## Commands

```
npm run new -- <prefix>-<topic>   scaffold a skill and its evals
npm run validate                  spec + portability lint (must pass)
npm run build                     regenerate plugin copies, manifests, tables
npm run build:check               fail if generated files are stale (CI)
npm test                          tooling tests
npm run export                    dist/zip/*.zip and dist/flat/*.md
npm run eval -- --triggers        routing check across all skill descriptions (needs an API key)
npm run eval -- <skill>           behavioral eval, with vs. without the skill (needs an API key)
                                  add --provider claude-cli to use a Claude Code login instead of an API key
npm run docs:packages [-- <prefix>]  regenerate package data-model docs from source repos
```

After changing anything under `skills/`, `plugins/`, or `packages.json`, run `npm run validate && npm run build` and commit the generated changes.

## Skill conventions

**Naming**
- `<prefix>-<topic>` in lowercase kebab-case, max 64 characters, matching the folder name.
- The prefix must be registered in `packages.json`: `npsp`, `eda`, `pmm`, `v4s`, `mem`, `ggk`, `dlrs`, `sea` (active), `ofm` (candidate).
- A skill that spans packages takes the prefix of the package it depends on most, and lists every package in `metadata.packages`.
- To add a package, add it to `packages.json` (with `sources` for each namespace) and create `docs/packages/<prefix>/README.md`.

**Frontmatter** (only spec keys are allowed at the top level)

```yaml
---
name: npsp-donor-thank-you-notes
description: What it does and for whom, naming the package. Use when someone says "...", or shares .... (max 400 chars)
metadata:
  packages: npsp            # comma-separated prefixes
  version: 0.1.0            # semver; bump on behavior changes
  status: draft             # draft | stable (stable requires behavioral evals)
---
```

All `metadata` values must be strings. `license` and `compatibility` are optional. Avoid `allowed-tools`; most target agents ignore it.

**Body**
- Max 500 lines. It must work on its own: Slackbot and Coworker get only this text.
- `references/` files are allowed for long lookup material; `npm run export` inlines them for single-file agents. Keep the essential instructions in SKILL.md.
- `scripts/` is allowed only with a `## Without scripts` section explaining how to do the job when scripts cannot run.
- No agent-specific syntax (`${CLAUDE_PLUGIN_ROOT}`, `$ARGUMENTS`, slash commands, tool names). Say "the assistant", not a product name.
- Work both with and without a Salesforce connection: ask the user to paste or export data when no connection is available.
- Refer to other skills by their full name (e.g. `npsp-donor-thank-you-notes`); validation checks they exist.
- Use real object and field labels and API names from `docs/packages/<prefix>/data-model.md`. Check picklist values there too; do not guess them.

**Content rules**
- No real donor, client, student, or volunteer data anywhere: skills, fixtures, evals, or examples. Use the fictional surnames in `evals/fixtures/npsp/README.md`.
- Skills must tell the assistant never to invent statistics, impact numbers, record facts, or org-specific codes (Campaigns, GAUs, stages). Ask, or use a marked placeholder.
- State defaults explicitly ("thank donors within 48 hours") and let the org override them.

## Package knowledge

Before writing or reviewing a skill for a package, read:
1. `docs/packages/<prefix>/README.md`: concepts, common gotchas, and help-site links.
2. `docs/packages/<prefix>/data-model.md`: generated objects and fields with namespaces, types, lookups, picklist values, and help text. Search it for the objects your skill touches.
3. The source repos listed in `packages.json` when you need more (Apex behavior, triggers, settings). Object metadata is under `force-app/**/objects/` (SFDX format) or `src/objects/*.object` (legacy format, e.g. V4S).

NPSP spans several namespaces from separate repos: `npsp`, `npe01` (contacts and payments), `npo02` (households and rollups), `npe03` (recurring donations), `npe4` (relationships), and `npe5` (affiliations).

Some namespaces differ from the skill prefix: the Summit Events App (`sea`) uses `summit`, Grants Content Kit (`ggk`) uses `GCKit`, and V4S (`v4s`) uses `GW_Volunteers`.

## Evals

Each skill needs `evals/<name>/evals.json`:

```json
{
  "skill_name": "npsp-example",
  "triggers": {
    "should_trigger": ["realistic requests this skill should handle"],
    "should_not_trigger": ["nearby requests it should not handle"]
  },
  "evals": [
    {
      "id": 1,
      "prompt": "the user's request",
      "files": ["evals/fixtures/npsp/recent-gifts-report.csv"],
      "expected_output": "one sentence describing a good response",
      "expectations": ["specific, checkable statements a grader can verify"]
    }
  ]
}
```

Reuse fixtures in `evals/fixtures/<prefix>/` before creating new ones. See `docs/evaluation.md`.

## Pull requests

- Keep PRs to one skill or one focused change when possible.
- Fill in the PR template checklist, including domain review.
- CI must pass: `validate`, `build:check`, and `test`.
