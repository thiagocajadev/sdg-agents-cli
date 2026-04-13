import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ResultUtils } from './result-utils.mjs';

const { success, fail } = ResultUtils;

describe('ResultUtils', () => {
  describe('success()', () => {
    it('should create a success result with a value', () => {
      const input = 'hello';
      const expectedValue = input;
      const expectedSuccess = true;
      const expectedFailure = false;
      const expectedNull = null;

      const actual = success(input);

      assert.equal(actual.isSuccess, expectedSuccess);
      assert.equal(actual.isFailure, expectedFailure);
      assert.equal(actual.value, expectedValue);
      assert.equal(actual.error, expectedNull);
    });

    it('should create a success result with undefined when no value is passed', () => {
      const expectedValue = undefined;
      const expectedSuccess = true;
      const expectedFailure = false;
      const expectedNull = null;

      const actual = success();

      assert.equal(actual.isSuccess, expectedSuccess);
      assert.equal(actual.isFailure, expectedFailure);
      assert.equal(actual.value, expectedValue);
      assert.equal(actual.error, expectedNull);
    });

    it('should preserve complex objects as values', () => {
      const input = { id: 1, name: 'test', nested: { key: 'value' } };
      const expected = input;

      const actual = success(input);

      assert.deepEqual(actual.value, expected);
    });

    it('should handle null as a valid value', () => {
      const input = null;
      const expectedValue = null;
      const expectedSuccess = true;

      const actual = success(input);

      assert.equal(actual.isSuccess, expectedSuccess);
      assert.equal(actual.value, expectedValue);
    });
  });

  describe('fail()', () => {
    it('should create a failure result with message and code', () => {
      const inputMessage = 'Something went wrong';
      const inputCode = 'ERR_001';
      const expectedError = {
        message: inputMessage,
        code: inputCode,
      };
      const expectedSuccess = false;
      const expectedFailure = true;
      const expectedNull = null;

      const actual = fail(inputMessage, inputCode);

      assert.equal(actual.isSuccess, expectedSuccess);
      assert.equal(actual.isFailure, expectedFailure);
      assert.equal(actual.value, expectedNull);
      assert.deepEqual(actual.error, expectedError);
    });

    it('should guarantee isSuccess and isFailure are always opposite', () => {
      const inputOk = 'data';
      const inputErr = 'oops';

      const actualOk = success(inputOk);
      const actualErr = fail(inputErr, 'FAIL');

      assert.notEqual(actualOk.isSuccess, actualOk.isFailure);
      assert.notEqual(actualErr.isSuccess, actualErr.isFailure);
    });
  });
});
