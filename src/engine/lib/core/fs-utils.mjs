import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function getDirectories(source) {
  if (!fs.existsSync(source)) {
    const emptyList = [];
    return emptyList;
  }

  const directoryEntries = fs.readdirSync(source, { withFileTypes: true });
  const directoryNames = directoryEntries
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  return directoryNames;
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
  if (!targetVersion) {
    const originalContent = content;
    return originalContent;
  }

  const targetNum = parseVersionNumber(targetVersion);
  if (targetNum === null) {
    const unparsedContent = content;
    return unparsedContent;
  }

  const tagRegex = /<([a-zA-Z0-9-]+)\b[^>]*\bversion="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g;

  const filtered = content.replace(tagRegex, (match, _tagName, condition, _innerContent) => {
    const isVisible = evaluateVersionCondition(condition, targetNum);
    if (isVisible) {
      const visibleContent = match;
      return visibleContent;
    }
    const emptyString = '';
    return emptyString;
  });

  return filtered;
}

function parseVersionNumber(versionString) {
  const match = String(versionString).match(/(\d+(\.\d+)?)/);
  const versionNum = match ? parseFloat(match[1]) : null;
  return versionNum;
}

function evaluateVersionCondition(condition, targetNum) {
  const match = condition.match(/([<>=]+)?\s*(\d+(\.\d+)?)/);
  if (!match) {
    const isValidByDefault = true;
    return isValidByDefault;
  }

  const operator = match[1] || '==';
  const condNum = parseFloat(match[2]);

  switch (operator) {
    case '>=': {
      const isGreaterOrEqual = targetNum >= condNum;
      return isGreaterOrEqual;
    }
    case '<=': {
      const isLesserOrEqual = targetNum <= condNum;
      return isLesserOrEqual;
    }
    case '>': {
      const isGreater = targetNum > condNum;
      return isGreater;
    }
    case '<': {
      const isLesser = targetNum < condNum;
      return isLesser;
    }
    case '==': {
      const isEqual = targetNum === condNum;
      return isEqual;
    }
    case '=': {
      const isStrictEqual = targetNum === condNum;
      return isStrictEqual;
    }
    default: {
      const defaultMatch = true;
      return defaultMatch;
    }
  }
}

function getDirname(importMetaUrl) {
  const dirname = path.dirname(fileURLToPath(importMetaUrl));
  return dirname;
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
    if (match) {
      const indentation = match[1];
      return indentation;
    }
  }
  const defaultIndentation = '  ';
  return defaultIndentation;
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
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);
    return parsed;
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
