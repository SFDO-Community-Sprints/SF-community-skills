# Testing in Gemini

_Last verified: 2026-11-10_

## Prerequisites

- A Salesforce org with the package installed ([Step 1](salesforce-orgs.md)).

## Gemini app

1. Run `npm run export`.
2. In Gemini, go to **Settings** > **Skills** > **Upload** and choose `dist/zip/<skill>.zip`.

Docs: https://support.google.com/gemini/answer/18560919

The Gemini app has no built-in Salesforce connection, so test the paste-or-export path: give it data exported from your org.

## Gemini CLI

Copy or link the skill folder into `.gemini/skills/` (or `.agents/skills/`) in your working directory:

```
mkdir -p .gemini/skills && cp -R path/to/sf-community-skills/skills/<skill> .gemini/skills/
```

Docs: https://geminicli.com/docs/cli/skills/

To connect to your org, configure a Salesforce MCP server in the Gemini CLI settings.

## Test

Run the [test checklist](README.md#test-checklist).
