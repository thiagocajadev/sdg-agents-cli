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

function copyRecursiveSync(src, dest, options = {}) {
  const { exclude = [] } = options;
  if (!fs.existsSync(src)) return;

  const itemName = path.basename(src);
  if (exclude.includes(itemName)) return;

  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const childItemName of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName), options);
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function filterContentByVersion(content, targetVersion) {
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

function getDirname(importMetaUrl) {
  return path.dirname(fileURLToPath(importMetaUrl));
}

function runIfDirect(importMetaUrl, fn) {
  const currentFile = fileURLToPath(importMetaUrl);
  if (!process.argv[1]) return;

  const entryFile = fs.realpathSync(path.resolve(process.argv[1]));
  if (currentFile === entryFile) {
    const result = fn();
    if (result && typeof result.catch === 'function') {
      result.catch((error) => {
        if (error.name === 'ExitPromptError') {
          console.log('\n\n  Aborted.\n');
          process.exit(0);
        }
        console.error(error);
        process.exit(1);
      });
    }
  }
}

function detectIndentation(content) {
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^(\s+)/);
    if (match) return match[1];
  }
  return '  ';
}

function writeJsonAtomic(filePath, data, originalContent = null) {
  const indent = originalContent ? detectIndentation(originalContent) : '  ';
  const newContent = JSON.stringify(data, null, indent) + '\n';

  if (originalContent === newContent) return false;

  try {
    fs.writeFileSync(filePath, newContent);
    return true;
  } catch {
    return false;
  }
}

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export const FsUtils = {
  getDirectories,
  copyRecursiveSync,
  filterContentByVersion,
  getDirname,
  runIfDirect,
  detectIndentation,
  writeJsonAtomic,
  safeReadJson,
};
