# Testing in ChatGPT

_Last verified: 2026-11-10_

ChatGPT accepts Agent Skills folders, so you can upload the skill zip as is.

## Prerequisites

- A Salesforce org with the package installed ([Step 1](salesforce-orgs.md)).
- A ChatGPT Business, Enterprise, or Edu workspace. Skills are in beta: a workspace admin must turn on **Skills** and **skill uploading** in workspace settings.

## Connect ChatGPT to your org

Use either:
- The Salesforce app from the ChatGPT apps directory, or
- Salesforce's hosted MCP server as a custom app (Settings > Apps > Create App, with developer mode on). Use the server URL for your org type (Developer Edition orgs use the production URL). Guide: https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/chatgpt.html

## Add the skill

1. Run `npm run export`.
2. In ChatGPT, open your profile menu > **Skills** > **Create** > **Upload from your computer**, and choose `dist/zip/<skill>.zip`.
3. Wait for ChatGPT to finish scanning the skill, then make sure it's enabled.

Docs: https://help.openai.com/en/articles/20001066

_Not yet confirmed: ChatGPT's size and description limits for uploaded skills._

## Test

Run the [test checklist](README.md#test-checklist) in a new chat.

To evaluate against OpenAI models without the ChatGPT UI, run `npm run eval -- <skill> --provider openai --model <model-id>`.
