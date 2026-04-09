import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ResultUtils } from './result-utils.mjs';

const { success, fail } = ResultUtils;

describe('ResultUtils', () => {
  describe('success()', () => {
    it('should create a success result with a value', () => {
      const result = success('hello');

      assert.equal(result.isSuccess, true);
      assert.equal(result.isFailure, false);
      assert.equal(result.value, 'hello');
      assert.equal(result.error, null);
    });

    it('should create a success result with undefined when no value is passed', () => {
      const result = success();

      assert.equal(result.isSuccess, true);
      assert.equal(result.isFailure, false);
      assert.equal(result.value, undefined);
      assert.equal(result.error, null);
    });

    it('should preserve complex objects as values', () => {
      const data = { id: 1, name: 'test', nested: { key: 'value' } };
      const result = success(data);

      assert.deepEqual(result.value, data);
    });

    it('should handle null as a valid value', () => {
      const result = success(null);

      assert.equal(result.isSuccess, true);
      assert.equal(result.value, null);
    });
  });

  describe('fail()', () => {
    it('should create a failure result with message and code', () => {
      const result = fail('Something went wrong', 'ERR_001');

      assert.equal(result.isSuccess, false);
      assert.equal(result.isFailure, true);
      assert.equal(result.value, null);
      assert.deepEqual(result.error, {
        message: 'Something went wrong',
        code: 'ERR_001',
      });
    });

    it('should guarantee isSuccess and isFailure are always opposite', () => {
      const ok = success('data');
      const err = fail('oops', 'FAIL');

      assert.notEqual(ok.isSuccess, ok.isFailure);
      assert.notEqual(err.isSuccess, err.isFailure);
    });
  });
});
