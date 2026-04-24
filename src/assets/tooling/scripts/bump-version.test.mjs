import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fileSystem from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.join(__dirname, 'bump-version.mjs');

function makeTempProject(initialVersion) {
  const projectDir = fileSystem.mkdtempSync(path.join(os.tmpdir(), 'sdg-bump-test-'));
  const packagePath = path.join(projectDir, 'package.json');
  const packageData = { name: 'test-project', version: initialVersion };
  fileSystem.writeFileSync(packagePath, `${JSON.stringify(packageData, null, 2)}\n`);
  return { projectDir, packagePath };
}

function runScript(projectDir, args = []) {
  const stdout = execFileSync('node', [SCRIPT_PATH, ...args], {
    cwd: projectDir,
    encoding: 'utf8',
  });
  return stdout;
}

function readVersion(packagePath) {
  const raw = fileSystem.readFileSync(packagePath, 'utf8');
  const parsed = JSON.parse(raw);
  return parsed.version;
}

function cleanup(projectDir) {
  fileSystem.rmSync(projectDir, { recursive: true, force: true });
}

describe('bump-version.mjs', () => {
  it('should increment patch segment when arg is patch', () => {
    const { projectDir, packagePath } = makeTempProject('3.8.0');
    const expectedVersion = '3.8.1';

    try {
      const stdout = runScript(projectDir, ['patch']);
      const actualVersion = readVersion(packagePath);

      assert.equal(actualVersion, expectedVersion);
      assert.ok(stdout.includes('3.8.0 → 3.8.1'));
    } finally {
      cleanup(projectDir);
    }
  });

  it('should increment minor and reset patch when arg is minor', () => {
    const { projectDir, packagePath } = makeTempProject('3.8.2');
    const expectedVersion = '3.9.0';

    try {
      runScript(projectDir, ['minor']);
      const actualVersion = readVersion(packagePath);

      assert.equal(actualVersion, expectedVersion);
    } finally {
      cleanup(projectDir);
    }
  });

  it('should increment major and reset minor+patch when arg is major', () => {
    const { projectDir, packagePath } = makeTempProject('3.8.2');
    const expectedVersion = '4.0.0';

    try {
      runScript(projectDir, ['major']);
      const actualVersion = readVersion(packagePath);

      assert.equal(actualVersion, expectedVersion);
    } finally {
      cleanup(projectDir);
    }
  });

  it('should preserve package.json fields other than version', () => {
    const projectDir = fileSystem.mkdtempSync(path.join(os.tmpdir(), 'sdg-bump-test-'));
    const packagePath = path.join(projectDir, 'package.json');
    const originalPackage = {
      name: 'test-project',
      version: '1.0.0',
      description: 'fixture',
      scripts: { test: 'echo ok' },
      dependencies: { foo: '^1.0.0' },
    };
    fileSystem.writeFileSync(packagePath, `${JSON.stringify(originalPackage, null, 2)}\n`);

    try {
      runScript(projectDir, ['patch']);
      const actualRaw = fileSystem.readFileSync(packagePath, 'utf8');
      const actualParsed = JSON.parse(actualRaw);

      assert.equal(actualParsed.name, originalPackage.name);
      assert.equal(actualParsed.description, originalPackage.description);
      assert.deepEqual(actualParsed.scripts, originalPackage.scripts);
      assert.deepEqual(actualParsed.dependencies, originalPackage.dependencies);
      assert.equal(actualParsed.version, '1.0.1');
    } finally {
      cleanup(projectDir);
    }
  });

  it('should exit 1 when bump arg is invalid', () => {
    const { projectDir } = makeTempProject('1.0.0');

    try {
      assert.throws(() => runScript(projectDir, ['feat']));
    } finally {
      cleanup(projectDir);
    }
  });

  it('should exit 1 when bump arg is missing', () => {
    const { projectDir } = makeTempProject('1.0.0');

    try {
      assert.throws(() => runScript(projectDir, []));
    } finally {
      cleanup(projectDir);
    }
  });

  it('should exit 1 when package.json is absent', () => {
    const projectDir = fileSystem.mkdtempSync(path.join(os.tmpdir(), 'sdg-bump-test-'));

    try {
      assert.throws(() => runScript(projectDir, ['patch']));
    } finally {
      cleanup(projectDir);
    }
  });

  it('should not import child_process (zero git side-effects guarantee)', () => {
    const scriptSource = fileSystem.readFileSync(SCRIPT_PATH, 'utf8');

    assert.ok(!scriptSource.includes('child_process'));
    assert.ok(!scriptSource.includes('execSync'));
    assert.ok(!scriptSource.includes('exec('));
  });
});
