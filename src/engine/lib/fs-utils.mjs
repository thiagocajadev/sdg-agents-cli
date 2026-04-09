import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function getDirectories(source) {
  if (!fs.existsSync(source)) return [];
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const childItemName of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function filterContentByVersion(content, targetVersion) {
  if (!targetVersion) return content;

  const targetNum = parseVersionNumber(targetVersion);
  if (targetNum === null) return content;

  const tagRegex = /<([a-zA-Z0-9-]+)\b[^>]*\bversion="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g;

  return content.replace(tagRegex, (match, _tagName, condition, _innerContent) => {
    if (evaluateVersionCondition(condition, targetNum)) {
      return match;
    }
    return '';
  });
}

function parseVersionNumber(v) {
  const match = String(v).match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

function evaluateVersionCondition(condition, targetNum) {
  const match = condition.match(/([<>=]+)?\s*(\d+(\.\d+)?)/);
  if (!match) return true;

  const operator = match[1] || '==';
  const condNum = parseFloat(match[2]);

  switch (operator) {
    case '>=':
      return targetNum >= condNum;
    case '<=':
      return targetNum <= condNum;
    case '>':
      return targetNum > condNum;
    case '<':
      return targetNum < condNum;
    case '==':
      return targetNum === condNum;
    case '=':
      return targetNum === condNum;
    default:
      return true;
  }
}

function getDirname(importMetaUrl) {
  return path.dirname(fileURLToPath(importMetaUrl));
}

function runIfDirect(importMetaUrl, fn) {
  if (fileURLToPath(importMetaUrl) === path.resolve(process.argv[1])) {
    fn().catch((error) => {
      if (error.name === 'ExitPromptError') {
        console.log('\n\n  Aborted.\n');
        process.exit(0);
      }
      console.error(error);
      process.exit(1);
    });
  }
}

const FsUtils = {
  getDirectories,
  copyRecursiveSync,
  filterContentByVersion,
  parseVersionNumber,
  evaluateVersionCondition,
  getDirname,
  runIfDirect,
};

export { FsUtils };
