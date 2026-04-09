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
      try {
        writeAgentConfig(tmpDir, 'content');
        assert.ok(fs.existsSync(path.join(tmpDir, '.ai', 'skill', 'AGENTS.md')));
        assert.equal(
          fs.readFileSync(path.join(tmpDir, '.ai', 'skill', 'AGENTS.md'), 'utf8'),
          'content'
        );
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should create .ai/skill/ directory if it does not exist', () => {
      const tmpDir = makeTempDir();
      try {
        writeAgentConfig(tmpDir, 'content');
        assert.ok(fs.existsSync(path.join(tmpDir, '.ai', 'skill')));
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe('writeManifest()', () => {
    it('should create .ai/.sdg-manifest.json', () => {
      const tmpDir = makeTempDir();
      try {
        const selections = { flavor: 'lite', idioms: ['go'], versions: { go: null } };
        writeManifest(tmpDir, selections, '1.0.0');
        assert.ok(fs.existsSync(path.join(tmpDir, '.ai', '.sdg-manifest.json')));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should create .ai/ directory if it does not exist', () => {
      const tmpDir = makeTempDir();
      try {
        const selections = { flavor: 'lite', idioms: ['go'], versions: {} };
        writeManifest(tmpDir, selections, '1.0.0');
        assert.ok(fs.existsSync(path.join(tmpDir, '.ai')));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should write valid JSON with all required fields', () => {
      const tmpDir = makeTempDir();
      try {
        const selections = { flavor: 'lite', idioms: ['go'], versions: {} };
        writeManifest(tmpDir, selections, '2.0.0');
        const raw = fs.readFileSync(path.join(tmpDir, '.ai', '.sdg-manifest.json'), 'utf8');
        const manifest = JSON.parse(raw);
        assert.ok(manifest.generatedAt);
        assert.equal(manifest.sdgAgentVersion, '2.0.0');
        assert.ok(typeof manifest.contentHashes === 'object');
        assert.deepEqual(manifest.selections, selections);
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should store selections exactly as passed', () => {
      const tmpDir = makeTempDir();
      try {
        const selections = {
          flavor: 'vertical-slice',
          idioms: ['typescript', 'python'],
          versions: { typescript: '6.0', python: '3.13' },
        };
        writeManifest(tmpDir, selections, '1.0.0');
        const manifest = JSON.parse(
          fs.readFileSync(path.join(tmpDir, '.ai', '.sdg-manifest.json'), 'utf8')
        );
        assert.deepEqual(manifest.selections, selections);
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should store a valid ISO generatedAt timestamp', () => {
      const tmpDir = makeTempDir();
      try {
        const before = Date.now();
        writeManifest(tmpDir, { flavor: 'lite', idioms: ['go'], versions: {} }, '1.0.0');
        const after = Date.now();
        const manifest = JSON.parse(
          fs.readFileSync(path.join(tmpDir, '.ai', '.sdg-manifest.json'), 'utf8')
        );
        const ts = new Date(manifest.generatedAt).getTime();
        assert.ok(ts >= before && ts <= after);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe('buildMasterInstructions()', () => {
    it('should include all 4 Golden Laws', () => {
      const selections = { flavor: 'lite', idioms: ['go'], versions: {}, designPreset: null };
      const result = buildMasterInstructions(selections);
      assert.ok(result.includes('The Law of Hardening'));
      assert.ok(result.includes('The Law of Resilience'));
      assert.ok(result.includes('The Law of the Cascade'));
      assert.ok(result.includes('The Law of Visual Excellence'));
    });

    it('should include the First Session note with feat: Foundation', () => {
      const selections = { flavor: 'lite', idioms: ['go'], versions: {}, designPreset: null };
      const result = buildMasterInstructions(selections);
      assert.ok(result.includes('First Session'));
      assert.ok(result.includes('feat: Foundation'));
    });

    it('should include the Working Protocol workflow content', () => {
      const selections = { flavor: 'lite', idioms: ['go'], versions: {}, designPreset: null };
      const result = buildMasterInstructions(selections);
      assert.ok(result.includes('Working Protocol'));
    });

    it('should include intent prefix guide (feat/fix/docs)', () => {
      const selections = { flavor: 'lite', idioms: ['go'], versions: {}, designPreset: null };
      const result = buildMasterInstructions(selections);
      assert.ok(result.includes('feat:'));
      assert.ok(result.includes('fix:'));
      assert.ok(result.includes('docs:'));
    });

    it('should include backend competency link for backend-only idiom (go)', () => {
      const selections = { flavor: 'lite', idioms: ['go'], versions: {}, designPreset: null };
      const result = buildMasterInstructions(selections);
      assert.ok(result.includes('.ai/instructions/competencies/backend.md'));
      assert.ok(!result.includes('.ai/instructions/competencies/frontend.md'));
    });

    it('should include both competency links for fullstack idiom (typescript)', () => {
      const selections = {
        flavor: 'lite',
        idioms: ['typescript'],
        versions: {},
        designPreset: 'glass',
      };
      const result = buildMasterInstructions(selections);
      assert.ok(result.includes('.ai/instructions/competencies/backend.md'));
      assert.ok(result.includes('.ai/instructions/competencies/frontend.md'));
    });

    it('should include design preset note in uppercase when designPreset is set', () => {
      const selections = {
        flavor: 'lite',
        idioms: ['typescript'],
        versions: {},
        designPreset: 'bento',
      };
      const result = buildMasterInstructions(selections);
      assert.ok(result.includes('BENTO'));
    });

    it('should not include design preset note when designPreset is null', () => {
      const selections = { flavor: 'lite', idioms: ['go'], versions: {}, designPreset: null };
      const result = buildMasterInstructions(selections);
      assert.ok(!result.includes('Initial Design Preset'));
    });

    it('should include an instruction link for each idiom', () => {
      const selections = {
        flavor: 'lite',
        idioms: ['typescript', 'python'],
        versions: {},
        designPreset: null,
      };
      const result = buildMasterInstructions(selections);
      assert.ok(result.includes('idioms/typescript/patterns.md'));
      assert.ok(result.includes('idioms/python/patterns.md'));
    });
  });
});
