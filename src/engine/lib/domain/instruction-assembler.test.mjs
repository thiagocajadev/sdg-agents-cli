import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { InstructionAssembler } from './instruction-assembler.mjs';

const {
  buildMasterInstructions,
  writeAgentConfig,
  writeManifest,
  writeToolingAssets,
  writeBacklogFiles,
  removeGeneratedInstructions,
} = InstructionAssembler;

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'sdg-test-'));
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('InstructionAssembler', () => {
  describe('writeAgentConfig()', () => {
    it('should write .ai/skills/AGENTS.md', () => {
      const tmpDir = makeTempDir();
      const inputContent = 'content';
      const expectedPath = path.join(tmpDir, '.ai', 'skills', 'AGENTS.md');

      try {
        writeAgentConfig(tmpDir, inputContent);

        const actualExists = fs.existsSync(expectedPath);
        const actualContent = fs.readFileSync(expectedPath, 'utf8');

        assert.ok(actualExists);
        assert.equal(actualContent, inputContent);
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should create .ai/skills/ directory if it does not exist', () => {
      const tmpDir = makeTempDir();
      const expectedDir = path.join(tmpDir, '.ai', 'skills');

      try {
        writeAgentConfig(tmpDir, 'content');

        const actualExists = fs.existsSync(expectedDir);
        assert.ok(actualExists);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe('writeManifest()', () => {
    it('should create .ai/.sdg-manifest.json', () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: 'lite' };
      const expectedFile = path.join(tmpDir, '.ai', '.sdg-manifest.json');

      try {
        writeManifest(tmpDir, inputSelections, '1.0.0');

        const actualExists = fs.existsSync(expectedFile);
        assert.ok(actualExists);
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should write valid JSON with all required fields', () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: 'lite' };
      const inputVersion = '2.0.0';
      const manifestPath = path.join(tmpDir, '.ai', '.sdg-manifest.json');

      try {
        writeManifest(tmpDir, inputSelections, inputVersion);

        const actualRaw = fs.readFileSync(manifestPath, 'utf8');
        const actual = JSON.parse(actualRaw);

        assert.ok(actual.generatedAt);
        assert.equal(actual.sdgAgentVersion, inputVersion);
        assert.ok(typeof actual.contentHashes === 'object');
        assert.deepEqual(actual.selections, inputSelections);
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should store a valid ISO generatedAt timestamp', () => {
      const tmpDir = makeTempDir();
      const before = Date.now();
      const manifestPath = path.join(tmpDir, '.ai', '.sdg-manifest.json');

      try {
        writeManifest(tmpDir, { flavor: 'lite' }, '1.0.0');

        const after = Date.now();
        const actualManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const actualTs = new Date(actualManifest.generatedAt).getTime();

        assert.ok(actualTs >= before && actualTs <= after);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe('buildMasterInstructions()', () => {
    const baseSelections = { flavor: 'lite' };

    it('should point at code-style.md and workflow.md in the header', () => {
      const expectedCodeStyleRef = '.ai/skills/code-style.md';
      const expectedWorkflowRef = '.ai/instructions/templates/workflow.md';

      const actual = buildMasterInstructions(baseSelections);
      const hasCodeStyleRef = actual.includes(expectedCodeStyleRef);
      const hasWorkflowRef = actual.includes(expectedWorkflowRef);

      assert.ok(hasCodeStyleRef);
      assert.ok(hasWorkflowRef);
    });

    it('should NOT reference removed staff-dna.md skill', () => {
      const actual = buildMasterInstructions(baseSelections);
      const hasNoStaffDnaLink = !actual.includes('staff-dna.md');
      assert.ok(hasNoStaffDnaLink);
    });

    it('should reference .ai/backlog/stack.md in Session Start', () => {
      const actual = buildMasterInstructions(baseSelections);
      const hasStackPointer = actual.includes('.ai/backlog/stack.md');
      assert.ok(hasStackPointer, 'stack.md must appear as Phase CODE context source');
    });

    it('should reference delivery.md (fused competency) and NOT the legacy split files', () => {
      const actual = buildMasterInstructions(baseSelections);

      const hasDeliveryRef = actual.includes('.ai/instructions/competencies/delivery.md');
      const hasNoBackendSplit = !actual.includes('competencies/backend.md');
      const hasNoFrontendSplit = !actual.includes('competencies/frontend.md');

      assert.ok(hasDeliveryRef, 'delivery.md must replace the split backend/frontend competencies');
      assert.ok(hasNoBackendSplit, 'legacy backend.md reference must not resurface');
      assert.ok(hasNoFrontendSplit, 'legacy frontend.md reference must not resurface');
    });

    it('should NOT reference the removed idioms directory', () => {
      const actual = buildMasterInstructions(baseSelections);
      const hasNoIdiomsRef = !actual.match(/idioms\/[a-z-]+\/patterns\.md/);
      const hasNoIdiomsHeader = !actual.includes('Stack idioms');
      assert.ok(hasNoIdiomsRef, 'static idiom paths must not resurface');
      assert.ok(hasNoIdiomsHeader, 'Stack idioms header must be replaced by Stack context');
    });

    it('should include Semantic Router with all cycle triggers', () => {
      const expectedSubstrings = [
        '## Semantic Router',
        'feat:',
        'fix:',
        'docs:',
        'audit:',
        'land:',
        'end:',
      ];

      const actual = buildMasterInstructions(baseSelections);

      for (const expected of expectedSubstrings) {
        const hasExpectedTrigger = actual.includes(expected);
        assert.ok(hasExpectedTrigger, `Missing: ${expected}`);
      }
    });

    it('should include Phase CODE skill loading section', () => {
      const actual = buildMasterInstructions(baseSelections);
      const hasPhaseCodeHeader = actual.includes('## Phase CODE');
      assert.ok(hasPhaseCodeHeader);
    });

    it('should classify testing/security/observability as surgical skills', () => {
      const actual = buildMasterInstructions(baseSelections);

      const hasSurgicalHeader = actual.includes('**Surgical**');
      const hasTestingSkill = actual.includes('testing.md');
      const hasSecuritySkill = actual.includes('security.md');
      const hasObservabilitySkill = actual.includes('observability.md');

      assert.ok(hasSurgicalHeader);
      assert.ok(hasTestingSkill);
      assert.ok(hasSecuritySkill);
      assert.ok(hasObservabilitySkill);
    });

    it('should unconditionally include Agent Roles block', () => {
      const actual = buildMasterInstructions(baseSelections);
      const hasAgentRolesHeader = actual.includes('## Agent Roles');
      const hasAgentRolesLink = actual.includes('agent-roles.md');
      assert.ok(hasAgentRolesHeader);
      assert.ok(hasAgentRolesLink);
    });

    it('should NOT include DNA-GATE or Working Protocol inline blocks', () => {
      const actual = buildMasterInstructions(baseSelections);
      const hasNoDnaGateBlock = !actual.includes('DNA-GATE & MENTAL RESET');
      const hasNoPhaseBanner = !actual.includes('PHASE EXECUTION IS MANDATORY');
      const hasNoWorkingProtocolBlock = !actual.includes('## Working Protocol');

      assert.ok(hasNoDnaGateBlock);
      assert.ok(hasNoPhaseBanner);
      assert.ok(hasNoWorkingProtocolBlock);
    });
  });

  describe('Token Budget Guard', () => {
    const WORST_CASE_INPUT = { flavor: 'vertical-slice' };
    const TOKEN_BUDGET_BYTES = 2600;

    it(`should stay under ${TOKEN_BUDGET_BYTES} bytes`, () => {
      const actual = buildMasterInstructions(WORST_CASE_INPUT);
      const actualBytes = Buffer.byteLength(actual, 'utf8');
      const isWithinTokenBudget = actualBytes <= TOKEN_BUDGET_BYTES;
      const tokenLeakMessage = `Token leak detected: ${actualBytes} bytes (budget: ${TOKEN_BUDGET_BYTES}).`;

      assert.ok(isWithinTokenBudget, tokenLeakMessage);
    });

    it('should not duplicate any file path reference', () => {
      const actual = buildMasterInstructions(WORST_CASE_INPUT);
      const pathMatches = actual.match(/`\.ai\/[^`]+\.md`/g) || [];
      const uniquePaths = new Set(pathMatches);

      assert.equal(pathMatches.length, uniquePaths.size);
    });

    it('should not contain verbose protocol patterns', () => {
      const actual = buildMasterInstructions(WORST_CASE_INPUT);

      const forbiddenPatterns = [
        'SOVEREIGN PROTOCOL',
        'PHASE EXECUTION IS MANDATORY',
        'DNA-GATE',
        'Engineering Laws',
        '[!IMPORTANT]',
        '[!CAUTION]',
      ];

      for (const pattern of forbiddenPatterns) {
        const isPatternAbsent = !actual.includes(pattern);
        assert.ok(isPatternAbsent, `Verbose pattern leaked: "${pattern}"`);
      }
    });
  });

  describe('writeToolingAssets()', () => {
    it('should copy tooling directory into .ai/tooling/ preserving structure', () => {
      const tmpDir = makeTempDir();
      const expectedFiles = [
        path.join('.ai', 'tooling', 'scripts', 'prune-backlog.mjs'),
        path.join('.ai', 'tooling', 'scripts', 'bump-version.mjs'),
        path.join('.ai', 'tooling', 'husky', 'pre-commit'),
        path.join('.ai', 'tooling', 'husky', 'commit-msg'),
        path.join('.ai', 'tooling', 'README.md'),
      ];

      try {
        writeToolingAssets(tmpDir);

        for (const relativePath of expectedFiles) {
          const absolutePath = path.join(tmpDir, relativePath);
          const fileExists = fs.existsSync(absolutePath);
          assert.ok(fileExists, `Missing tooling asset: ${relativePath}`);
        }
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should mark husky hooks as executable', () => {
      const tmpDir = makeTempDir();
      const hookNames = ['pre-commit', 'commit-msg'];
      const expectedPermissionMask = 0o100;

      try {
        writeToolingAssets(tmpDir);

        for (const hookName of hookNames) {
          const hookPath = path.join(tmpDir, '.ai', 'tooling', 'husky', hookName);
          const stats = fs.statSync(hookPath);
          const actualPermissionBits = stats.mode & 0o111;
          const isExecutable = (actualPermissionBits & expectedPermissionMask) !== 0;
          assert.ok(isExecutable, `Hook not executable: ${hookName}`);
        }
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should be idempotent when invoked twice', () => {
      const tmpDir = makeTempDir();
      const referencePath = path.join(tmpDir, '.ai', 'tooling', 'README.md');

      try {
        writeToolingAssets(tmpDir);
        const firstRunContent = fs.readFileSync(referencePath, 'utf8');

        writeToolingAssets(tmpDir);
        const secondRunContent = fs.readFileSync(referencePath, 'utf8');

        assert.equal(firstRunContent, secondRunContent);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe('writeBacklogFiles()', () => {
    it('should include Tooling (optional) section in generated context.md', () => {
      const tmpDir = makeTempDir();
      const contextPath = path.join(tmpDir, '.ai', 'backlog', 'context.md');

      try {
        writeBacklogFiles(tmpDir, { flavor: 'lite' });
        const actualContent = fs.readFileSync(contextPath, 'utf8');

        assert.ok(actualContent.includes('## Tooling (optional)'));
        assert.ok(actualContent.includes('.ai/tooling/'));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should write .ai/backlog/stack.md placeholder when missing', () => {
      const tmpDir = makeTempDir();
      const stackPath = path.join(tmpDir, '.ai', 'backlog', 'stack.md');

      try {
        writeBacklogFiles(tmpDir, { flavor: 'lite' });

        const actualExists = fs.existsSync(stackPath);
        assert.ok(actualExists, 'stack.md seed must be written on init');

        const actualContent = fs.readFileSync(stackPath, 'utf8');
        assert.ok(actualContent.includes('# Project Stack'));
        assert.ok(actualContent.includes('### Backend'));
        assert.ok(actualContent.includes('### Frontend'));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should never overwrite an existing .ai/backlog/stack.md', () => {
      const tmpDir = makeTempDir();
      const backlogDir = path.join(tmpDir, '.ai', 'backlog');
      const stackPath = path.join(backlogDir, 'stack.md');
      const preexistingContent = '# Custom Stack\n\n- Node 24\n';

      try {
        fs.mkdirSync(backlogDir, { recursive: true });
        fs.writeFileSync(stackPath, preexistingContent);

        writeBacklogFiles(tmpDir, { flavor: 'lite' });

        const actualContent = fs.readFileSync(stackPath, 'utf8');
        assert.equal(actualContent, preexistingContent);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe('removeGeneratedInstructions()', () => {
    it('should delete legacy .ai/instructions/idioms/ tree', () => {
      const tmpDir = makeTempDir();
      const staleDir = path.join(tmpDir, '.ai', 'instructions', 'idioms');
      const staleFile = path.join(staleDir, 'typescript', 'patterns.md');

      try {
        fs.mkdirSync(path.dirname(staleFile), { recursive: true });
        fs.writeFileSync(staleFile, '# stale');

        removeGeneratedInstructions(tmpDir);

        const staleStillExists = fs.existsSync(staleDir);
        const expectedAbsent = false;
        assert.equal(staleStillExists, expectedAbsent, 'stale idioms dir must be removed');
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should be a no-op when no stale idioms exist', () => {
      const tmpDir = makeTempDir();

      try {
        assert.doesNotThrow(() => removeGeneratedInstructions(tmpDir));
      } finally {
        cleanup(tmpDir);
      }
    });
  });
});
