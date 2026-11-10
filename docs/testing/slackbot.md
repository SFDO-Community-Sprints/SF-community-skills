# Testing in Slackbot

_Last verified: 2026-11-10_

Slackbot skills are a single markdown body plus a short description (max 400 characters). Use the single-file export.

## Prerequisites

- A Salesforce org with the package installed ([Step 1](salesforce-orgs.md)).
- A Slack workspace on a paid plan. A Slack developer sandbox works for this (see below). _Not yet confirmed: whether Slackbot skills are enabled in every developer sandbox. If you test this, please update this note._

## Set up a Slack sandbox connected to your org

1. Sign up for the Slack developer program: https://docs.slack.dev/tools/developer-sandboxes/#sign-up
2. Provision a new Slack sandbox: https://docs.slack.dev/tools/developer-sandboxes/#provision
3. Grant Slackbot in the sandbox access to your Developer Edition org: https://slack.com/help/articles/47554511515283-Manage-Slackbot-access-to-connected-Salesforce-organizations#enterprise-plans-1
   - Use the **Enterprise** plan instructions when working in a Slack sandbox.

## Add the skill

1. Run `npm run export` and open `dist/flat/<skill>.md`.
2. In Slack, open Slackbot, go to the **Skills** tab, and choose **Add skill** > **Create a skill** > **Build from scratch**.
3. Fill in:
   - **Name:** the skill name, e.g. `npsp-donor-thank-you-notes`.
   - **Description:** the `description` from the file's frontmatter.
   - **Instructions / steps:** everything after the frontmatter (the second `---` line).
4. Save, then use **Use skill** to try it.

Docs: https://slack.com/help/articles/51448833927187

## Test

Run the [test checklist](README.md#test-checklist). Also check that Slackbot picks the skill from a natural request without you choosing it.
