# Testing in Agentforce Coworker

_Last verified: 2026-11-10_

Agentforce Coworker reads Salesforce data natively, with each user's own permissions. Its skill format isn't publicly documented yet, so this guide assumes it works like Slackbot: one markdown body.

## Prerequisites

- An org edition that supports Coworker: Enterprise, Unlimited, Agentforce 1, or Salesforce Foundations. _Not yet confirmed: whether a Developer Edition org (such as the NPSP Trailhead org) can run Coworker. If you find out, please update this guide._
- The package installed in that org ([Step 1](salesforce-orgs.md)).
- Coworker turned on, with the Agentforce Coworker Admin permission set assigned to the admin and access granted to test users.

Overview: https://trailhead.salesforce.com/content/learn/modules/quick-start-agentforce-coworker/explore-agentforce-coworker

## Add the skill

1. Run `npm run export` and open `dist/flat/<skill>.md`.
2. In Coworker, start a conversation and paste the instructions (everything after the frontmatter). Run through a test request.
3. Save the conversation as a reusable Skill.

_The exact steps for creating a skill are not yet documented. Please update this section once confirmed._

## Test

Run the [test checklist](README.md#test-checklist). Pay attention to record updates: Coworker may be allowed to write records, so confirm it asks before changing data.
