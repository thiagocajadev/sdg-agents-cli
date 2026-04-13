import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { RulesetInjector } from './ruleset-injector.mjs';

const { prepareProjectStructure, injectRulesets, injectPrompts, collectOutputSummary } =
  RulesetInjector;

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'sdg-test-'));
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('RulesetInjector', () => {
  describe('prepareProjectStructure()', () => {
    it('should create .ai/instructions, .ai/workflows and .ai/commands directories', () => {
      const tmpDir = makeTempDir();
      const expectedDirs = [
        path.join(tmpDir, '.ai', 'instructions'),
        path.join(tmpDir, '.ai', 'workflows'),
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

  describe('injectPrompts()', () => {
    it('should create .ai/prompts/dev-tracks/ with the selected track', () => {
      const tmpDir = makeTempDir();
      const inputTrack = '00-lite-mode';
      const expectedDir = path.join(tmpDir, '.ai', 'prompts', 'dev-tracks');

      try {
        injectPrompts(tmpDir, inputTrack);

        assert.ok(fs.existsSync(expectedDir));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should replace existing .ai/prompts/ on re-injection', () => {
      const tmpDir = makeTempDir();
      const inputTrack = '00-lite-mode';
      const promptsDir = path.join(tmpDir, '.ai', 'prompts');
      const staleFile = path.join(promptsDir, 'old-file.txt');
      const expectedDir = path.join(tmpDir, '.ai', 'prompts', 'dev-tracks');

      try {
        fs.mkdirSync(promptsDir, { recursive: true });
        fs.writeFileSync(staleFile, 'stale content');

        injectPrompts(tmpDir, inputTrack);

        assert.ok(!fs.existsSync(staleFile));
        assert.ok(fs.existsSync(expectedDir));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should copy all tracks when track is "all"', () => {
      const tmpDir = makeTempDir();
      const inputTrack = 'all';
      const expectedDir = path.join(tmpDir, '.ai', 'prompts', 'dev-tracks');

      try {
        injectPrompts(tmpDir, inputTrack);

        assert.ok(fs.existsSync(expectedDir));
        const actualTracks = fs.readdirSync(expectedDir);
        assert.ok(actualTracks.length > 1);
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
        track: null,
      };
      const expectedDirs = [
        '.ai/instructions/core/',
        '.ai/instructions/flavor/',
        '.ai/instructions/idioms/typescript/',
        '.ai/instructions/idioms/go/',
        '.ai/workflows/',
        '.ai/commands/',
      ];

      const { directories: actual } = collectOutputSummary(inputSelections);

      expectedDirs.forEach((expected) => {
        assert.ok(actual.includes(expected));
      });
    });

    it('should list prompt track directory for prompts mode', () => {
      const inputSelections = {
        mode: 'prompts',
        flavor: null,
        idioms: [],
        track: '00-lite-mode',
      };
      const expectedDir = '.ai/prompts/dev-tracks/';

      const { directories: actual } = collectOutputSummary(inputSelections);

      assert.ok(actual.includes(expectedDir));
    });

    it('should return empty directories for unknown mode', () => {
      const inputSelections = { mode: 'unknown', flavor: null, idioms: [], track: null };
      const expected = [];

      const { directories: actual } = collectOutputSummary(inputSelections);

      assert.deepEqual(actual, expected);
    });
  });
});
