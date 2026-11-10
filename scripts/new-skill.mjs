// Scaffolds a new skill and its eval file from templates/SKILL.template.md.
// Usage: npm run new -- <prefix>-<topic>     e.g. npm run new -- pmm-service-delivery-summary
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadPackages } from './lib/repo.mjs';

const name = process.argv[2];
if (!name || !/^[a-z0-9]+(-[a-z0-9]+)+$/.test(name)) {
  console.error('Usage: npm run new -- <prefix>-<topic>   (lowercase, hyphen-separated)');
  process.exit(1);
}
const prefix = name.split('-')[0];
const pkg = loadPackages(ROOT).find((p) => p.prefix === prefix);
if (!pkg) {
  console.error(`Unknown prefix "${prefix}". Registered prefixes: ${loadPackages(ROOT).map((p) => p.prefix).join(', ')}`);
  process.exit(1);
}
const skillDir = path.join(ROOT, 'skills', name);
if (fs.existsSync(skillDir)) {
  console.error(`skills/${name} already exists`);
  process.exit(1);
}

const title = name
  .split('-')
  .slice(1)
  .map((w) => w[0].toUpperCase() + w.slice(1))
  .join(' ');
const skill = fs
  .readFileSync(path.join(ROOT, 'templates', 'SKILL.template.md'), 'utf8')
  .replaceAll('{{name}}', name)
  .replaceAll('{{prefix}}', prefix)
  .replaceAll('{{title}}', title)
  .replaceAll('{{packageName}}', `Salesforce ${pkg.name}`);
fs.mkdirSync(skillDir, { recursive: true });
fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skill);

const evalDir = path.join(ROOT, 'evals', name);
fs.mkdirSync(evalDir, { recursive: true });
fs.writeFileSync(
  path.join(evalDir, 'evals.json'),
  `${JSON.stringify(
    {
      skill_name: name,
      triggers: {
        should_trigger: ['A realistic request this skill should handle'],
        should_not_trigger: ['A nearby request that a different skill, or no skill, should handle'],
      },
      evals: [
        {
          id: 1,
          prompt: 'A realistic user request, including any pasted data',
          files: [],
          expected_output: 'One sentence describing a good response',
          expectations: ['A specific, checkable statement about a good response'],
        },
      ],
    },
    null,
    2,
  )}\n`,
);

console.log(`Created skills/${name}/SKILL.md and evals/${name}/evals.json`);
console.log('Next: write the skill, then run `npm run validate`.');
