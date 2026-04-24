import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, '..', '..', '..', 'assets');

const WORKFLOW = path.join(ASSETS, 'instructions', 'templates', 'workflow.md');
const CODE_STYLE = path.join(ASSETS, 'skills', 'code-style.md');
const LAND_COMMAND = path.join(ASSETS, 'instructions', 'commands', 'sdg-land.md');
const STACK_TEMPLATE = path.join(ASSETS, 'instructions', 'templates', 'backlog', 'stack.md');
const DELIVERY_COMPETENCY = path.join(ASSETS, 'instructions', 'competencies', 'delivery.md');

function readAsset(assetPath) {
  const content = fs.readFileSync(assetPath, 'utf8');
  return content;
}

describe('Skill Content — Governance Layer', () => {
  describe('code-style.md essentials', () => {
    it('should open with a two-line Security-First block', () => {
      const input = readAsset(CODE_STYLE);
      const expectedFragments = [
        '## Security first',
        'Default deny at every boundary',
        'Never concatenate user input',
      ];

      const actualMissing = expectedFragments.filter((fragment) => !input.includes(fragment));

      assert.deepEqual(actualMissing, [], 'Security-first block must be explicit and early');
    });

    it('should expose a PreCodeChecklist rule before PreFinishGate', () => {
      const input = readAsset(CODE_STYLE);
      const preCodeIndex = input.indexOf('<rule name="PreCodeChecklist">');
      const preFinishIndex = input.indexOf('<rule name="PreFinishGate">');

      const actual = preCodeIndex !== -1 && preCodeIndex < preFinishIndex;

      assert.ok(actual, 'PreCodeChecklist must exist and precede PreFinishGate');
    });

    it('should enumerate the eight Pre-Code Checklist concerns', () => {
      const input = readAsset(CODE_STYLE);
      const expectedFragments = [
        'Mental Reset',
        'Target Files',
        'Naming',
        'Narrative',
        'Comments',
        'Tests planned',
        'Security',
        'Blockers',
      ];

      const actualMissing = expectedFragments.filter((fragment) => !input.includes(fragment));

      assert.deepEqual(actualMissing, [], 'Pre-Code Checklist must cover all eight concerns');
    });

    it('should enumerate the eight Pre-Finish Gate items wired to heuristics', () => {
      const input = readAsset(CODE_STYLE);
      const expectedFragments = [
        'Narrative Siblings',
        'Explaining Returns',
        'No framework abbreviations',
        'Vertical Density',
        'Revealing Module Pattern',
        'Boolean prefix',
        'No section banners',
        'Pure entry point',
      ];

      const actualMissing = expectedFragments.filter((fragment) => !input.includes(fragment));

      assert.deepEqual(actualMissing, [], 'Pre-Finish Gate must match heuristic strategy keys');
    });

    it('should ban Engineering Laws / DNA-GATE vocabulary from code-style', () => {
      const input = readAsset(CODE_STYLE);
      const forbiddenFragments = [
        'Engineering Laws',
        'DNA-GATE',
        'staff-dna',
        'Sovereign Protocol',
      ];

      const actualLeaks = forbiddenFragments.filter((fragment) => input.includes(fragment));

      assert.deepEqual(
        actualLeaks,
        [],
        'code-style must not reference removed governance ceremony'
      );
    });
  });

  describe('sdg-land.md — Phase STACK shape', () => {
    it('should include a Phase: STACK heading between SCOPE and BACKLOG', () => {
      const input = readAsset(LAND_COMMAND);
      const scopeIndex = input.indexOf('## Phase: SCOPE');
      const stackIndex = input.indexOf('## Phase: STACK');
      const backlogIndex = input.indexOf('## Phase: BACKLOG');

      const isStackBetweenScopeAndBacklog =
        scopeIndex !== -1 && stackIndex > scopeIndex && stackIndex < backlogIndex;
      assert.ok(isStackBetweenScopeAndBacklog, 'Phase STACK must sit between SCOPE and BACKLOG');
    });

    it('should reference the canonical WebFetch allow-list sources', () => {
      const input = readAsset(LAND_COMMAND);
      const expectedSources = [
        'nodejs.org/api/',
        'react.dev',
        'typescriptlang.org',
        'docs.python.org',
        'go.dev/doc',
        'doc.rust-lang.org',
      ];

      const actualMissing = expectedSources.filter((fragment) => !input.includes(fragment));

      assert.deepEqual(actualMissing, [], 'Phase STACK must expose the doc-source allow-list');
    });

    it('should direct the output to .ai/backlog/stack.md', () => {
      const input = readAsset(LAND_COMMAND);
      const hasStackOutputRef = input.includes('.ai/backlog/stack.md');
      assert.ok(hasStackOutputRef);
    });
  });

  describe('stack.md seed template', () => {
    it('should expose the four canonical role headers', () => {
      const input = readAsset(STACK_TEMPLATE);
      const expectedHeaders = ['### Backend', '### Frontend', '### Data', '### Scripts'];

      const actualMissing = expectedHeaders.filter((fragment) => !input.includes(fragment));

      assert.deepEqual(actualMissing, [], 'stack.md seed must declare all four role headers');
    });

    it('should guide the developer to run land:', () => {
      const input = readAsset(STACK_TEMPLATE);
      const hasLandHint = input.includes('run `land:`');
      assert.ok(hasLandHint, 'seed must tell the dev to populate via land:');
    });
  });

  describe('competencies/delivery.md — fused contract', () => {
    it('should contain both Backend and Frontend discriminated sections', () => {
      const input = readAsset(DELIVERY_COMPETENCY);
      const expectedFragments = [
        '## Backend (load if the task is server-side)',
        '## Frontend (load if the task is UI)',
        'Response Envelope',
        'Design System',
      ];

      const actualMissing = expectedFragments.filter((fragment) => !input.includes(fragment));

      assert.deepEqual(actualMissing, [], 'delivery.md must contain both discriminated sections');
    });
  });

  describe('workflow.md Phase CODE', () => {
    it('should route Phase CODE through the Pre-Code Checklist', () => {
      const input = readAsset(WORKFLOW);
      const expectedMarker = 'Pre-Code Checklist (BLOCKING)';

      const actual = input.includes(expectedMarker);

      assert.ok(actual, 'Phase CODE step 1 must be the Pre-Code Checklist');
    });

    it('should still name the blocked write tools', () => {
      const input = readAsset(WORKFLOW);
      const expectedFragments = ['Edit', 'Write', 'NotebookEdit'];

      const actualMissing = expectedFragments.filter((fragment) => !input.includes(fragment));

      assert.deepEqual(actualMissing, [], 'Phase CODE must name blocked write tools');
    });

    it('should have shed all Laws / DNA-GATE vocabulary', () => {
      const input = readAsset(WORKFLOW);
      const forbiddenFragments = [
        'DNA-GATE CONFIRMED',
        'SUPREME BLOCK',
        'Engineering Laws',
        'Law 1 violation',
        'staff-dna.md',
      ];

      const actualLeaks = forbiddenFragments.filter((fragment) => input.includes(fragment));

      assert.deepEqual(actualLeaks, [], 'workflow.md must not retain removed governance ceremony');
    });
  });
});
