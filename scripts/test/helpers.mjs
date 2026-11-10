// Builds throwaway repos in a temp dir for tests.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ROOT } from '../lib/repo.mjs';

export function skillMd({ name, description, metadata, body = '# Skill\n\nDo the thing.\n' }) {
  const meta = metadata ?? { packages: name.split('-')[0], version: '0.1.0', status: 'draft' };
  const metaLines = Object.entries(meta).map(([k, v]) => `  ${k}: ${typeof v === 'string' ? JSON.stringify(v) : v}`);
  return `---\nname: ${name}\ndescription: ${description ?? 'Does a thing for NPSP users. Use when someone asks for the thing.'}\nmetadata:\n${metaLines.join('\n')}\n---\n\n${body}`;
}

// Creates a repo with the real packages.json and package.json plus the given skills and plugins.
// skills: { [name]: { 'SKILL.md': string, 'references/x.md': string, ... } }
// plugins: { [name]: { yaml: string, readme?: string } }
export function makeRepo({ skills = {}, plugins = {}, evals = {} } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-test-'));
  fs.copyFileSync(path.join(ROOT, 'packages.json'), path.join(root, 'packages.json'));
  fs.copyFileSync(path.join(ROOT, 'package.json'), path.join(root, 'package.json'));
  for (const [name, files] of Object.entries(skills)) {
    for (const [rel, content] of Object.entries(files)) write(root, path.join('skills', name, rel), content);
  }
  for (const [name, { yaml, readme = '# Plugin\n' }] of Object.entries(plugins)) {
    write(root, path.join('plugins', name, 'plugin.yaml'), yaml);
    write(root, path.join('plugins', name, 'README.md'), readme);
  }
  for (const [name, content] of Object.entries(evals)) {
    write(root, path.join('evals', name, 'evals.json'), JSON.stringify(content));
  }
  return root;
}

export function write(root, rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}
