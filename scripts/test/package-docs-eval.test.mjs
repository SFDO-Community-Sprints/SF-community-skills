import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseXml, readField, readObjects, renderDataModel } from '../sync-package-docs.mjs';
import { runBehavioral, runTriggers } from '../eval.mjs';
import { loadSkills } from '../lib/repo.mjs';
import { makeRepo, write } from './helpers.mjs';

const PICKLIST_FIELD = `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Tribute_Type__c</fullName>
    <inlineHelpText>Honor or memorial.</inlineHelpText>
    <label>Tribute Type</label>
    <type>Picklist</type>
    <valueSet>
        <valueSetDefinition>
            <value><fullName>Honor</fullName><default>false</default><label>Honor</label></value>
            <value><fullName>Memorial</fullName><default>false</default><label>Memorial</label></value>
        </valueSetDefinition>
    </valueSet>
</CustomField>`;

test('reads an SFDX picklist field with namespace', () => {
  const f = readField(parseXml(PICKLIST_FIELD), 'npsp');
  assert.equal(f.apiName, 'npsp__Tribute_Type__c');
  assert.equal(f.label, 'Tribute Type');
  assert.equal(f.details, 'values: Honor, Memorial');
});

test('reads SFDX and legacy Metadata API objects and merges standard objects in output', () => {
  const sfdx = makeRepo();
  const mdapi = makeRepo();
  write(sfdx, 'force-app/main/default/objects/Gift__c/Gift__c.object-meta.xml', '<CustomObject><label>Gift</label><description>A gift &amp; more</description></CustomObject>');
  write(sfdx, 'force-app/main/default/objects/Gift__c/fields/Tribute_Type__c.field-meta.xml', PICKLIST_FIELD);
  write(sfdx, 'force-app/main/default/objects/Account/fields/Level__c.field-meta.xml', '<CustomField><fullName>Level__c</fullName><label>Level</label><type>Text</type></CustomField>');
  write(mdapi, 'src/objects/Account.object', '<CustomObject><fields><fullName>Shift__c</fullName><label>Shift</label><type>Lookup</type><referenceTo>Volunteer_Shift__c</referenceTo></fields></CustomObject>');
  const a = readObjects(sfdx, 'npsp');
  const b = readObjects(mdapi, 'GW_Volunteers');
  assert.deepEqual(a.map((o) => o.apiName), ['Account', 'npsp__Gift__c']);
  assert.equal(a[1].description, 'A gift & more');
  assert.equal(b[0].fields[0].details, '→ GW_Volunteers__Volunteer_Shift__c');
  const md = renderDataModel({ name: 'Test' }, [
    { repo: 'r1', namespace: 'npsp', sha: 'abc', objects: a },
    { repo: 'r2', namespace: 'GW_Volunteers', sha: 'def', objects: b },
  ]);
  assert.equal(md.match(/^### Account$/gm).length, 1);
  assert.match(md, /`npsp__Level__c`/);
  assert.match(md, /`GW_Volunteers__Shift__c`/);
});

test('trigger eval scores routing with a stub provider', async () => {
  const stub = { complete: async () => JSON.stringify({ skill: 'none' }) };
  const skills = loadSkills().filter((s) => !s.error);
  const { results } = await runTriggers(stub, { model: 'stub' }, skills);
  // "none" fails every should_trigger case and passes every should_not_trigger case.
  assert.ok(results.length > 0);
  for (const r of results) assert.equal(r.passed, !r.expect);
});

test('behavioral eval runs with and without the skill and attaches fixture files', async () => {
  const calls = [];
  const stub = {
    complete: async ({ system, user, schema }) => {
      calls.push({ system, user, schema });
      if (!schema) return system ? 'with-skill answer' : 'baseline answer';
      const n = (user.match(/^\d+\. /gm) ?? []).length;
      return JSON.stringify({ results: Array.from({ length: n }, (_, i) => ({ expectation: `e${i}`, passed: user.includes('with-skill'), evidence: '' })) });
    },
  };
  const skill = loadSkills().find((s) => s.dirName === 'npsp-gift-processing');
  const result = await runBehavioral(stub, { model: 'stub', judgeModel: 'stub', baseline: true }, skill);
  const runs = calls.filter((c) => !c.schema);
  assert.ok(runs.some((c) => c.system?.includes('<skill name="npsp-gift-processing">')));
  assert.ok(runs.some((c) => c.system === undefined));
  assert.ok(runs.some((c) => c.user.includes('<attached_file name="check-batch.md">')));
  const [with_, total] = result.report.with_skill.split('/').map(Number);
  assert.equal(with_, total);
  assert.equal(result.report.without_skill, `0/${total}`);
});
