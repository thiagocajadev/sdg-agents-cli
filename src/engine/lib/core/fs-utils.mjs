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

function getDirname(importMetaUrl) {
  const dirname = path.dirname(fileURLToPath(importMetaUrl));
  return dirname;
}

function bootstrapIfDirect(importMetaUrl, entryFunction) {
  const currentFile = fileURLToPath(importMetaUrl);
  if (!process.argv[1]) return;

  const entryFile = fs.realpathSync(path.resolve(process.argv[1]));
  if (currentFile === entryFile) {
    const result = entryFunction();
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
    const jsonText = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch {
    return null;
  }
}

function isMaintainerMode() {
  const projectRoot = process.cwd();
  const pkgPath = path.join(projectRoot, 'package.json');
  const pkg = safeReadJson(pkgPath);
  const assetsPath = path.join(projectRoot, 'src', 'assets', 'instructions');
  const isSdgAgents = pkg?.name === 'sdg-agents';
  const hasAssets = fs.existsSync(assetsPath);
  const maintainerMode = isSdgAgents && hasAssets;
  return maintainerMode;
}

export const FsUtils = {
  getDirectories,
  copyRecursiveSync,
  getDirname,
  bootstrapIfDirect,
  detectIndentation,
  writeJsonAtomic,
  safeReadJson,
  isMaintainerMode,
};
