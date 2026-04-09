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
      try {
        prepareProjectStructure(tmpDir);
        assert.ok(fs.existsSync(path.join(tmpDir, '.ai', 'instructions')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.ai', 'workflows')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.ai', 'commands')));
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
      try {
        const selections = { flavor: 'lite', idioms: ['go'], versions: { go: null } };
        prepareProjectStructure(tmpDir);
        injectRulesets(tmpDir, selections);
        assert.ok(fs.existsSync(path.join(tmpDir, '.ai', 'instructions', 'core')));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should copy flavor files to .ai/instructions/flavor/', () => {
      const tmpDir = makeTempDir();
      try {
        const selections = { flavor: 'lite', idioms: ['go'], versions: { go: null } };
        prepareProjectStructure(tmpDir);
        injectRulesets(tmpDir, selections);
        assert.ok(fs.existsSync(path.join(tmpDir, '.ai', 'instructions', 'flavor')));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should copy idiom files to .ai/instructions/idioms/{idiom}/', () => {
      const tmpDir = makeTempDir();
      try {
        const selections = { flavor: 'lite', idioms: ['go'], versions: { go: null } };
        prepareProjectStructure(tmpDir);
        injectRulesets(tmpDir, selections);
        assert.ok(fs.existsSync(path.join(tmpDir, '.ai', 'instructions', 'idioms', 'go')));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should copy templates and commands to .ai/', () => {
      const tmpDir = makeTempDir();
      try {
        const selections = { flavor: 'lite', idioms: ['go'], versions: { go: null } };
        prepareProjectStructure(tmpDir);
        injectRulesets(tmpDir, selections);
        assert.ok(fs.existsSync(path.join(tmpDir, '.ai', 'instructions', 'templates')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.ai', 'commands')));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should inject only backend.md for backend-only idiom (go)', () => {
      const tmpDir = makeTempDir();
      try {
        const selections = { flavor: 'lite', idioms: ['go'], versions: { go: null } };
        prepareProjectStructure(tmpDir);
        injectRulesets(tmpDir, selections);
        const competenciesDir = path.join(tmpDir, '.ai', 'instructions', 'competencies');
        assert.ok(fs.existsSync(path.join(competenciesDir, 'backend.md')));
        assert.ok(!fs.existsSync(path.join(competenciesDir, 'frontend.md')));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should inject both backend.md and frontend.md for fullstack idiom (typescript)', () => {
      const tmpDir = makeTempDir();
      try {
        const selections = {
          flavor: 'lite',
          idioms: ['typescript'],
          versions: { typescript: null },
        };
        prepareProjectStructure(tmpDir);
        injectRulesets(tmpDir, selections);
        const competenciesDir = path.join(tmpDir, '.ai', 'instructions', 'competencies');
        assert.ok(fs.existsSync(path.join(competenciesDir, 'backend.md')));
        assert.ok(fs.existsSync(path.join(competenciesDir, 'frontend.md')));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should inject only backend.md for backend-only idiom (python)', () => {
      const tmpDir = makeTempDir();
      try {
        const selections = { flavor: 'lite', idioms: ['python'], versions: { python: null } };
        prepareProjectStructure(tmpDir);
        injectRulesets(tmpDir, selections);
        const competenciesDir = path.join(tmpDir, '.ai', 'instructions', 'competencies');
        assert.ok(fs.existsSync(path.join(competenciesDir, 'backend.md')));
        assert.ok(!fs.existsSync(path.join(competenciesDir, 'frontend.md')));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should handle multiple idioms and copy all of them', () => {
      const tmpDir = makeTempDir();
      try {
        const selections = {
          flavor: 'vertical-slice',
          idioms: ['typescript', 'python'],
          versions: { typescript: null, python: null },
        };
        prepareProjectStructure(tmpDir);
        injectRulesets(tmpDir, selections);
        assert.ok(fs.existsSync(path.join(tmpDir, '.ai', 'instructions', 'idioms', 'typescript')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.ai', 'instructions', 'idioms', 'python')));
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe('injectPrompts()', () => {
    it('should create .ai/prompts/dev-tracks/ with the selected track', () => {
      const tmpDir = makeTempDir();
      try {
        injectPrompts(tmpDir, '00-lite-mode');
        assert.ok(fs.existsSync(path.join(tmpDir, '.ai', 'prompts', 'dev-tracks')));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should replace existing .ai/prompts/ on re-injection', () => {
      const tmpDir = makeTempDir();
      try {
        const promptsDir = path.join(tmpDir, '.ai', 'prompts');
        fs.mkdirSync(promptsDir, { recursive: true });
        fs.writeFileSync(path.join(promptsDir, 'old-file.txt'), 'stale content');

        injectPrompts(tmpDir, '00-lite-mode');

        assert.ok(!fs.existsSync(path.join(promptsDir, 'old-file.txt')));
        assert.ok(fs.existsSync(path.join(tmpDir, '.ai', 'prompts', 'dev-tracks')));
      } finally {
        cleanup(tmpDir);
      }
    });

    it('should copy all tracks when track is "all"', () => {
      const tmpDir = makeTempDir();
      try {
        injectPrompts(tmpDir, 'all');
        const devTracksDir = path.join(tmpDir, '.ai', 'prompts', 'dev-tracks');
        assert.ok(fs.existsSync(devTracksDir));
        const tracks = fs.readdirSync(devTracksDir);
        assert.ok(tracks.length > 1);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe('collectOutputSummary()', () => {
    it('should list correct directories for agents mode', () => {
      const selections = {
        mode: 'agents',
        flavor: 'lite',
        idioms: ['typescript', 'go'],
        track: null,
      };
      const { directories } = collectOutputSummary(selections);
      assert.ok(directories.includes('.ai/instructions/core/'));
      assert.ok(directories.includes('.ai/instructions/flavor/'));
      assert.ok(directories.includes('.ai/instructions/idioms/typescript/'));
      assert.ok(directories.includes('.ai/instructions/idioms/go/'));
      assert.ok(directories.includes('.ai/workflows/'));
      assert.ok(directories.includes('.ai/commands/'));
    });

    it('should list prompt track directory for prompts mode', () => {
      const selections = {
        mode: 'prompts',
        flavor: null,
        idioms: [],
        track: '00-lite-mode',
      };
      const { directories } = collectOutputSummary(selections);
      assert.ok(directories.includes('.ai/prompts/dev-tracks/'));
    });

    it('should return empty directories for unknown mode', () => {
      const selections = { mode: 'unknown', flavor: null, idioms: [], track: null };
      const { directories } = collectOutputSummary(selections);
      assert.deepEqual(directories, []);
    });
  });
});
