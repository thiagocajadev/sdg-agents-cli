import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AutoBump } from '../bin/auto-bump.mjs';

const { detectBumpType, bumpVersion } = AutoBump;

describe('AutoBump', () => {
  describe('detectBumpType()', () => {
    it('should return patch for fix: commits', () => {
      assert.equal(detectBumpType('fix: corrige typo no README'), 'patch');
    });

    it('should return patch for chore: commits', () => {
      assert.equal(detectBumpType('chore: atualiza dependencias'), 'patch');
    });

    it('should return minor for feat: commits', () => {
      assert.equal(detectBumpType('feat: adiciona novo comando export'), 'minor');
    });

    it('should return major for breaking change via ! prefix', () => {
      assert.equal(detectBumpType('feat!: remove suporte a Node 18'), 'major');
      assert.equal(detectBumpType('fix!: altera contrato da API'), 'major');
    });

    it('should return major for BREAKING CHANGE in footer', () => {
      const msg = 'refactor: reestrutura pipeline\n\nBREAKING CHANGE: remove flag --legacy';
      assert.equal(detectBumpType(msg), 'major');
    });

    it('should return skip for chore: bump version commits', () => {
      assert.equal(detectBumpType('chore: bump version to 1.2.3'), 'skip');
      assert.equal(detectBumpType('chore: bump version to 0.13.0'), 'skip');
    });
  });

  describe('bumpVersion()', () => {
    it('should increment patch', () => {
      assert.equal(bumpVersion('0.12.1', 'patch'), '0.12.2');
    });

    it('should increment minor and reset patch', () => {
      assert.equal(bumpVersion('0.12.1', 'minor'), '0.13.0');
    });

    it('should increment major and reset minor + patch', () => {
      assert.equal(bumpVersion('0.12.1', 'major'), '1.0.0');
    });

    it('should handle version 0.0.0', () => {
      assert.equal(bumpVersion('0.0.0', 'patch'), '0.0.1');
      assert.equal(bumpVersion('0.0.0', 'minor'), '0.1.0');
      assert.equal(bumpVersion('0.0.0', 'major'), '1.0.0');
    });
  });
});
