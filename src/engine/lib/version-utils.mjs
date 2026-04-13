/**
 * Version Utils — Logic for checking updates on npm registry.
 */

const REGISTRY_URL = 'https://registry.npmjs.org/sdg-agents/latest';
const CHECK_TIMEOUT_MS = 2000;

/**
 * Fetches the latest version from npm registry.
 * Returns null if fetch fails or times out.
 */
async function getLatestVersion() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(REGISTRY_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    return data.version || null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Compares two semver strings (x.y.z).
 * Returns true if latest > current.
 */
function isNewer(current, latest) {
  if (!current || !latest) return false;
  if (current === latest) return false;

  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const currentPart = currentParts[i] || 0;
    const latestPart = latestParts[i] || 0;

    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }

  return false;
}

/**
 * High-level update check.
 * Returns { hasUpdate: boolean, latest: string | null }
 */
async function checkForUpdates(currentVersion) {
  const latest = await getLatestVersion();
  const hasUpdate = isNewer(currentVersion, latest);

  const result = {
    hasUpdate,
    latest,
  };

  return result;
}

export const VersionUtils = {
  checkForUpdates,
};
