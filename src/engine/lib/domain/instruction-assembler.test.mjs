import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { InstructionAssembler } from './instruction-assembler.mjs';

const { buildMasterInstructions, writeAgentConfig, writeManifest } = InstructionAssembler;

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
      const expectedContent = inputContent;

      try {
        writeAgentConfig(tmpDir, inputContent);

        const actualExists = fs.existsSync(expectedPath);
        const actualContent = fs.readFileSync(expectedPath, 'utf8');

        assert.ok(actualExists);
        assert.equal(actualContent, expectedContent);
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
      const inputSelections = { flavor: 'lite', idioms: ['go'], versions: { go: null } };
      const expectedFile = path.join(tmpDir, '.ai', '.sdg-manifest.json');

      try {
        writeManifest(tmpDir, inputSelections, '1.0.0');

        const actualExists = fs.existsSync(expectedFile);
        assert.ok(actualExists);
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should create .ai/ directory if it does not exist', () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: 'lite', idioms: ['go'], versions: {} };
      const expectedDir = path.join(tmpDir, '.ai');

      try {
        writeManifest(tmpDir, inputSelections, '1.0.0');

        const actualExists = fs.existsSync(expectedDir);
        assert.ok(actualExists);
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should write valid JSON with all required fields', () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: 'lite', idioms: ['go'], versions: {} };
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

    it('should store selections exactly as passed', () => {
      const tmpDir = makeTempDir();
      const inputSelections = {
        flavor: 'vertical-slice',
        idioms: ['typescript', 'python'],
        versions: { typescript: '6.0', python: '3.13' },
      };
      const manifestPath = path.join(tmpDir, '.ai', '.sdg-manifest.json');

      try {
        writeManifest(tmpDir, inputSelections, '1.0.0');

        const actual = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
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
        writeManifest(tmpDir, { flavor: 'lite', idioms: ['go'], versions: {} }, '1.0.0');

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
    it('should include pointer to Universal Engineering Manifesto', () => {
      const input = { flavor: 'lite', idioms: ['go'], versions: {} };
      const expectedSubstring1 = 'Universal Engineering Manifesto';
      const expectedSubstring2 = '.ai/skills/staff-dna.md';

      const actual = buildMasterInstructions(input);

      assert.ok(actual.includes(expectedSubstring1));
      assert.ok(actual.includes(expectedSubstring2));
    });

    it('should include Semantic Router with all cycle triggers', () => {
      const input = { flavor: 'lite', idioms: ['go'], versions: {} };
      const expectedSubstrings = [
        '## Semantic Router',
        'feat:',
        'fix:',
        'docs:',
        'audit:',
        'land:',
        'end:',
      ];

      const actual = buildMasterInstructions(input);

      expectedSubstrings.forEach((expected) => {
        assert.ok(actual.includes(expected), `Missing: ${expected}`);
      });
    });

    it('should include workflow.md reference in Semantic Router', () => {
      const input = { flavor: 'lite', idioms: ['go'], versions: {} };
      const expectedSubstring = 'workflow.md';

      const actual = buildMasterInstructions(input);

      assert.ok(actual.includes(expectedSubstring));
    });

    it('should include Phase CODE skill loading section', () => {
      const input = { flavor: 'lite', idioms: ['go'], versions: {} };
      const expectedSubstring = '## Phase CODE';

      const actual = buildMasterInstructions(input);

      assert.ok(actual.includes(expectedSubstring));
    });

    it('should include backend competency link for backend-only idiom (go)', () => {
      const input = { flavor: 'lite', idioms: ['go'], versions: {} };
      const expectedSubstring = '.ai/instructions/competencies/backend.md';
      const forbiddenSubstring = '.ai/instructions/competencies/frontend.md';

      const actual = buildMasterInstructions(input);

      assert.ok(actual.includes(expectedSubstring));
      assert.ok(!actual.includes(forbiddenSubstring));
    });

    it('should include both competency links for fullstack idiom (typescript)', () => {
      const input = {
        flavor: 'lite',
        idioms: ['typescript'],
        versions: {},
      };
      const expectedSubstring1 = '.ai/instructions/competencies/backend.md';
      const expectedSubstring2 = '.ai/instructions/competencies/frontend.md';

      const actual = buildMasterInstructions(input);

      assert.ok(actual.includes(expectedSubstring1));
      assert.ok(actual.includes(expectedSubstring2));
    });

    it('should include an instruction link for each idiom', () => {
      const input = {
        flavor: 'lite',
        idioms: ['typescript', 'python'],
        versions: {},
      };
      const expectedSubstring1 = 'idioms/typescript/patterns.md';
      const expectedSubstring2 = 'idioms/python/patterns.md';

      const actual = buildMasterInstructions(input);

      assert.ok(actual.includes(expectedSubstring1));
      assert.ok(actual.includes(expectedSubstring2));
    });

    it('should unconditionally include Agent Roles block', () => {
      const input = {
        flavor: 'lite',
        idioms: ['go'],
        versions: {},
      };
      const expectedSubstring1 = '## Agent Roles';
      const expectedSubstring2 = 'agent-roles.md';

      const actual = buildMasterInstructions(input);

      assert.ok(actual.includes(expectedSubstring1));
      assert.ok(actual.includes(expectedSubstring2));
    });

    it('should classify testing/security/observability as surgical skills', () => {
      const input = { flavor: 'lite', idioms: ['go'], versions: {} };
      const expectedSubstring = '**Surgical**';

      const actual = buildMasterInstructions(input);

      assert.ok(actual.includes(expectedSubstring));
      assert.ok(actual.includes('testing.md'));
      assert.ok(actual.includes('security.md'));
      assert.ok(actual.includes('observability.md'));
    });

    it('should NOT include DNA-GATE or Working Protocol inline blocks', () => {
      const input = { flavor: 'lite', idioms: ['go'], versions: {} };

      const actual = buildMasterInstructions(input);

      assert.ok(!actual.includes('DNA-GATE & MENTAL RESET'));
      assert.ok(!actual.includes('PHASE EXECUTION IS MANDATORY'));
      assert.ok(!actual.includes('## Working Protocol'));
    });

    it('should be significantly smaller than 3KB', () => {
      const input = { flavor: 'lite', idioms: ['typescript', 'python'], versions: {} };

      const actual = buildMasterInstructions(input);
      const actualBytes = Buffer.byteLength(actual, 'utf8');

      assert.ok(actualBytes < 3000, `Output is ${actualBytes} bytes, expected < 3000`);
    });
  });

  describe('Token Budget Guard', () => {
    // Worst-case: fullstack (typescript) + second idiom + flavor = maximum possible output
    const WORST_CASE_INPUT = { flavor: 'lite', idioms: ['typescript', 'python'], versions: {} };
    // Ceiling: 2800 bytes (~700 tokens). Current baseline: ~2700 bytes.
    // If this breaks, you added verbose content to AGENTS.md. Compress or move to on-demand file.
    const TOKEN_BUDGET_BYTES = 2800;

    it(`should stay under ${TOKEN_BUDGET_BYTES} bytes (worst-case fullstack output)`, () => {
      const actual = buildMasterInstructions(WORST_CASE_INPUT);
      const actualBytes = Buffer.byteLength(actual, 'utf8');

      assert.ok(
        actualBytes <= TOKEN_BUDGET_BYTES,
        `Token leak detected: ${actualBytes} bytes (budget: ${TOKEN_BUDGET_BYTES}). ` +
          `Approx ${Math.round(actualBytes / 4)} tokens vs budget ${Math.round(TOKEN_BUDGET_BYTES / 4)}. ` +
          'Move verbose content to an on-demand file instead of embedding in AGENTS.md.'
      );
    });

    it('should not duplicate any file path reference', () => {
      const actual = buildMasterInstructions(WORST_CASE_INPUT);
      const pathMatches = actual.match(/`\.ai\/[^`]+\.md`/g) || [];
      const uniquePaths = new Set(pathMatches);

      const duplicates = pathMatches.filter(
        (filePath, index) => pathMatches.indexOf(filePath) !== index
      );

      assert.deepEqual(
        duplicates,
        [],
        `Duplicated file references waste tokens: ${duplicates.join(', ')}`
      );

      assert.equal(pathMatches.length, uniquePaths.size);
    });

    it('should not contain verbose protocol patterns (they belong in on-demand files)', () => {
      const actual = buildMasterInstructions(WORST_CASE_INPUT);

      const forbiddenPatterns = [
        { pattern: 'SOVEREIGN PROTOCOL', reason: 'DNA-GATE text belongs in staff-dna.md' },
        { pattern: 'PHASE EXECUTION IS MANDATORY', reason: 'Phase rules belong in workflow.md' },
        { pattern: 'Skipping any phase', reason: 'Phase enforcement belongs in workflow.md' },
        { pattern: 'Training heuristics', reason: 'Anti-heuristic text belongs in workflow.md' },
        { pattern: 'Mental Reset', reason: 'DNA-GATE ceremony belongs in staff-dna.md' },
        { pattern: 'Sovereign Gateway', reason: 'DNA-GATE ceremony belongs in staff-dna.md' },
        { pattern: '[!IMPORTANT]', reason: 'Callout boxes waste tokens in always-on context' },
        { pattern: '[!CAUTION]', reason: 'Callout boxes waste tokens in always-on context' },
      ];

      for (const { pattern, reason } of forbiddenPatterns) {
        assert.ok(
          !actual.includes(pattern),
          `Verbose pattern leaked into AGENTS.md: "${pattern}". ${reason}.`
        );
      }
    });

    it('should have exactly 5 H2 sections (no section bloat)', () => {
      const actual = buildMasterInstructions(WORST_CASE_INPUT);
      const h2Matches = actual.match(/^## .+$/gm) || [];
      const expectedSections = [
        '## Session Start',
        '## Semantic Router',
        '## Phase CODE',
        '## Agent Roles',
      ];

      assert.ok(
        h2Matches.length <= 5,
        `Section bloat: found ${h2Matches.length} H2 sections (max 5). Sections: ${h2Matches.join(', ')}`
      );

      for (const section of expectedSections) {
        const sectionFound = h2Matches.some((heading) => heading.startsWith(section));
        assert.ok(sectionFound, `Missing required section: ${section}`);
      }
    });
  });
});
