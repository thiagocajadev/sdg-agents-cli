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
    it('should write .ai/skill/AGENTS.md', () => {
      const tmpDir = makeTempDir();
      const inputContent = 'content';
      const expectedPath = path.join(tmpDir, '.ai', 'skill', 'AGENTS.md');
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

    it('should create .ai/skill/ directory if it does not exist', () => {
      const tmpDir = makeTempDir();
      const expectedDir = path.join(tmpDir, '.ai', 'skill');

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
      const input = { flavor: 'lite', idioms: ['go'], versions: {}, designPreset: null };
      const expectedSubstring1 = 'Universal Engineering Manifesto';
      const expectedSubstring2 = '.ai/instructions/core/staff-dna.md';

      const actual = buildMasterInstructions(input);

      assert.ok(actual.includes(expectedSubstring1));
      assert.ok(actual.includes(expectedSubstring2));
    });

    it('should include land: in the intent routing table', () => {
      const input = { flavor: 'lite', idioms: ['go'], versions: {}, designPreset: null };
      const expectedSubstring1 = 'land:';
      const expectedSubstring2 = 'feat:';

      const actual = buildMasterInstructions(input);

      assert.ok(actual.includes(expectedSubstring1));
      assert.ok(actual.includes(expectedSubstring2));
    });

    it('should include the Working Protocol workflow content', () => {
      const input = { flavor: 'lite', idioms: ['go'], versions: {}, designPreset: null };
      const expectedSubstring = 'Working Protocol';

      const actual = buildMasterInstructions(input);

      assert.ok(actual.includes(expectedSubstring));
    });

    it('should include intent prefix guide (land/feat/fix/docs)', () => {
      const input = { flavor: 'lite', idioms: ['go'], versions: {}, designPreset: null };
      const expectedSubstrings = ['land:', 'feat:', 'fix:', 'docs:'];

      const actual = buildMasterInstructions(input);

      expectedSubstrings.forEach((expected) => {
        assert.ok(actual.includes(expected));
      });
    });

    it('should include backend competency link for backend-only idiom (go)', () => {
      const input = { flavor: 'lite', idioms: ['go'], versions: {}, designPreset: null };
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
        designPreset: 'glass',
      };
      const expectedSubstring1 = '.ai/instructions/competencies/backend.md';
      const expectedSubstring2 = '.ai/instructions/competencies/frontend.md';

      const actual = buildMasterInstructions(input);

      assert.ok(actual.includes(expectedSubstring1));
      assert.ok(actual.includes(expectedSubstring2));
    });

    it('should include design preset note in uppercase when designPreset is set', () => {
      const input = {
        flavor: 'lite',
        idioms: ['typescript'],
        versions: {},
        designPreset: 'bento',
      };
      const expectedSubstring = 'BENTO';

      const actual = buildMasterInstructions(input);

      assert.ok(actual.includes(expectedSubstring));
    });

    it('should not include design preset note when designPreset is null', () => {
      const input = { flavor: 'lite', idioms: ['go'], versions: {}, designPreset: null };
      const forbiddenSubstring = 'Initial Design Preset';

      const actual = buildMasterInstructions(input);

      assert.ok(!actual.includes(forbiddenSubstring));
    });

    it('should include an instruction link for each idiom', () => {
      const input = {
        flavor: 'lite',
        idioms: ['typescript', 'python'],
        versions: {},
        designPreset: null,
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
        designPreset: null,
      };
      const expectedSubstring1 = '## Agent Roles';
      const expectedSubstring2 = 'agent-roles.md';

      const actual = buildMasterInstructions(input);

      assert.ok(actual.includes(expectedSubstring1));
      assert.ok(actual.includes(expectedSubstring2));
    });
  });
});
