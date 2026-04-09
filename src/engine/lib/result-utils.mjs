/**
 * Result Pattern Helpers for Staff-level Control Flow
 */

/**
 * @template T
 * @param {T} value
 * @returns {{ isSuccess: true, isFailure: false, value: T, error: null }}
 */
function success(value) {
  return { isSuccess: true, isFailure: false, value, error: null };
}

/**
 * @param {string} message
 * @param {string} code
 * @returns {{ isSuccess: false, isFailure: true, value: null, error: { message: string, code: string } }}
 */
function fail(message, code) {
  return { isSuccess: false, isFailure: true, value: null, error: { message, code } };
}

export const ResultUtils = {
  success,
  fail,
};
