// Exports every skill in two distribution formats:
//   dist/zip/<name>.zip   one folder with SKILL.md (+ extras), for upload to ChatGPT, Claude.ai, and the Gemini app
//   dist/flat/<name>.md   a single markdown file with references inlined, for pasting into Slackbot and Agentforce Coworker
// Usage: npm run export [-- <skill-name> ...]
import fs from 'node:fs';
import path from 'node:path';
import { zipSync } from 'fflate';
import { ROOT, loadSkills, isMain } from './lib/repo.mjs';

// Fixed timestamp so repeated exports produce identical zips.
const ZIP_MTIME = new Date('2020-01-01T00:00:00Z');

export function zipSkill(skill) {
  const entries = {};
  for (const rel of skill.files) {
    const zipPath = [skill.dirName, ...rel.split(path.sep)].join('/');
    entries[zipPath] = [new Uint8Array(fs.readFileSync(path.join(skill.dir, rel))), { mtime: ZIP_MTIME }];
  }
  return zipSync(entries, { level: 9 });
}

export function flattenSkill(skill) {
  const references = skill.files.filter((f) => f.startsWith(`references${path.sep}`) && f.endsWith('.md'));
  const omitted = skill.files.filter((f) => f !== 'SKILL.md' && !references.includes(f));
  let out = skill.text.trimEnd();
  for (const rel of references) {
    const content = fs.readFileSync(path.join(skill.dir, rel), 'utf8').trim();
    out += `\n\n---\n\n<!-- Inlined from ${rel.split(path.sep).join('/')} -->\n\n${content}`;
  }
  if (omitted.length) {
    out += `\n\n<!-- Omitted from this single-file export: ${omitted.map((f) => f.split(path.sep).join('/')).join(', ')} -->`;
  }
  return `${out}\n`;
}

if (isMain(import.meta.url)) {
  const only = process.argv.slice(2);
  const skills = loadSkills(ROOT).filter((s) => !s.error && (only.length === 0 || only.includes(s.dirName)));
  const zipDir = path.join(ROOT, 'dist', 'zip');
  const flatDir = path.join(ROOT, 'dist', 'flat');
  fs.mkdirSync(zipDir, { recursive: true });
  fs.mkdirSync(flatDir, { recursive: true });
  for (const skill of skills) {
    fs.writeFileSync(path.join(zipDir, `${skill.dirName}.zip`), zipSkill(skill));
    fs.writeFileSync(path.join(flatDir, `${skill.dirName}.md`), flattenSkill(skill));
  }
  console.log(`Exported ${skills.length} skills to dist/zip and dist/flat.`);
}
