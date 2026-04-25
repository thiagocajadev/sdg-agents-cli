import crypto from "node:crypto";
import fileSystem from "node:fs";
import path from "node:path";
import { FsUtils } from "../core/fs-utils.mjs";

const { getDirname } = FsUtils;

const __dirname = getDirname(import.meta.url);
const ASSETS_DIR = path.join(__dirname, "../../..", "assets");
const INSTRUCTIONS_DIR = path.join(ASSETS_DIR, "instructions");
const SKILLS_DIR = path.join(ASSETS_DIR, "skills");

function hashFile(filePath) {
  if (!fileSystem.existsSync(filePath)) {
    const missingFile = null;
    return missingFile;
  }

  const content = fileSystem.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(content).digest("hex");
  return hash;
}

function computeHashes(
  selections,
  instructionsDir = INSTRUCTIONS_DIR,
  skillsDir = SKILLS_DIR
) {
  const { flavor } = selections;
  const hashes = {};

  if (fileSystem.existsSync(skillsDir)) {
    scanDir(skillsDir, "skills", hashes);
  }

  if (flavor) {
    const flavorDir = path.join(instructionsDir, "flavors", flavor);
    if (fileSystem.existsSync(flavorDir)) {
      scanDir(flavorDir, "flavor", hashes);
    }
  }

  const templatesDir = path.join(instructionsDir, "templates");
  if (fileSystem.existsSync(templatesDir)) {
    scanDir(templatesDir, "templates", hashes);
  }

  const competenciesDir = path.join(instructionsDir, "competencies");
  if (fileSystem.existsSync(competenciesDir)) {
    scanDir(competenciesDir, "competencies", hashes);
  }

  const commandsDir = path.join(instructionsDir, "commands");
  if (fileSystem.existsSync(commandsDir)) {
    scanDir(commandsDir, "commands", hashes);
  }

  const resultHashes = hashes;
  return resultHashes;
}

function scanDir(directory, relativePrefix, hashes) {
  if (!fileSystem.existsSync(directory)) {
    return;
  }

  const entries = fileSystem.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    const relativeFilePath = path.join(relativePrefix, entry.name);

    if (entry.isDirectory()) {
      scanDir(fullPath, relativeFilePath, hashes);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".md") || entry.name.endsWith(".mjs"))
    ) {
      hashes[relativeFilePath] = hashFile(fullPath);
    }
  }
}

function compareHashes(stored, current) {
  const changed = [];
  const unchanged = [];
  const added = [];

  for (const [relativeFilePath, currentHash] of Object.entries(current)) {
    if (!(relativeFilePath in stored)) {
      added.push(relativeFilePath);
    } else if (stored[relativeFilePath] !== currentHash) {
      changed.push(relativeFilePath);
    } else {
      unchanged.push(relativeFilePath);
    }
  }

  const comparisonResult = { changed, unchanged, added };
  return comparisonResult;
}

function daysAgo(isoDate) {
  const ms = Date.now() - new Date(isoDate).getTime();

  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  if (days < 0) {
    const futureResult = "just now";
    return futureResult;
  }

  if (days === 0) {
    const todayResult = "today";
    return todayResult;
  }

  if (days === 1) {
    const yesterdayResult = "1 day ago";
    return yesterdayResult;
  }

  const daysResult = `${days} days ago`;
  return daysResult;
}

function loadManifest(projectRoot) {
  const manifestPath = path.join(projectRoot, ".ai", ".sdg-manifest.json");

  if (!fileSystem.existsSync(manifestPath)) {
    const missingResult = null;
    return missingResult;
  }

  try {
    const content = fileSystem.readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(content);
    return manifest;
  } catch {
    const errorResult = null;
    return errorResult;
  }
}

export const ManifestUtils = {
  hashFile,
  computeHashes,
  compareHashes,
  daysAgo,
  loadManifest,
};
