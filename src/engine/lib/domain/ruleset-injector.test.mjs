import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { RulesetInjector } from './ruleset-injector.mjs';

const { prepareProjectStructure, injectRulesets, collectOutputSummary } = RulesetInjector;

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'sdg-test-'));
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('RulesetInjector', () => {
  describe('prepareProjectStructure()', () => {
    it('should create .ai/instructions and .ai/commands directories', () => {
      const tmpDir = makeTempDir();
      const expectedDirs = [
        path.join(tmpDir, '.ai', 'instructions'),
        path.join(tmpDir, '.ai', 'commands'),
      ];

      try {
        prepareProjectStructure(tmpDir);

        expectedDirs.forEach((expectedDir) => {
          assert.ok(fs.existsSync(expectedDir));
        });
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should be idempotent — calling twice does not throw', () => {
      const tmpDir = makeTempDir();

      try {
        prepareProjectStructure(tmpDir);

        assert.doesNotThrow(() => prepareProjectStructure(tmpDir));
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe('injectRulesets()', () => {
    it('should copy core/ to .ai/instructions/core/', () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: 'lite', idioms: ['go'], versions: { go: null } };
      const expectedDir = path.join(tmpDir, '.ai', 'instructions', 'core');

      try {
        prepareProjectStructure(tmpDir);

        injectRulesets(tmpDir, inputSelections);

        assert.ok(fs.existsSync(expectedDir));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should copy flavor files to .ai/instructions/flavor/', () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: 'lite', idioms: ['go'], versions: { go: null } };
      const expectedDir = path.join(tmpDir, '.ai', 'instructions', 'flavor');

      try {
        prepareProjectStructure(tmpDir);

        injectRulesets(tmpDir, inputSelections);

        assert.ok(fs.existsSync(expectedDir));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should copy idiom files to .ai/instructions/idioms/{idiom}/', () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: 'lite', idioms: ['go'], versions: { go: null } };
      const expectedDir = path.join(tmpDir, '.ai', 'instructions', 'idioms', 'go');

      try {
        prepareProjectStructure(tmpDir);

        injectRulesets(tmpDir, inputSelections);

        assert.ok(fs.existsSync(expectedDir));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should copy templates and commands to .ai/', () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: 'lite', idioms: ['go'], versions: { go: null } };
      const expectedDir1 = path.join(tmpDir, '.ai', 'instructions', 'templates');
      const expectedDir2 = path.join(tmpDir, '.ai', 'commands');

      try {
        prepareProjectStructure(tmpDir);

        injectRulesets(tmpDir, inputSelections);

        assert.ok(fs.existsSync(expectedDir1));
        assert.ok(fs.existsSync(expectedDir2));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should inject only backend.md for backend-only idiom (go)', () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: 'lite', idioms: ['go'], versions: { go: null } };
      const expectedBackend = 'backend.md';
      const forbiddenFrontend = 'frontend.md';

      try {
        prepareProjectStructure(tmpDir);

        injectRulesets(tmpDir, inputSelections);

        const competenciesDir = path.join(tmpDir, '.ai', 'instructions', 'competencies');
        assert.ok(fs.existsSync(path.join(competenciesDir, expectedBackend)));
        assert.ok(!fs.existsSync(path.join(competenciesDir, forbiddenFrontend)));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should inject both backend.md and frontend.md for fullstack idiom (typescript)', () => {
      const tmpDir = makeTempDir();
      const inputSelections = {
        flavor: 'lite',
        idioms: ['typescript'],
        versions: { typescript: null },
      };
      const expectedBackend = 'backend.md';
      const expectedFrontend = 'frontend.md';

      try {
        prepareProjectStructure(tmpDir);

        injectRulesets(tmpDir, inputSelections);

        const competenciesDir = path.join(tmpDir, '.ai', 'instructions', 'competencies');
        assert.ok(fs.existsSync(path.join(competenciesDir, expectedBackend)));
        assert.ok(fs.existsSync(path.join(competenciesDir, expectedFrontend)));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should inject only backend.md for backend-only idiom (python)', () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: 'lite', idioms: ['python'], versions: { python: null } };
      const expectedBackend = 'backend.md';

      try {
        prepareProjectStructure(tmpDir);

        injectRulesets(tmpDir, inputSelections);

        const competenciesDir = path.join(tmpDir, '.ai', 'instructions', 'competencies');
        assert.ok(fs.existsSync(path.join(competenciesDir, expectedBackend)));
        assert.ok(!fs.existsSync(path.join(competenciesDir, 'frontend.md')));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should handle multiple idioms and copy all of them', () => {
      const tmpDir = makeTempDir();
      const inputSelections = {
        flavor: 'vertical-slice',
        idioms: ['typescript', 'python'],
        versions: { typescript: null, python: null },
      };
      const expectedDir1 = path.join(tmpDir, '.ai', 'instructions', 'idioms', 'typescript');
      const expectedDir2 = path.join(tmpDir, '.ai', 'instructions', 'idioms', 'python');

      try {
        prepareProjectStructure(tmpDir);

        injectRulesets(tmpDir, inputSelections);

        assert.ok(fs.existsSync(expectedDir1));
        assert.ok(fs.existsSync(expectedDir2));
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe('collectOutputSummary()', () => {
    it('should list correct directories for agents mode', () => {
      const inputSelections = {
        mode: 'agents',
        flavor: 'lite',
        idioms: ['typescript', 'go'],
      };
      const expectedDirs = [
        '.ai/instructions/core/',
        '.ai/instructions/flavor/',
        '.ai/instructions/idioms/typescript/',
        '.ai/instructions/idioms/go/',
        '.ai/instructions/templates/',
        '.ai/instructions/competencies/',
        '.ai/commands/',
      ];

      const { directories: actual } = collectOutputSummary(inputSelections);

      expectedDirs.forEach((expected) => {
        assert.ok(actual.includes(expected));
      });
    });

    it('should omit flavor directory when flavor is null', () => {
      const inputSelections = { mode: 'agents', flavor: null, idioms: [] };

      const { directories: actual } = collectOutputSummary(inputSelections);

      assert.ok(!actual.includes('.ai/instructions/flavor/'));
      assert.ok(actual.includes('.ai/instructions/core/'));
    });
  });
});
