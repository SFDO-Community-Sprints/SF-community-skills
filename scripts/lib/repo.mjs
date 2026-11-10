// Shared helpers for loading skills, packages, and plugins from the repo.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import YAML from 'yaml';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Splits a SKILL.md into parsed frontmatter and body. Throws on missing or invalid frontmatter.
export function parseSkillFile(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error('missing YAML frontmatter (file must start with ---)');
  const frontmatter = YAML.parse(match[1]) ?? {};
  return { frontmatter, body: match[2] };
}

// Lists files under dir recursively, as paths relative to dir, sorted.
export function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const child of listFiles(full)) out.push(path.join(entry.name, child));
    } else {
      out.push(entry.name);
    }
  }
  return out.sort();
}

// Loads every skill folder under <root>/skills. Parse errors are kept on the skill, not thrown.
export function loadSkills(root = ROOT) {
  const skillsDir = path.join(root, 'skills');
  if (!fs.existsSync(skillsDir)) return [];
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .map((dirName) => {
      const dir = path.join(skillsDir, dirName);
      const file = path.join(dir, 'SKILL.md');
      const skill = { dirName, dir, file, files: listFiles(dir) };
      if (!fs.existsSync(file)) return { ...skill, error: 'missing SKILL.md' };
      const text = fs.readFileSync(file, 'utf8');
      try {
        return { ...skill, text, ...parseSkillFile(text) };
      } catch (err) {
        return { ...skill, text, error: err.message };
      }
    });
}

export function loadPackages(root = ROOT) {
  return JSON.parse(fs.readFileSync(path.join(root, 'packages.json'), 'utf8')).packages;
}

// Loads plugins/<name>/plugin.yaml for every plugin folder.
export function loadPlugins(root = ROOT) {
  const pluginsDir = path.join(root, 'plugins');
  if (!fs.existsSync(pluginsDir)) return [];
  return fs
    .readdirSync(pluginsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .map((dirName) => {
      const dir = path.join(pluginsDir, dirName);
      const file = path.join(dir, 'plugin.yaml');
      if (!fs.existsSync(file)) return { dirName, dir, error: 'missing plugin.yaml' };
      return { dirName, dir, file, ...YAML.parse(fs.readFileSync(file, 'utf8')) };
    });
}

// metadata.packages is a comma-separated string per the Agent Skills spec (string values only).
export function skillPackages(skill) {
  const value = skill.frontmatter?.metadata?.packages ?? '';
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function readJsonIfExists(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
}

// True when the calling module is the script node was started with.
export function isMain(metaUrl) {
  return process.argv[1] && metaUrl === pathToFileURL(path.resolve(process.argv[1])).href;
}

// Replaces the text between <!-- BEGIN GENERATED name --> and <!-- END GENERATED name --> markers.
export function replaceGenerated(text, name, content) {
  const begin = `<!-- BEGIN GENERATED ${name} -->`;
  const end = `<!-- END GENERATED ${name} -->`;
  const start = text.indexOf(begin);
  const stop = text.indexOf(end);
  if (start === -1 || stop === -1) return text;
  return `${text.slice(0, start + begin.length)}\n${content.trim()}\n${text.slice(stop)}`;
}
