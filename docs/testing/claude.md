# Testing in Claude

_Last verified: 2026-11-10_

## Prerequisites

- A Salesforce org with the package installed ([Step 1](salesforce-orgs.md)).

## Claude.ai and Claude Desktop

**Requirements:** any plan, with code execution turned on. On Team and Enterprise plans, an owner must enable Skills in admin settings first.

**Connect to your org:** add Salesforce's hosted MCP server as a custom connector (Customize > Connectors). Use the server URL for your org type; Developer Edition orgs use the production URL. Guide: https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/

**Add the skill:**
1. Run `npm run export`.
2. Go to **Customize** > **Skills**, then **+** > **Upload a skill**, and choose `dist/zip/<skill>.zip`.

Docs: https://support.claude.com/en/articles/12512180

## Claude Code

Install the plugin from your local checkout, so you test your working copy:

```
/plugin marketplace add ./path/to/sf-community-skills
/plugin install nonprofit-individual-giving@sf-community-skills
```

Run `npm run build` first so the plugin copies are current. After editing a skill, rebuild and run `/plugin marketplace update sf-community-skills`.

To connect to your org, use a Salesforce MCP server or the Salesforce CLI (`sf org login web`).

## Test

Run the [test checklist](README.md#test-checklist) in a new conversation.
