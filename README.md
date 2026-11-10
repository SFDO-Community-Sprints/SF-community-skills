# Salesforce Nonprofit Community Skills

Community-maintained agent skills for the open-source Salesforce nonprofit and education packages: Nonprofit Success Pack, Education Data Architecture, Program Management Module, Volunteers for Salesforce, Membership Essentials, and the Grants Content Kit.

Salesforce maintains [forcedotcom/sf-skills](https://github.com/forcedotcom/sf-skills) for its commercial products. Skills for these open-source packages live here instead, maintained by the community of open-source contributors.

Skills follow the [Agent Skills](https://agentskills.io) format and are written to work across agents: Claude, ChatGPT, Slackbot, Agentforce Coworker, Codex, and Gemini.

## Packages covered

<!-- BEGIN GENERATED packages-table -->
| Prefix | Package | Status | Skills |
|---|---|---|---|
| `npsp` | [Nonprofit Success Pack](https://github.com/SalesforceFoundation/NPSP) | active | 5 |
| `eda` | [Education Data Architecture](https://github.com/SalesforceFoundation/EDA) | active | 0 |
| `pmm` | [Program Management Module](https://github.com/SalesforceFoundation/PMM) | active | 0 |
| `v4s` | [Volunteers for Salesforce](https://github.com/SalesforceFoundation/Volunteers-for-Salesforce) | active | 0 |
| `mem` | [Membership Essentials](https://github.com/SFDO-Community-Sprints/Membership-Essentials-App) | active | 0 |
| `ggk` | [Grants Content Kit (Grant Guides)](https://github.com/SFDO-Community/GrantGuides) | active | 0 |
| `ofm` | [Outbound Funds Module](https://github.com/SalesforceFoundation/OutboundFundsModule) | candidate | 0 |
<!-- END GENERATED packages-table -->

Every skill name starts with its package prefix, for example `npsp-gift-processing`.

## Plugins

Plugins group related skills for agents that support them (Claude and Codex). The same skills are also available individually.

<!-- BEGIN GENERATED plugins-table -->
| Plugin | Description | Skills |
|---|---|---|
| [nonprofit-individual-giving](plugins/nonprofit-individual-giving/README.md) | Skills for individual giving fundraisers at nonprofits using Salesforce NPSP, covering donor meeting prep and follow-up, thank-you notes, monthly pipeline review, and gift processing. | 5 |
<!-- END GENERATED plugins-table -->

## Using the skills

| Agent | How skills get in |
|---|---|
| ChatGPT, Claude.ai, Gemini app | Upload a skill zip from the [latest release](../../releases/latest) |
| Slackbot, Agentforce Coworker | Paste a single-file skill from the release (`flat-skills.zip`), or copy `skills/<name>/SKILL.md` |
| Claude Code | `/plugin marketplace add SFDO-Community-Sprints/SF-community-skills`, then install a plugin |
| Codex | `codex plugin marketplace add SFDO-Community-Sprints/SF-community-skills`, then `codex plugin add <plugin>@sf-community-skills` |
| Any agent with the skills CLI | `npx skills add SFDO-Community-Sprints/SF-community-skills` |

End-user installation guides are maintained separately. To test skills while contributing, see [docs/testing](docs/testing/README.md).

## Repository structure

```
skills/                 One folder per skill: the source of truth. Edit skills here.
plugins/<name>/         plugin.yaml (edit) + README.md (edit) + generated manifests and skill copies
evals/                  Eval cases per skill, and shared synthetic fixtures
docs/packages/<prefix>/ Package notes (README.md) and generated data model (data-model.md)
docs/testing/           Setting up a Salesforce org and testing skills in each agent
docs/                   Authoring guide and evaluation guide
templates/              Starting point for new skills
scripts/                Validation, build, export, eval, and package-doc tooling (Node 22+)
packages.json           Package prefix registry
.claude-plugin/         Generated Claude marketplace
.agents/plugins/        Generated Codex marketplace
AGENTS.md               Conventions for coding agents (and humans) contributing here
```

Files marked generated are rebuilt by `npm run build`. Never edit them by hand; CI fails if they drift from their sources.

## Contributing: build, test, deploy

Setup: install Node 22 or later, then run `npm install`.

### 1. Build

1. Check [docs/packages](docs/packages) for the package's data model and notes. Skills must use real object and field names.
2. Scaffold the skill: `npm run new -- <prefix>-<topic>`, for example `npm run new -- pmm-service-delivery-summary`. This creates `skills/<name>/SKILL.md` and `evals/<name>/evals.json`.
3. Write the skill following the [authoring guide](docs/authoring-guide.md). Keep it portable: everything the skill needs must be in `SKILL.md`.
4. Add it to a plugin by listing it in `plugins/<plugin>/plugin.yaml` (optional; standalone skills are fine).
5. Run `npm run validate` and fix any errors.

### 2. Test

1. **Static checks:** `npm run validate` (spec and portability rules). This also runs in CI.
2. **Trigger checks:** add `should_trigger` and `should_not_trigger` prompts to `evals/<name>/evals.json`, then run `npm run eval -- --triggers`.
3. **Behavioral evals:** add cases with expectations, then run `npm run eval -- <name>`. This compares responses with and without the skill, graded by a model. Required before a skill is marked `stable`. Add `--provider claude-cli` to run on your Claude subscription instead of an API key.
4. **Real-agent testing:** set up a Salesforce org and try the skill in one or more agents, following [docs/testing](docs/testing/README.md).
5. **Domain review:** a practitioner reviews the output using the checklist in the pull request template.

See the [evaluation guide](docs/evaluation.md) for details, costs, and how to write good cases.

### 3. Deploy

1. Run `npm run build` to regenerate plugin copies, manifests, and tables, then commit everything.
2. Open a pull request. CI runs validation, the build check, and tests. A maintainer can add the `run-evals` label to run evals in CI.
3. On merge to `main`, the skills are live for anyone installing from the Claude or Codex marketplace.
4. Maintainers tag releases (`vX.Y.Z`). The release workflow attaches per-skill zips and `flat-skills.zip` for upload and copy-paste agents.

## Versioning

- Each skill has `metadata.version` (semver) and `metadata.status` (`draft` or `stable`). Bump the version when you change a skill's behavior.
- Each plugin has a `version` in `plugin.yaml`. Bump it when its skills change.

## License

[BSD 3-Clause](LICENSE)
