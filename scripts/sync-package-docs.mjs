// Generates docs/packages/<prefix>/data-model.md from each package's source repos (objects and fields).
// Clones are sparse (object metadata only) and cached in .package-cache/ (git-ignored).
// Usage: npm run docs:packages [-- <prefix> ...]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, loadPackages, listFiles, isMain } from './lib/repo.mjs';

const CACHE = path.join(ROOT, '.package-cache');
const MAX_PICKLIST_VALUES = 8;
const MAX_TEXT = 200;

// Minimal XML reader for Salesforce metadata: returns a tree of { name, text, children }.
export function parseXml(xml) {
  const root = { name: '#root', text: '', children: [] };
  const stack = [root];
  const tokens = xml.replace(/<\?[\s\S]*?\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').split(/(<[^>]+>)/);
  for (const token of tokens) {
    if (!token) continue;
    if (token.startsWith('</')) stack.pop();
    else if (token.startsWith('<')) {
      const node = { name: token.slice(1).replace(/\/?>$/, '').split(/\s/)[0], text: '', children: [] };
      stack.at(-1).children.push(node);
      if (!token.endsWith('/>')) stack.push(node);
    } else stack.at(-1).text += token;
  }
  return root.children[0] ?? root;
}

const child = (node, name) => node?.children.find((c) => c.name === name);
const children = (node, name) => node?.children.filter((c) => c.name === name) ?? [];
const text = (node, name) => decode(child(node, name)?.text?.trim() ?? '');
function decode(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function namespaced(apiName, namespace) {
  if (!namespace || !/__(c|mdt|e)$/.test(apiName) || apiName.split('__').length > 2) return apiName;
  return `${namespace}__${apiName}`;
}

export function readField(node, namespace) {
  const type = text(node, 'type') || (child(node, 'formula') ? 'Formula' : '');
  const details = [];
  const ref = text(node, 'referenceTo');
  if (ref) details.push(`→ ${namespaced(ref, namespace)}`);
  if (child(node, 'formula')) details.push('formula');
  if (type === 'Summary') details.push(`roll-up of ${text(node, 'summarizedField') || text(node, 'summaryForeignKey')}`);
  const values = children(child(child(node, 'valueSet'), 'valueSetDefinition'), 'value').map((v) => text(v, 'fullName'));
  const legacyValues = children(node, 'picklistValues').map((v) => text(v, 'fullName'));
  const picklist = values.length ? values : legacyValues;
  if (picklist.length) {
    const shown = picklist.slice(0, MAX_PICKLIST_VALUES).join(', ');
    details.push(`values: ${shown}${picklist.length > MAX_PICKLIST_VALUES ? `, … (${picklist.length} total)` : ''}`);
  }
  return {
    apiName: namespaced(text(node, 'fullName'), namespace),
    label: text(node, 'label'),
    type,
    help: text(node, 'inlineHelpText') || text(node, 'description'),
    details: details.join('; '),
  };
}

function objectKind(apiName, node) {
  if (apiName.endsWith('__mdt')) return 'Custom Metadata Type';
  if (child(node, 'customSettingsType')) return 'Custom Setting';
  if (apiName.endsWith('__e')) return 'Platform Event';
  return apiName.endsWith('__c') ? 'Custom Object' : 'Standard Object (package fields)';
}

// Reads all objects under a package directory, in SFDX source format or legacy Metadata API format.
export function readObjects(dir, namespace) {
  const objects = new Map();
  const get = (name) => {
    const apiName = namespaced(name, namespace);
    if (!objects.has(apiName)) objects.set(apiName, { apiName, label: '', kind: '', description: '', fields: [] });
    return objects.get(apiName);
  };
  for (const rel of listFiles(dir)) {
    const parts = rel.split(path.sep);
    const i = parts.lastIndexOf('objects');
    if (i === -1) continue;
    const full = path.join(dir, rel);
    if (rel.endsWith('.object-meta.xml')) {
      const node = parseXml(fs.readFileSync(full, 'utf8'));
      const obj = get(parts[i + 1]);
      obj.label = text(node, 'label');
      obj.description = text(node, 'description');
      obj.kind = objectKind(obj.apiName, node);
    } else if (rel.endsWith('.field-meta.xml') && parts[i + 2] === 'fields') {
      get(parts[i + 1]).fields.push(readField(parseXml(fs.readFileSync(full, 'utf8')), namespace));
    } else if (rel.endsWith('.object') && parts.length === i + 2) {
      const node = parseXml(fs.readFileSync(full, 'utf8'));
      const obj = get(parts[i + 1].replace(/\.object$/, ''));
      obj.label = text(node, 'label');
      obj.description = text(node, 'description');
      obj.kind = objectKind(obj.apiName, node);
      for (const f of children(node, 'fields')) obj.fields.push(readField(f, namespace));
    }
  }
  for (const obj of objects.values()) {
    obj.kind ||= objectKind(obj.apiName, { children: [] });
    obj.fields.sort((a, b) => a.apiName.localeCompare(b.apiName));
  }
  return [...objects.values()].sort((a, b) => a.apiName.localeCompare(b.apiName));
}

// Sparse-clones (or refreshes) a repo with only object metadata and project files checked out.
function fetchRepo(repo) {
  const dir = path.join(CACHE, repo.split('/').slice(-2).join('__'));
  const git = (...args) => execFileSync('git', args, { cwd: dir, stdio: 'pipe' }).toString().trim();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(CACHE, { recursive: true });
    execFileSync('git', ['clone', '-q', '--depth', '1', '--filter=blob:none', '--no-checkout', `${repo}.git`, dir], { stdio: 'pipe' });
    git('sparse-checkout', 'set', '--no-cone', '/**/objects/**', '/sfdx-project.json');
    git('checkout', '-q');
  } else {
    git('fetch', '-q', '--depth', '1', 'origin', 'HEAD');
    git('reset', '-q', '--hard', 'FETCH_HEAD');
  }
  return { dir, sha: git('rev-parse', '--short', 'HEAD') };
}

// Package directories from sfdx-project.json, skipping unpackaged config; legacy repos use src/.
function packageDirs(repoDir) {
  const project = path.join(repoDir, 'sfdx-project.json');
  if (!fs.existsSync(project)) return [path.join(repoDir, 'src')];
  return JSON.parse(fs.readFileSync(project, 'utf8'))
    .packageDirectories.map((p) => p.path)
    .filter((p) => !p.startsWith('unpackaged'))
    .map((p) => path.join(repoDir, p));
}

const cell = (s) => (s.length > MAX_TEXT ? `${s.slice(0, MAX_TEXT - 1)}…` : s).replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');

export function renderDataModel(pkg, sources) {
  const lines = [
    `# ${pkg.name} data model`,
    '',
    '<!-- GENERATED by `npm run docs:packages`. Do not edit by hand; put explanations in README.md next to this file. -->',
    '',
    'Objects and fields defined in the package source. Standard objects list only the fields the package adds. Names include the namespace prefix as they appear in a subscriber org.',
    '',
    '| Namespace | Source | Commit |',
    '|---|---|---|',
    ...sources.map((s) => `| ${s.namespace ? `\`${s.namespace}\`` : '(none)'} | ${s.repo} | ${s.sha} |`),
    '',
    '## Objects',
    '',
    '| Object | Label | Kind | Fields |',
    '|---|---|---|---|',
  ];
  // Several sources can add fields to the same object (e.g. Account), so merge by API name.
  const merged = new Map();
  for (const o of sources.flatMap((s) => s.objects)) {
    const m = merged.get(o.apiName);
    if (!m) merged.set(o.apiName, { ...o, fields: [...o.fields] });
    else {
      m.label ||= o.label;
      m.description ||= o.description;
      if (o.label && !o.kind.startsWith('Standard')) m.kind = o.kind;
      for (const f of o.fields) if (!m.fields.some((x) => x.apiName === f.apiName)) m.fields.push(f);
      m.fields.sort((a, b) => a.apiName.localeCompare(b.apiName));
    }
  }
  const objects = [...merged.values()].sort((a, b) => a.apiName.localeCompare(b.apiName));
  for (const o of objects) lines.push(`| [\`${o.apiName}\`](#${o.apiName.toLowerCase()}) | ${cell(o.label)} | ${o.kind} | ${o.fields.length} |`);
  for (const o of objects) {
    lines.push('', `### ${o.apiName}`, '');
    lines.push(`**${o.label || o.apiName}** · ${o.kind}${o.description ? ` · ${cell(o.description)}` : ''}`, '');
    if (!o.fields.length) continue;
    lines.push('| Field | Label | Type | Details | Help / description |', '|---|---|---|---|---|');
    for (const f of o.fields) lines.push(`| \`${f.apiName}\` | ${cell(f.label)} | ${f.type} | ${cell(f.details)} | ${cell(f.help)} |`);
  }
  return `${lines.join('\n')}\n`;
}

if (isMain(import.meta.url)) {
  const only = process.argv.slice(2);
  const packages = loadPackages(ROOT).filter((p) => (only.length ? only.includes(p.prefix) : p.status === 'active'));
  for (const pkg of packages) {
    const sources = [];
    for (const source of pkg.sources ?? []) {
      process.stdout.write(`${pkg.prefix}: reading ${source.repo} … `);
      try {
        const { dir, sha } = fetchRepo(source.repo);
        const objects = packageDirs(dir).flatMap((d) => readObjects(d, source.namespace));
        sources.push({ ...source, sha, objects });
        console.log(`${objects.length} objects`);
      } catch (err) {
        console.log(`failed (${err.message.split('\n')[0]})`);
      }
    }
    const out = path.join(ROOT, 'docs', 'packages', pkg.prefix, 'data-model.md');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, renderDataModel(pkg, sources));
    console.log(`  wrote ${path.relative(ROOT, out)}`);
  }
}
