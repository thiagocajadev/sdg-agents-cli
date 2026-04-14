import { STACK_DISPLAY_NAMES } from '../../config/stack-display.mjs';

/**
 * Returns a human-readable display name for a given stack key.
 * Single source of truth — imported by all bin scripts.
 */
function displayName(stackKey) {
  const PRESET_DISPLAY_NAMES = {
    none: '(none)',
    lite: 'Lite',
    'vertical-slice': 'Vertical Slice',
    mvc: 'MVC',
    legacy: 'Legacy Pipeline',
  };

  const key = stackKey || 'none';
  const fallbackName = STACK_DISPLAY_NAMES[key]?.name ?? key;
  const resolvedName = PRESET_DISPLAY_NAMES[key] ?? fallbackName;

  return resolvedName;
}

export const DisplayUtils = {
  displayName,
};
