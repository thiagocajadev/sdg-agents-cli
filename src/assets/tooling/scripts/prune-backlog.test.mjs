import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fileSystem from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.join(__dirname, 'prune-backlog.mjs');

function makeTempProject() {
  const projectDir = fileSystem.mkdtempSync(path.join(os.tmpdir(), 'sdg-prune-test-'));
  const backlogDir = path.join(projectDir, '.ai', 'backlog');
  fileSystem.mkdirSync(backlogDir, { recursive: true });
  return { projectDir, backlogDir };
}

function writeTasks(backlogDir, content) {
  const tasksPath = path.join(backlogDir, 'tasks.md');
  fileSystem.writeFileSync(tasksPath, content);
  return tasksPath;
}

function runScript(projectDir, args = []) {
  const stdout = execFileSync('node', [SCRIPT_PATH, ...args], {
    cwd: projectDir,
    encoding: 'utf8',
  });
  return stdout;
}

function cleanup(projectDir) {
  fileSystem.rmSync(projectDir, { recursive: true, force: true });
}

function buildTasksWithDone(entryCount) {
  const doneEntries = Array.from(
    { length: entryCount },
    (_, index) => `- [DONE] entry ${entryCount - index} description text`
  ).join('\n');
  const content = `# Tasks\n\n## Active\n\n- _(idle)_\n\n## Done\n\n${doneEntries}\n`;
  return content;
}

describe('prune-backlog.mjs', () => {
  it('should keep only N most recent Done entries when total exceeds N', () => {
    const { projectDir, backlogDir } = makeTempProject();
    const inputContent = buildTasksWithDone(7);
    const tasksPath = writeTasks(backlogDir, inputContent);
    const expectedFirstKept = '- [DONE] entry 7 description text';
    const expectedLastKept = '- [DONE] entry 5 description text';
    const expectedDropped = '- [DONE] entry 4 description text';

    try {
      const stdout = runScript(projectDir, ['--keep', '3']);
      const actualContent = fileSystem.readFileSync(tasksPath, 'utf8');

      assert.ok(stdout.includes('Pruned: kept 3 / 7'));
      assert.ok(actualContent.includes(expectedFirstKept));
      assert.ok(actualContent.includes(expectedLastKept));
      assert.ok(!actualContent.includes(expectedDropped));
    } finally {
      cleanup(projectDir);
    }
  });

  it('should be idempotent when total entries already at or below keep threshold', () => {
    const { projectDir, backlogDir } = makeTempProject();
    const inputContent = buildTasksWithDone(2);
    const tasksPath = writeTasks(backlogDir, inputContent);
    const expectedContent = inputContent;

    try {
      const stdout = runScript(projectDir, ['--keep', '3']);
      const actualContent = fileSystem.readFileSync(tasksPath, 'utf8');

      assert.ok(stdout.includes('Nothing to prune'));
      assert.equal(actualContent, expectedContent);
    } finally {
      cleanup(projectDir);
    }
  });

  it('should default to keep=3 when --keep flag is omitted', () => {
    const { projectDir, backlogDir } = makeTempProject();
    const inputContent = buildTasksWithDone(5);
    const tasksPath = writeTasks(backlogDir, inputContent);

    try {
      runScript(projectDir, []);
      const actualContent = fileSystem.readFileSync(tasksPath, 'utf8');
      const actualEntryMatches = actualContent.match(/^- \[DONE\]/gm);
      const actualEntryCount = actualEntryMatches ? actualEntryMatches.length : 0;
      const expectedEntryCount = 3;

      assert.equal(actualEntryCount, expectedEntryCount);
    } finally {
      cleanup(projectDir);
    }
  });

  it('should preserve non-Done sections untouched', () => {
    const { projectDir, backlogDir } = makeTempProject();
    const inputContent = `# Tasks\n\n## Active\n\n- [IN_PROGRESS] live task\n\n## Backlog\n\n- [BACKLOG] pending item\n\n## Done\n\n- [DONE] old 1\n- [DONE] old 2\n- [DONE] old 3\n- [DONE] old 4\n`;
    const tasksPath = writeTasks(backlogDir, inputContent);

    try {
      runScript(projectDir, ['--keep', '2']);
      const actualContent = fileSystem.readFileSync(tasksPath, 'utf8');

      assert.ok(actualContent.includes('- [IN_PROGRESS] live task'));
      assert.ok(actualContent.includes('- [BACKLOG] pending item'));
      assert.ok(actualContent.includes('- [DONE] old 1'));
      assert.ok(actualContent.includes('- [DONE] old 2'));
      assert.ok(!actualContent.includes('- [DONE] old 3'));
      assert.ok(!actualContent.includes('- [DONE] old 4'));
    } finally {
      cleanup(projectDir);
    }
  });

  it('should exit 1 when tasks.md is missing', () => {
    const { projectDir } = makeTempProject();

    try {
      assert.throws(() => runScript(projectDir, ['--keep', '3']));
    } finally {
      cleanup(projectDir);
    }
  });
});
