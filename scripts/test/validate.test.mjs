import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRepo } from '../validate.mjs';
import { makeRepo, skillMd } from './helpers.mjs';

const triggers = { triggers: { should_trigger: ['do the thing'] } };

function errorsFor(skills, extra = {}) {
  return validateRepo(makeRepo({ skills, ...extra })).errors.join('\n');
}

test('a well-formed skill passes', () => {
  const root = makeRepo({
    skills: { 'npsp-good-skill': { 'SKILL.md': skillMd({ name: 'npsp-good-skill' }) } },
    evals: { 'npsp-good-skill': triggers },
  });
  const { errors, warnings } = validateRepo(root);
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test('the real repo passes', () => {
  assert.deepEqual(validateRepo().errors, []);
});

test('unregistered prefix is an error', () => {
  assert.match(errorsFor({ 'abc-thing': { 'SKILL.md': skillMd({ name: 'abc-thing', metadata: { packages: 'npsp', version: '0.1.0', status: 'draft' } }) } }), /prefix "abc" is not registered/);
});

test('name must match folder', () => {
  assert.match(errorsFor({ 'npsp-folder': { 'SKILL.md': skillMd({ name: 'npsp-other' }) } }), /must match folder name/);
});

test('description over 400 characters is an error', () => {
  const description = `${'x'.repeat(390)} Use when y.`;
  assert.match(errorsFor({ 'npsp-long': { 'SKILL.md': skillMd({ name: 'npsp-long', description }) } }), /max 400/);
});

test('description without "Use when" is an error', () => {
  assert.match(errorsFor({ 'npsp-vague': { 'SKILL.md': skillMd({ name: 'npsp-vague', description: 'Helps with things.' }) } }), /Use when/);
});

test('reference to a missing skill is an error', () => {
  const body = 'Hand off to the npsp-does-not-exist skill.\n';
  assert.match(errorsFor({ 'npsp-ref': { 'SKILL.md': skillMd({ name: 'npsp-ref', body }) } }), /references skill "npsp-does-not-exist"/);
});

test('scripts without a fallback section is an error', () => {
  const errors = errorsFor({ 'npsp-scripted': { 'SKILL.md': skillMd({ name: 'npsp-scripted' }), 'scripts/run.py': 'print(1)\n' } });
  assert.match(errors, /Without scripts/);
});

test('agent-specific syntax is an error and agent names are a warning', () => {
  const body = 'Run ${CLAUDE_PLUGIN_ROOT}/x. Claude will do it.\n';
  const { errors, warnings } = validateRepo(makeRepo({ skills: { 'npsp-agent': { 'SKILL.md': skillMd({ name: 'npsp-agent', body }) } } }));
  assert.match(errors.join('\n'), /agent-specific syntax/);
  assert.match(warnings.join('\n'), /mentions "Claude"/);
});

test('non-string metadata and unknown frontmatter keys are errors', () => {
  const md = skillMd({ name: 'npsp-meta', metadata: { packages: 'npsp', version: '0.1.0', status: 'draft', count: 3 } }).replace(
    'metadata:',
    'owner: someone\nmetadata:',
  );
  const errors = errorsFor({ 'npsp-meta': { 'SKILL.md': md } });
  assert.match(errors, /metadata.count must be a string/);
  assert.match(errors, /"owner" is not in the Agent Skills spec/);
});

test('stable status requires behavioral evals', () => {
  const md = skillMd({ name: 'npsp-stable', metadata: { packages: 'npsp', version: '1.0.0', status: 'stable' } });
  assert.match(errorsFor({ 'npsp-stable': { 'SKILL.md': md } }, { evals: { 'npsp-stable': triggers } }), /requires behavioral cases/);
});

test('plugin listing a missing skill is an error', () => {
  const errors = errorsFor(
    {},
    { plugins: { 'my-plugin': { yaml: 'name: my-plugin\ndisplayName: My Plugin\nversion: 0.1.0\ndescription: x\nskills:\n  - npsp-missing\n' } } },
  );
  assert.match(errors, /lists skill "npsp-missing"/);
});
