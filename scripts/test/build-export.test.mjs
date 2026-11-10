import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';
import { planBuild, diffBuild, writeBuild } from '../build.mjs';
import { flattenSkill, zipSkill } from '../export.mjs';
import { loadSkills } from '../lib/repo.mjs';
import { makeRepo, skillMd, write } from './helpers.mjs';

function repoWithPlugin() {
  return makeRepo({
    skills: {
      'npsp-one': { 'SKILL.md': skillMd({ name: 'npsp-one' }), 'references/guide.md': '# Guide\n\nDetails.\n' },
      'npsp-two': { 'SKILL.md': skillMd({ name: 'npsp-two' }) },
    },
    plugins: {
      'giving': {
        yaml: 'name: giving\ndisplayName: Giving\nversion: 0.2.0\ndescription: Giving skills.\nskills:\n  - npsp-one\n',
        readme: '# Giving\n\n<!-- BEGIN GENERATED skills-table -->\n<!-- END GENERATED skills-table -->\n',
      },
    },
  });
}

test('build copies only listed skills and writes both manifests and marketplaces', () => {
  const root = repoWithPlugin();
  const plan = planBuild(root);
  writeBuild(root, plan);
  const p = (rel) => path.join(root, rel);
  assert.ok(fs.existsSync(p('plugins/giving/skills/npsp-one/SKILL.md')));
  assert.ok(fs.existsSync(p('plugins/giving/skills/npsp-one/references/guide.md')));
  assert.ok(!fs.existsSync(p('plugins/giving/skills/npsp-two')));
  const codex = JSON.parse(fs.readFileSync(p('plugins/giving/.codex-plugin/plugin.json'), 'utf8'));
  assert.equal(codex.skills, './skills/');
  assert.equal(codex.version, '0.2.0');
  const claudeMarket = JSON.parse(fs.readFileSync(p('.claude-plugin/marketplace.json'), 'utf8'));
  assert.equal(claudeMarket.plugins[0].source, './plugins/giving');
  const codexMarket = JSON.parse(fs.readFileSync(p('.agents/plugins/marketplace.json'), 'utf8'));
  assert.deepEqual(codexMarket.plugins[0].source, { source: 'local', path: './plugins/giving' });
  assert.match(fs.readFileSync(p('plugins/giving/README.md'), 'utf8'), /\| \[npsp-one\]/);
  assert.deepEqual(diffBuild(root, planBuild(root)), []);
});

test('build check reports edited copies and stale skills', () => {
  const root = repoWithPlugin();
  writeBuild(root, planBuild(root));
  write(root, 'plugins/giving/skills/npsp-one/SKILL.md', 'edited by hand');
  write(root, 'plugins/giving/skills/npsp-old/SKILL.md', 'removed skill');
  const drift = diffBuild(root, planBuild(root)).join('\n');
  assert.match(drift, /changed\s+plugins\/giving\/skills\/npsp-one\/SKILL.md/);
  assert.match(drift, /stale\s+plugins\/giving\/skills\/npsp-old\/SKILL.md/);
});

test('flat export inlines references and zip holds one folder', () => {
  const root = repoWithPlugin();
  const skill = loadSkills(root).find((s) => s.dirName === 'npsp-one');
  const flat = flattenSkill(skill);
  assert.match(flat, /^---\nname: npsp-one/);
  assert.match(flat, /Inlined from references\/guide.md -->\n\n# Guide/);
  const entries = Object.keys(unzipSync(zipSkill(skill))).sort();
  assert.deepEqual(entries, ['npsp-one/SKILL.md', 'npsp-one/references/guide.md']);
  assert.match(strFromU8(unzipSync(zipSkill(skill))['npsp-one/SKILL.md']), /name: npsp-one/);
});
