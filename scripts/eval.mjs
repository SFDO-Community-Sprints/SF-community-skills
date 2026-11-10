// Runs skill evals against a model API.
//
//   npm run eval -- --triggers                 routing check: does the catalog of descriptions pick the right skill?
//   npm run eval -- <skill-name> [...]         behavioral check: with-skill vs. no-skill, graded by an LLM judge
//
// Options:
//   --provider anthropic|openai   (default: anthropic; needs ANTHROPIC_API_KEY or OPENAI_API_KEY)
//   --model <id>                  model that runs the cases (default: claude-sonnet-5-5 for anthropic; OPENAI_MODEL for openai)
//   --judge-model <id>            model that grades (default: same as --model)
//   --no-baseline                 skip the no-skill run
//
// Results are written to eval-results/ (git-ignored).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadSkills, readJsonIfExists, isMain } from './lib/repo.mjs';

function parseArgs(argv) {
  const opts = { provider: 'anthropic', baseline: true, triggers: false, skills: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--provider') opts.provider = argv[++i];
    else if (arg === '--model') opts.model = argv[++i];
    else if (arg === '--judge-model') opts.judgeModel = argv[++i];
    else if (arg === '--no-baseline') opts.baseline = false;
    else if (arg === '--triggers') opts.triggers = true;
    else opts.skills.push(arg);
  }
  return opts;
}

// A provider exposes complete({ model, system, user, schema }) -> string (JSON text when schema is given).
export async function makeProvider(name) {
  if (name === 'anthropic') {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();
    return {
      defaultModel: 'claude-sonnet-5-5',
      async complete({ model, system, user, schema }) {
        const response = await client.beta.messages.create({
          model,
          max_tokens: 16000,
          // On a safety decline, the API retries on a fallback model instead of stopping.
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
          ...(system ? { system } : {}),
          messages: [{ role: 'user', content: user }],
          ...(schema ? { output_config: { format: { type: 'json_schema', schema } } } : {}),
        });
        if (response.stop_reason === 'refusal') {
          throw new Error(`model declined (${response.stop_details?.category ?? 'no category'})`);
        }
        return response.content
          .filter((block) => block.type === 'text')
          .map((block) => block.text)
          .join('');
      },
    };
  }
  if (name === 'openai') {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI();
    return {
      defaultModel: process.env.OPENAI_MODEL,
      async complete({ model, system, user, schema }) {
        const response = await client.responses.create({
          model,
          ...(system ? { instructions: system } : {}),
          input: user,
          ...(schema ? { text: { format: { type: 'json_schema', name: 'result', schema, strict: true } } } : {}),
        });
        return response.output_text;
      },
    };
  }
  throw new Error(`Unknown provider "${name}". Use anthropic or openai.`);
}

// How the skill is presented to the model: the full SKILL.md, as an agent would load it.
function skillSystemPrompt(skill) {
  return `You have the following skill available. Follow it when it applies to the user's request.\n\n<skill name="${skill.dirName}">\n${skill.text}\n</skill>`;
}

function userMessage(evalCase) {
  let message = evalCase.prompt;
  for (const rel of evalCase.files ?? []) {
    const content = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    message += `\n\n<attached_file name="${path.basename(rel)}">\n${content}\n</attached_file>`;
  }
  return message;
}

const GRADE_SCHEMA = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          expectation: { type: 'string' },
          passed: { type: 'boolean' },
          evidence: { type: 'string' },
        },
        required: ['expectation', 'passed', 'evidence'],
        additionalProperties: false,
      },
    },
  },
  required: ['results'],
  additionalProperties: false,
};

async function grade(provider, model, evalCase, output) {
  const list = evalCase.expectations.map((e, i) => `${i + 1}. ${e}`).join('\n');
  const text = await provider.complete({
    model,
    system:
      'You grade an assistant response against a list of expectations. Judge each expectation independently and strictly: pass only if the response clearly meets it. Quote or paraphrase the part of the response that decides it as evidence.',
    user: `<user_request>\n${evalCase.prompt}\n</user_request>\n\n<response>\n${output}\n</response>\n\n<expectations>\n${list}\n</expectations>\n\nReturn one result per expectation, in order.`,
    schema: GRADE_SCHEMA,
  });
  return JSON.parse(text).results;
}

export async function runBehavioral(provider, opts, skill) {
  const evals = readJsonIfExists(path.join(ROOT, 'evals', skill.dirName, 'evals.json'));
  if (!evals?.evals?.length) {
    console.log(`${skill.dirName}: no behavioral cases in evals.json, skipping`);
    return null;
  }
  const modes = opts.baseline ? ['with_skill', 'without_skill'] : ['with_skill'];
  const cases = [];
  for (const evalCase of evals.evals) {
    const user = userMessage(evalCase);
    const runs = await Promise.all(
      modes.map(async (mode) => {
        const system = mode === 'with_skill' ? skillSystemPrompt(skill) : undefined;
        const output = await provider.complete({ model: opts.model, system, user });
        const results = await grade(provider, opts.judgeModel, evalCase, output);
        return [mode, { output, results, passed: results.filter((r) => r.passed).length }];
      }),
    );
    const byMode = Object.fromEntries(runs);
    const total = evalCase.expectations.length;
    const summary = modes.map((m) => `${m.replace('_', ' ')} ${byMode[m].passed}/${total}`).join(' | ');
    console.log(`  case ${evalCase.id}: ${summary}`);
    for (const r of byMode.with_skill.results.filter((r) => !r.passed)) console.log(`    FAIL (with skill): ${r.expectation}`);
    cases.push({ id: evalCase.id, total, ...byMode });
  }
  const sum = (mode) => cases.reduce((n, c) => n + (c[mode]?.passed ?? 0), 0);
  const total = cases.reduce((n, c) => n + c.total, 0);
  const report = { with_skill: `${sum('with_skill')}/${total}` };
  if (opts.baseline) report.without_skill = `${sum('without_skill')}/${total}`;
  console.log(`${skill.dirName}: ${Object.entries(report).map(([k, v]) => `${k.replace('_', ' ')} ${v}`).join(' | ')}`);
  return { skill: skill.dirName, report, cases };
}

const ROUTE_SCHEMA = {
  type: 'object',
  properties: { skill: { type: 'string' } },
  required: ['skill'],
  additionalProperties: false,
};

export async function runTriggers(provider, opts, skills) {
  const catalog = skills.map((s) => `- ${s.dirName}: ${s.frontmatter.description}`).join('\n');
  const system = `You route user requests to skills. Available skills:\n${catalog}\n\nReturn the name of the one skill that should handle the request, or "none" if no skill fits.`;
  const results = [];
  for (const skill of skills) {
    const triggers = readJsonIfExists(path.join(ROOT, 'evals', skill.dirName, 'evals.json'))?.triggers;
    if (!triggers) continue;
    const cases = [
      ...(triggers.should_trigger ?? []).map((prompt) => ({ prompt, expect: true })),
      ...(triggers.should_not_trigger ?? []).map((prompt) => ({ prompt, expect: false })),
    ];
    for (const c of cases) {
      const picked = JSON.parse(await provider.complete({ model: opts.model, system, user: c.prompt, schema: ROUTE_SCHEMA })).skill;
      const passed = (picked === skill.dirName) === c.expect;
      results.push({ skill: skill.dirName, ...c, picked, passed });
      if (!passed) {
        console.log(`  FAIL ${skill.dirName}: "${c.prompt}" -> ${picked} (expected ${c.expect ? skill.dirName : `not ${skill.dirName}`})`);
      }
    }
  }
  const passed = results.filter((r) => r.passed).length;
  console.log(`Trigger routing: ${passed}/${results.length} passed`);
  return { report: `${passed}/${results.length}`, results };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const provider = await makeProvider(opts.provider);
  opts.model ??= provider.defaultModel;
  opts.judgeModel ??= opts.model;
  if (!opts.model) {
    console.error('No model set. Pass --model <id> (or set OPENAI_MODEL for the openai provider).');
    process.exit(1);
  }
  const all = loadSkills(ROOT).filter((s) => !s.error);
  if (!opts.triggers && opts.skills.length === 0) {
    console.error('Usage: npm run eval -- --triggers | <skill-name> [...]');
    process.exit(1);
  }
  const unknown = opts.skills.filter((name) => !all.some((s) => s.dirName === name));
  if (unknown.length) {
    console.error(`Unknown skill(s): ${unknown.join(', ')}`);
    process.exit(1);
  }

  const output = { provider: opts.provider, model: opts.model, judgeModel: opts.judgeModel, ranAt: new Date().toISOString() };
  if (opts.triggers) output.triggers = await runTriggers(provider, opts, all);
  output.skills = [];
  for (const name of opts.skills) {
    console.log(`\n${name}`);
    const result = await runBehavioral(provider, opts, all.find((s) => s.dirName === name));
    if (result) output.skills.push(result);
  }

  const dir = path.join(ROOT, 'eval-results');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${output.ranAt.replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(file, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`\nFull results: ${path.relative(ROOT, file)}`);
}

if (isMain(import.meta.url)) {
  main().catch((err) => {
    if (/authentication|api key|apiKey/i.test(err.message)) {
      console.error(
        'No API credentials found. Set ANTHROPIC_API_KEY (or run `ant auth login`), or use --provider openai with OPENAI_API_KEY.',
      );
    } else {
      console.error(err.message);
    }
    process.exit(1);
  });
}
