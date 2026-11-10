---
name: {{name}}
description: One or two sentences on what this skill produces for whom, naming the package (for example "Salesforce NPSP"). Use when someone says "...", "...", or shares .... Keep this under 400 characters.
metadata:
  packages: {{prefix}}
  version: 0.1.0
  status: draft
---

# {{title}}

One paragraph on the job this skill does and who it is for. The organization uses {{packageName}}.

## Inputs

- What the user provides (pasted data, a report export, notes)
- Which records or fields matter, by their package names

If a required input is missing, ask for it. If the assistant has a Salesforce connection, it can read the records directly; otherwise ask the user to paste or export them.

## Steps

1. ...
2. ...

## Rules

- Defaults the org can override (state them, and say "unless the org has its own standard").
- Never invent statistics, donor or client facts, or codes such as Campaigns or GAUs. Mark unknowns as "Not in record."

## Output template

```
...
```
