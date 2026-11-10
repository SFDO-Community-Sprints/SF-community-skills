# Testing in Codex

_Last verified: 2026-11-10_

## Prerequisites

- A Salesforce org with the package installed ([Step 1](salesforce-orgs.md)).
- The Codex CLI.

## Add the plugin

Run `npm run build` first so the plugin copies are current, then add the marketplace from your local checkout:

```
codex plugin marketplace add ./path/to/sf-community-skills
```

Then install the plugin you want to test:

```
codex plugin add nonprofit-individual-giving@sf-community-skills
```

You can also browse and install from `/plugins` inside Codex. After editing a skill, run `npm run build`, then `codex plugin remove` and `codex plugin add` again to pick up the changes.

Docs: https://developers.openai.com/codex/plugins/build/

## Connect to your org

Configure a Salesforce MCP server in Codex, or use the Salesforce CLI.

## Test

Run the [test checklist](README.md#test-checklist).
