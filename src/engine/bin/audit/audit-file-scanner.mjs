import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();

const MAINTAINER_DIRECTORIES = [
  path.join(PROJECT_ROOT, 'src', 'engine', 'lib', 'core'),
  path.join(PROJECT_ROOT, 'src', 'engine', 'lib', 'domain'),
  path.join(PROJECT_ROOT, 'src', 'engine', 'lib', 'infra'),
  path.join(PROJECT_ROOT, 'src', 'engine', 'bin', 'init'),
  path.join(PROJECT_ROOT, 'src', 'engine', 'bin', 'audit'),
  path.join(PROJECT_ROOT, 'src', 'engine', 'bin', 'maintenance'),
  path.join(PROJECT_ROOT, 'src', 'engine', 'bin', 'lifecycle'),
  path.join(PROJECT_ROOT, 'src', 'engine', 'config'),
];

function getMaintainerFiles() {
  const sourceFiles = MAINTAINER_DIRECTORIES.flatMap((directory) => {
    if (!fs.existsSync(directory)) return [];
    return fs
      .readdirSync(directory)
      .filter((file) => file.endsWith('.mjs') && !file.endsWith('.test.mjs'))
      .map((file) => path.join(directory, file));
  });
  return sourceFiles;
}

function getMaintainerTestFiles() {
  const testFiles = MAINTAINER_DIRECTORIES.flatMap((directory) => {
    if (!fs.existsSync(directory)) return [];
    return fs
      .readdirSync(directory)
      .filter((file) => file.endsWith('.test.mjs'))
      .map((file) => path.join(directory, file));
  });
  return testFiles;
}

function getFilesRecursive(baseDir, filterFn) {
  if (!fs.existsSync(baseDir)) return [];
  const files = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
        walk(fullPath);
      } else if (entry.isFile() && filterFn(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  walk(baseDir);
  const collectedFiles = files;
  return collectedFiles;
}

export const AuditFileScanner = { getMaintainerFiles, getMaintainerTestFiles, getFilesRecursive };
