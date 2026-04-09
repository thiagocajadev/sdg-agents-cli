import { STACK_DISPLAY_NAMES } from '../config/stack-display.mjs';

/**
 * Returns a human-readable display name for a given stack key.
 * Single source of truth — imported by all bin scripts.
 */
function displayName(stackKey) {
  if (!stackKey || stackKey === 'none') return '(none)';
  if (stackKey === 'lite') return 'Lite';
  if (stackKey === 'vertical-slice') return 'Vertical Slice';
  if (stackKey === 'mvc') return 'MVC';
  if (stackKey === 'legacy') return 'Legacy Pipeline';
  return STACK_DISPLAY_NAMES[stackKey]?.name ?? stackKey;
}

const DisplayUtils = {
  displayName,
};

export { DisplayUtils };
