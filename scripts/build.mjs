// Generates plugin skill copies, Claude and Codex manifests, marketplaces, and README tables
// from skills/, plugins/*/plugin.yaml, and packages.json.
// Usage: npm run build            write generated files
//        npm run build:check      exit 1 if generated files are out of date (CI)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadSkills, loadPackages, loadPlugins, skillPackages, listFiles, replaceGenerated, isMain } from './lib/repo.mjs';

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

// Returns { files: Map<relPath, Buffer|string>, ownedDirs: string[] } describing every generated output.
export function planBuild(root = ROOT) {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const repoUrl = pkg.repository?.url;
  const author = { name: pkg.author };
  const packages = loadPackages(root);
  const packageNames = Object.fromEntries(packages.map((p) => [p.prefix, p.name]));
  const skills = Object.fromEntries(loadSkills(root).map((s) => [s.dirName, s]));
  const plugins = loadPlugins(root).filter((p) => !p.error);
  const files = new Map();
  const ownedDirs = [];

  for (const plugin of plugins) {
    const base = path.join('plugins', plugin.dirName);
    ownedDirs.push(path.join(base, 'skills'));

    for (const name of plugin.skills ?? []) {
      const skill = skills[name];
      if (!skill) continue;
      for (const rel of skill.files) {
        files.set(path.join(base, 'skills', name, rel), fs.readFileSync(path.join(skill.dir, rel)));
      }
    }

    const common = {
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      author,
      homepage: `${repoUrl}/tree/main/${base}`,
      repository: repoUrl,
      license: pkg.license,
      keywords: plugin.keywords ?? [],
    };
    files.set(path.join(base, '.claude-plugin', 'plugin.json'), json(common));
    files.set(
      path.join(base, '.codex-plugin', 'plugin.json'),
      json({
        ...common,
        skills: './skills/',
        interface: {
          displayName: plugin.displayName,
          shortDescription: plugin.description,
          developerName: pkg.author,
          category: plugin.category ?? 'Productivity',
          websiteURL: `${repoUrl}/tree/main/${base}`,
        },
      }),
    );

    const readmePath = path.join(root, base, 'README.md');
    if (fs.existsSync(readmePath)) {
      const rows = (plugin.skills ?? [])
        .filter((name) => skills[name])
        .map((name) => {
          const meta = skills[name].frontmatter?.metadata ?? {};
          const pkgs = skillPackages(skills[name]).map((p) => packageNames[p] ?? p).join(', ');
          return `| [${name}](../../skills/${name}/SKILL.md) | ${pkgs} | ${meta.status ?? ''} | ${meta.version ?? ''} |`;
        });
      const table = ['| Skill | Packages | Status | Version |', '|---|---|---|---|', ...rows].join('\n');
      files.set(path.join(base, 'README.md'), replaceGenerated(fs.readFileSync(readmePath, 'utf8'), 'skills-table', table));
    }
  }

  // Marketplaces
  files.set(
    path.join('.claude-plugin', 'marketplace.json'),
    json({
      name: pkg.name,
      owner: author,
      metadata: { description: pkg.description, version: pkg.version },
      plugins: plugins.map((p) => ({
        name: p.name,
        source: `./plugins/${p.dirName}`,
        description: p.description,
        version: p.version,
        category: (p.category ?? 'productivity').toLowerCase(),
        keywords: p.keywords ?? [],
        license: pkg.license,
      })),
    }),
  );
  files.set(
    path.join('.agents', 'plugins', 'marketplace.json'),
    json({
      name: pkg.name,
      interface: { displayName: 'Salesforce Nonprofit Community Skills' },
      plugins: plugins.map((p) => ({
        name: p.name,
        source: { source: 'local', path: `./plugins/${p.dirName}` },
        policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
        category: p.category ?? 'Productivity',
      })),
    }),
  );

  // Root README tables
  const readmePath = path.join(root, 'README.md');
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf8');
    const countByPrefix = {};
    for (const s of Object.values(skills)) {
      const prefix = s.dirName.split('-')[0];
      countByPrefix[prefix] = (countByPrefix[prefix] ?? 0) + 1;
    }
    const pkgRows = packages.map(
      (p) => `| \`${p.prefix}\` | [${p.name}](${p.repo}) | ${p.status} | ${countByPrefix[p.prefix] ?? 0} |`,
    );
    readme = replaceGenerated(
      readme,
      'packages-table',
      ['| Prefix | Package | Status | Skills |', '|---|---|---|---|', ...pkgRows].join('\n'),
    );
    const pluginRows = plugins.map(
      (p) => `| [${p.name}](plugins/${p.dirName}/README.md) | ${p.description} | ${(p.skills ?? []).length} |`,
    );
    readme = replaceGenerated(
      readme,
      'plugins-table',
      ['| Plugin | Description | Skills |', '|---|---|---|', ...pluginRows].join('\n'),
    );
    files.set('README.md', readme);
  }

  return { files, ownedDirs };
}

// Compares the plan with disk. Returns a list of human-readable drift descriptions.
export function diffBuild(root, { files, ownedDirs }) {
  const drift = [];
  for (const [rel, content] of files) {
    const full = path.join(root, rel);
    if (!fs.existsSync(full)) drift.push(`missing  ${rel}`);
    else if (!fs.readFileSync(full).equals(Buffer.from(content))) drift.push(`changed  ${rel}`);
  }
  for (const dir of ownedDirs) {
    for (const rel of listFiles(path.join(root, dir))) {
      if (!files.has(path.join(dir, rel))) drift.push(`stale    ${path.join(dir, rel)}`);
    }
  }
  return drift;
}

export function writeBuild(root, { files, ownedDirs }) {
  for (const dir of ownedDirs) fs.rmSync(path.join(root, dir), { recursive: true, force: true });
  for (const [rel, content] of files) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
}

if (isMain(import.meta.url)) {
  const plan = planBuild(ROOT);
  if (process.argv.includes('--check')) {
    const drift = diffBuild(ROOT, plan);
    if (drift.length) {
      console.log(drift.join('\n'));
      console.log('\nGenerated files are out of date. Run `npm run build` and commit the result.');
      process.exit(1);
    }
    console.log('Generated files are up to date.');
  } else {
    writeBuild(ROOT, plan);
    console.log(`Wrote ${plan.files.size} generated files.`);
  }
}
