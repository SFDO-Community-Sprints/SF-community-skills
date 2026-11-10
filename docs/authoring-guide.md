# Authoring guide

How to write a skill that works well in every agent this repo targets. The rules that tooling enforces are in [AGENTS.md](../AGENTS.md); this guide covers judgment.

## Start from a real job

A good skill does one job a real person does on a schedule or in response to an event: prepping for a donor meeting, processing a gift batch, reviewing a pipeline. Write down:

- **Who** uses it (persona and department).
- **When** they reach for it, in their own words. These phrases go in the description.
- **What they hand over**: pasted notes, a report export, a record.
- **What they get back**: a document, a checklist, a draft message, a list of record updates.

If you can't name a concrete output, the skill is probably too broad.

## Structure

The template (`templates/SKILL.template.md`) uses the structure that works best across agents:

1. **Title and one-paragraph purpose.** State the package by name ("The organization uses Salesforce NPSP").
2. **Inputs.** What the skill needs, named with real package labels. Say what to ask for when something is missing.
3. **Steps.** Numbered and specific. Name the objects and fields involved.
4. **Rules.** Defaults (with "unless the org has its own standard"), privacy rules, and things never to do.
5. **Output template.** A fenced block showing the exact shape of the result.

Keep it under about 150 lines when you can. Long skills cost tokens in every conversation where they load and are harder to review.

## The description does the routing

Agents decide whether to load a skill from its description alone. Slackbot caps it at 400 characters.

- Lead with what the skill produces and for whom, and name the package.
- Follow with "Use when ..." and 3 to 5 phrases people actually say.
- Mention the inputs people share ("or shares an NPSP report of recent gifts").
- Avoid overlap with neighboring skills. If two skills could claim the same request, sharpen both descriptions and add the request to one skill's `should_not_trigger` list.

## Portability checklist

- [ ] Works from SKILL.md alone (no required scripts or reference files).
- [ ] Works with no Salesforce connection: asks the user to paste or export data.
- [ ] Works with a connection: says which records to read, without naming a specific tool.
- [ ] No product names for the assistant ("the assistant", not "Claude" or "ChatGPT").
- [ ] Object, field, and picklist names match `docs/packages/<prefix>/data-model.md`.

## Accuracy and safety

- **Never invent facts.** Tell the assistant to mark unknowns as "Not in record", and to ask for org-specific lists (Campaigns, GAUs, stages, approval thresholds) instead of making them up.
- **Never invent impact.** Thank-you notes and reports must use impact statements the user supplies, or a marked placeholder.
- **Treat records as discoverable.** Constituents can request their records. Skills that write notes to Salesforce should keep them factual and leave sensitive personal details out.
- **Protect sensitive data.** Wealth screening data, health information, and similar details should not appear in outputs that leave the team that owns them.

## Working with package data models

Search `docs/packages/<prefix>/data-model.md` for each object the skill touches. Check:

- The label users see (use it in prose) and the API name (use it when giving connected agents precise instructions).
- Picklist values. For example, NPSP's Tribute Type values are `Honor` and `Memorial`.
- Which namespace a field comes from. NPSP household rollups such as Total Gifts are `npo02__` fields on Account and Contact.

Add anything you learned that isn't obvious from the data model (gotchas, common customizations) to `docs/packages/<prefix>/README.md`.
