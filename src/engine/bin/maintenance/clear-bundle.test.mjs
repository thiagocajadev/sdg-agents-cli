import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Cleaner } from './clear-bundle.mjs';

const { findBacklogsAtRisk } = Cleaner;

describe('Cleaner.findBacklogsAtRisk()', () => {
  let tempDir;

  before(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdg-clear-test-'));
  });

  after(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return empty when items list has no .ai entry', () => {
    const input = [{ name: '.sdg-prompts', fullPath: path.join(tempDir, '.sdg-prompts') }];
    const expected = [];

    const actual = findBacklogsAtRisk(input);

    assert.deepEqual(actual, expected);
  });

  it('should return empty when .ai/backlog/ does not exist', () => {
    const aiDir = path.join(tempDir, 'case-no-backlog', '.ai');
    fs.mkdirSync(aiDir, { recursive: true });
    const input = [{ name: '.ai', fullPath: aiDir }];
    const expected = [];

    const actual = findBacklogsAtRisk(input);

    assert.deepEqual(actual, expected);
  });

  it('should return empty when .ai/backlog/ exists but is empty', () => {
    const aiDir = path.join(tempDir, 'case-empty-backlog', '.ai');
    fs.mkdirSync(path.join(aiDir, 'backlog'), { recursive: true });
    const input = [{ name: '.ai', fullPath: aiDir }];
    const expected = [];

    const actual = findBacklogsAtRisk(input);

    assert.deepEqual(actual, expected);
  });

  it('should return backlog path when .ai/backlog/ has content', () => {
    const aiDir = path.join(tempDir, 'case-populated', '.ai');
    const backlogDir = path.join(aiDir, 'backlog');
    fs.mkdirSync(backlogDir, { recursive: true });
    fs.writeFileSync(path.join(backlogDir, 'tasks.md'), '# Active\n');
    const input = [{ name: '.ai', fullPath: aiDir }];
    const expected = [backlogDir];

    const actual = findBacklogsAtRisk(input);

    assert.deepEqual(actual, expected);
  });

  it('should detect populated backlog inside monorepo packages', () => {
    const monoAiDir = path.join(tempDir, 'monorepo', 'packages', 'foo', '.ai');
    const monoBacklog = path.join(monoAiDir, 'backlog');
    fs.mkdirSync(monoBacklog, { recursive: true });
    fs.writeFileSync(path.join(monoBacklog, 'learned.md'), 'lesson');
    const input = [{ name: 'packages/foo/.ai', fullPath: monoAiDir }];
    const expected = [monoBacklog];

    const actual = findBacklogsAtRisk(input);

    assert.deepEqual(actual, expected);
  });
});
