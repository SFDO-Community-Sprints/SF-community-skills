# Testing skills in real agents

Evals (see [evaluation.md](../evaluation.md)) test a skill against a model API. Before a skill is marked stable, also try it in the agents people will actually use, connected to a real Salesforce org.

Testing has two steps:

1. **[Set up a Salesforce org](salesforce-orgs.md)** with the package installed and some sample data.
2. **Add the skill to the agent(s) you want to test**, connect the agent to your org, and run the checklist below.

| Agent | Guide | Skill format | Org connection |
|---|---|---|---|
| Slackbot | [slackbot.md](slackbot.md) | Paste single-file markdown | Slackbot's Salesforce org access |
| ChatGPT | [chatgpt.md](chatgpt.md) | Upload skill zip | Salesforce app or hosted MCP server |
| Claude (claude.ai, Desktop, Code) | [claude.md](claude.md) | Upload skill zip, or install the plugin | Salesforce connector (hosted MCP server) |
| Agentforce Coworker | [agentforce-coworker.md](agentforce-coworker.md) | Paste single-file markdown | Native |
| Codex | [codex.md](codex.md) | Install the plugin | Salesforce MCP server |
| Gemini | [gemini.md](gemini.md) | Upload skill zip, or a skills folder (CLI) | MCP server (CLI) |

Build the skill files first:

```
npm run export
```

This writes `dist/zip/<skill>.zip` (for upload) and `dist/flat/<skill>.md` (for paste).

Agent UIs change often. Each guide has a "last verified" date; if you find a step that has changed, please update the guide in your PR.

## Test checklist

Run each skill through these checks and note the results in your pull request:

- [ ] **Triggers naturally.** A realistic request, phrased as a user would, activates the skill without naming it.
- [ ] **Doesn't over-trigger.** A nearby request (see the skill's `should_not_trigger` prompts) doesn't activate it.
- [ ] **Reads the right records.** With an org connection, the agent queries the objects and fields the skill names, and the values match the org.
- [ ] **Works without a connection.** With no org connection, the skill asks for pasted data or an export and works from that.
- [ ] **Follows the output template.**
- [ ] **Invents nothing.** No made-up impact statistics, record facts, Campaigns, GAUs, or stage names.
- [ ] **Respects write boundaries.** The agent proposes record updates for the user to approve rather than making them silently.

Note which agent and model you tested with, and anything that behaved differently from one agent to another.
