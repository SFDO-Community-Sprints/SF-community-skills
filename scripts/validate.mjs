// Validates skills and plugins against the Agent Skills spec and this repo's portability rules.
// Usage: npm run validate [-- --root <dir>]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadSkills, loadPackages, loadPlugins, skillPackages, readJsonIfExists, isMain } from './lib/repo.mjs';

export const LIMITS = {
  nameMax: 64,
  // Slackbot caps skill descriptions at 400 characters (the Agent Skills spec allows 1024).
  descriptionMax: 400,
  bodyLinesMax: 500,
};

const SPEC_KEYS = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools']);
const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const STATUSES = new Set(['draft', 'stable']);
const AGENT_SYNTAX = [/\$\{CLAUDE_PLUGIN_ROOT\}/, /\$ARGUMENTS\b/, /\bCLAUDE_[A-Z_]+\b/];
const AGENT_NAMES = /\b(Claude|ChatGPT|Gemini|Codex)\b/;

export function validateRepo(root = ROOT) {
  const errors = [];
  const warnings = [];
  const packages = loadPackages(root);
  const prefixes = new Set(packages.map((p) => p.prefix));
  const skills = loadSkills(root);
  const skillNames = new Set(skills.map((s) => s.dirName));
  const crossRef = new RegExp(`\\b(?:${[...prefixes].join('|')})-[a-z0-9]+(?:-[a-z0-9]+)*\\b`, 'g');

  for (const skill of skills) {
    const where = `skills/${skill.dirName}`;
    const err = (msg) => errors.push(`${where}: ${msg}`);
    const warn = (msg) => warnings.push(`${where}: ${msg}`);
    if (skill.error) {
      err(skill.error);
      continue;
    }
    const fm = skill.frontmatter;

    for (const key of Object.keys(fm)) {
      if (!SPEC_KEYS.has(key)) err(`frontmatter key "${key}" is not in the Agent Skills spec; put custom fields under metadata`);
    }

    // name
    const name = fm.name;
    if (!name) err('frontmatter "name" is required');
    else {
      if (name !== skill.dirName) err(`name "${name}" must match folder name "${skill.dirName}"`);
      if (!NAME_PATTERN.test(name)) err(`name "${name}" must be lowercase letters, digits, and single hyphens`);
      if (name.length > LIMITS.nameMax) err(`name is ${name.length} chars; max ${LIMITS.nameMax}`);
      const prefix = name.split('-')[0];
      if (!prefixes.has(prefix)) err(`name prefix "${prefix}" is not registered in packages.json`);
    }

    // description
    const description = fm.description;
    if (!description || typeof description !== 'string') err('frontmatter "description" is required');
    else {
      if (description.length > LIMITS.descriptionMax) {
        err(`description is ${description.length} chars; max ${LIMITS.descriptionMax} (Slackbot limit)`);
      }
      if (!/use when/i.test(description)) err('description must include "Use when ..." trigger phrases');
    }

    // metadata
    const metadata = fm.metadata;
    if (!metadata || typeof metadata !== 'object') err('frontmatter "metadata" with packages, version, and status is required');
    else {
      for (const [key, value] of Object.entries(metadata)) {
        if (typeof value !== 'string') err(`metadata.${key} must be a string (Agent Skills spec); quote it or use a comma list`);
      }
      const pkgs = skillPackages(skill);
      if (pkgs.length === 0) err('metadata.packages is required (comma-separated package prefixes)');
      for (const p of pkgs) if (!prefixes.has(p)) err(`metadata.packages lists unknown package "${p}"`);
      if (name && pkgs.length && !pkgs.includes(name.split('-')[0])) {
        err(`metadata.packages must include the name prefix "${name.split('-')[0]}"`);
      }
      if (!SEMVER.test(String(metadata.version ?? ''))) err('metadata.version must be semver, e.g. "0.1.0"');
      if (!STATUSES.has(metadata.status)) err('metadata.status must be "draft" or "stable"');
    }

    if (fm['allowed-tools']) warn('allowed-tools is agent-specific and ignored by Slackbot, Coworker, and ChatGPT');

    // body
    const lines = skill.body.split('\n').length;
    if (lines > LIMITS.bodyLinesMax) err(`SKILL.md body is ${lines} lines; max ${LIMITS.bodyLinesMax}`);
    for (const pattern of AGENT_SYNTAX) {
      if (pattern.test(skill.body)) err(`body uses agent-specific syntax (${pattern.source}); skills must be portable`);
    }
    const agentName = skill.body.match(AGENT_NAMES);
    if (agentName) warn(`body mentions "${agentName[1]}"; refer to "the assistant" so the skill reads well in every agent`);

    const hasScripts = skill.files.some((f) => f.startsWith(`scripts${path.sep}`));
    if (hasScripts && !/^#+\s.*without scripts/im.test(skill.body)) {
      err('has scripts/ but no "Without scripts" section; Slackbot, Coworker, and ChatGPT may not run scripts');
    }
    const extra = skill.files.filter((f) => f !== 'SKILL.md' && !/^(references|scripts|assets)[\\/]/.test(f));
    if (extra.length) warn(`unexpected files outside references/, scripts/, assets/: ${extra.join(', ')}`);

    // cross-skill references
    for (const ref of new Set(skill.body.match(crossRef) ?? [])) {
      if (!skillNames.has(ref)) err(`references skill "${ref}", which does not exist`);
    }

    // evals
    const evals = readJsonIfExists(path.join(root, 'evals', skill.dirName, 'evals.json'));
    if (!evals) warn(`no evals/${skill.dirName}/evals.json`);
    else {
      if (!evals.triggers?.should_trigger?.length) warn('evals.json has no triggers.should_trigger prompts');
      if (metadata?.status === 'stable' && !evals.evals?.length) err('status "stable" requires behavioral cases in evals.json');
    }
  }

  // plugins
  for (const plugin of loadPlugins(root)) {
    const where = `plugins/${plugin.dirName}`;
    const err = (msg) => errors.push(`${where}: ${msg}`);
    if (plugin.error) {
      err(plugin.error);
      continue;
    }
    if (plugin.name !== plugin.dirName) err(`plugin.yaml name "${plugin.name}" must match folder name`);
    if (!NAME_PATTERN.test(plugin.name ?? '')) err('plugin name must be lowercase kebab-case');
    if (!SEMVER.test(String(plugin.version ?? ''))) err('plugin.yaml version must be semver');
    if (!plugin.description) err('plugin.yaml description is required');
    if (!plugin.displayName) err('plugin.yaml displayName is required');
    if (!Array.isArray(plugin.skills) || plugin.skills.length === 0) err('plugin.yaml skills must list at least one skill');
    for (const s of plugin.skills ?? []) if (!skillNames.has(s)) err(`lists skill "${s}", which does not exist in skills/`);
    if (!fs.existsSync(path.join(plugin.dir, 'README.md'))) err('README.md is required');
  }

  return { errors, warnings, skillCount: skills.length };
}

if (isMain(import.meta.url)) {
  const rootArg = process.argv.indexOf('--root');
  const root = rootArg > -1 ? path.resolve(process.argv[rootArg + 1]) : ROOT;
  const { errors, warnings, skillCount } = validateRepo(root);
  for (const w of warnings) console.log(`warning  ${w}`);
  for (const e of errors) console.log(`error    ${e}`);
  console.log(`\n${skillCount} skills checked: ${errors.length} errors, ${warnings.length} warnings`);
  process.exit(errors.length ? 1 : 0);
}
