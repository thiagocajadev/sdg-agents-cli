import { STACK_DISPLAY_NAMES } from '../../config/stack-display.mjs';

/**
 * Returns a human-readable display name for a given stack key.
 * Single source of truth — imported by all bin scripts.
 */
function displayName(stackKey) {
  if (!stackKey || stackKey === 'none') {
    const defaultLabel = '(none)';
    return defaultLabel;
  }
  if (stackKey === 'lite') {
    const liteLabel = 'Lite';
    return liteLabel;
  }
  if (stackKey === 'vertical-slice') {
    const verticalLabel = 'Vertical Slice';
    return verticalLabel;
  }
  if (stackKey === 'mvc') {
    const mvcLabel = 'MVC';
    return mvcLabel;
  }
  if (stackKey === 'legacy') {
    const legacyLabel = 'Legacy Pipeline';
    return legacyLabel;
  }

  const registeredName = STACK_DISPLAY_NAMES[stackKey]?.name ?? stackKey;
  return registeredName;
}

export const DisplayUtils = {
  displayName,
};
