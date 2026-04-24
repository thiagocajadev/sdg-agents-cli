import { describe, it } from 'node:test';
import { RuleTester } from 'eslint';
import { semanticSpacing } from './semantic-spacing.mjs';

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
});

const OPTIONS = [{ minBodySize: 4 }];

describe('semantic-spacing', () => {
  it('passes trivial function (body below minBodySize)', () => {
    ruleTester.run('semantic-spacing', semanticSpacing, {
      valid: [
        {
          code: [
            'function compute(a) {',
            '  const result = transform(',
            '    a,',
            '    a',
            '  );',
            '  return result;',
            '}',
          ].join('\n'),
          options: OPTIONS,
        },
      ],
      invalid: [],
    });
  });

  it('passes when blank line follows multiline statement', () => {
    ruleTester.run('semantic-spacing', semanticSpacing, {
      valid: [
        {
          code: [
            'function process(a, b, c, d) {',
            '  const config = buildConfig(',
            '    a,',
            '    b',
            '  );',
            '',
            '  const result = run(config);',
            '  const output = format(result);',
            '  return output;',
            '}',
          ].join('\n'),
          options: OPTIONS,
        },
      ],
      invalid: [],
    });
  });

  it('passes when all statements are single-line', () => {
    ruleTester.run('semantic-spacing', semanticSpacing, {
      valid: [
        {
          code: [
            'function process(a, b, c, d) {',
            '  const first = one(a);',
            '  const second = two(b);',
            '  const third = three(c);',
            '  const fourth = four(d);',
            '  return fourth;',
            '}',
          ].join('\n'),
          options: OPTIONS,
        },
      ],
      invalid: [],
    });
  });

  it('flags missing blank line after multiline call', () => {
    const source = [
      'function process(a, b, c, d) {',
      '  const config = buildConfig(',
      '    a,',
      '    b',
      '  );',
      '  const result = run(config);',
      '  const output = format(result);',
      '  return output;',
      '}',
    ].join('\n');

    const fixed = [
      'function process(a, b, c, d) {',
      '  const config = buildConfig(',
      '    a,',
      '    b',
      '  );',
      '',
      '  const result = run(config);',
      '  const output = format(result);',
      '  return output;',
      '}',
    ].join('\n');

    const expectedMessage = 'Expected blank line after multiline statement.';

    ruleTester.run('semantic-spacing', semanticSpacing, {
      valid: [],
      invalid: [
        {
          code: source,
          options: OPTIONS,
          errors: [{ message: expectedMessage }],
          output: fixed,
        },
      ],
    });
  });

  it('flags missing blank line after multiline variable declaration init', () => {
    const source = [
      'function process(a, b, c, d) {',
      '  const config = {',
      '    key: a,',
      '    value: b,',
      '  };',
      '  const result = run(config);',
      '  const output = format(result);',
      '  return output;',
      '}',
    ].join('\n');

    const fixed = [
      'function process(a, b, c, d) {',
      '  const config = {',
      '    key: a,',
      '    value: b,',
      '  };',
      '',
      '  const result = run(config);',
      '  const output = format(result);',
      '  return output;',
      '}',
    ].join('\n');

    const expectedMessage = 'Expected blank line after multiline statement.';

    ruleTester.run('semantic-spacing', semanticSpacing, {
      valid: [],
      invalid: [
        {
          code: source,
          options: OPTIONS,
          errors: [{ message: expectedMessage }],
          output: fixed,
        },
      ],
    });
  });

  it('flags and fixes explaining side-effect group (2+2 split)', () => {
    const source = [
      'if (condition) {',
      '  const filtered = items.filter(pred);',
      '  const report = format(filtered);',
      '  const output = build(report);',
      '  sideEffect(output);',
      '}',
    ].join('\n');

    const fixed = [
      'if (condition) {',
      '  const filtered = items.filter(pred);',
      '  const report = format(filtered);',
      '',
      '  const output = build(report);',
      '  sideEffect(output);',
      '}',
    ].join('\n');

    ruleTester.run('semantic-spacing', semanticSpacing, {
      valid: [],
      invalid: [
        {
          code: source,
          options: OPTIONS,
          errors: [{ message: 'Expected blank line before explaining side-effect group.' }],
          output: fixed,
        },
      ],
    });
  });

  it('moves misplaced blank from before d to before c in [a,b,c,d,sideEffect]', () => {
    const source = [
      'if (condition) {',
      '  const a = f(1);',
      '  const b = f(2);',
      '  const c = f(3);',
      '',
      '  const d = f(4);',
      '  sideEffect(d);',
      '}',
    ].join('\n');

    const fixed = [
      'if (condition) {',
      '  const a = f(1);',
      '  const b = f(2);',
      '',
      '  const c = f(3);',
      '  const d = f(4);',
      '  sideEffect(d);',
      '}',
    ].join('\n');

    ruleTester.run('semantic-spacing', semanticSpacing, {
      valid: [],
      invalid: [
        {
          code: source,
          options: OPTIONS,
          errors: [
            { message: 'Expected blank line before explaining side-effect group.' },
            { message: 'Unexpected blank line in consecutive variable declarations.' },
          ],
          output: fixed,
        },
      ],
    });
  });

  it('flags and fixes [c, c, c, return] tail (2+2 split in any block size)', () => {
    const source = [
      'function f(x) {',
      '  if (!x) { return null; }',
      '  const a = compute(x);',
      '  const b = format(a);',
      '  const result = build(b);',
      '  return result;',
      '}',
    ].join('\n');

    const fixed = [
      'function f(x) {',
      '  if (!x) { return null; }',
      '  const a = compute(x);',
      '  const b = format(a);',
      '',
      '  const result = build(b);',
      '  return result;',
      '}',
    ].join('\n');

    ruleTester.run('semantic-spacing', semanticSpacing, {
      valid: [],
      invalid: [
        {
          code: source,
          options: OPTIONS,
          errors: [{ message: 'Expected blank line before explaining-return group.' }],
          output: fixed,
        },
      ],
    });
  });

  it('flags and fixes [c, c, c, c, sideEffect] in 5-statement block (2+2 split)', () => {
    const source = [
      'function test() {',
      '  const inputA = a;',
      '  const inputB = b;',
      '  const expected = f(inputA);',
      '  const actual = g(inputB);',
      '  assert(actual);',
      '}',
    ].join('\n');

    const fixed = [
      'function test() {',
      '  const inputA = a;',
      '  const inputB = b;',
      '',
      '  const expected = f(inputA);',
      '  const actual = g(inputB);',
      '  assert(actual);',
      '}',
    ].join('\n');

    ruleTester.run('semantic-spacing', semanticSpacing, {
      valid: [],
      invalid: [
        {
          code: source,
          options: OPTIONS,
          errors: [{ message: 'Expected blank line before explaining side-effect group.' }],
          output: fixed,
        },
      ],
    });
  });

  it('removes blank between explaining-const and return (tight pair)', () => {
    const source = [
      'function f() {',
      '  const result = compute();',
      '',
      '  return result;',
      '}',
    ].join('\n');

    const fixed = ['function f() {', '  const result = compute();', '  return result;', '}'].join(
      '\n'
    );

    ruleTester.run('semantic-spacing', semanticSpacing, {
      valid: [],
      invalid: [
        {
          code: source,
          options: [],
          errors: [{ message: 'Unexpected blank line between explaining-const and return.' }],
          output: fixed,
        },
      ],
    });
  });

  it('auto-fixes by inserting blank line', () => {
    const source = [
      'function process(a, b, c, d) {',
      '  const config = buildConfig(',
      '    a,',
      '    b',
      '  );',
      '  const result = run(config);',
      '  const output = format(result);',
      '  return output;',
      '}',
    ].join('\n');

    const fixed = [
      'function process(a, b, c, d) {',
      '  const config = buildConfig(',
      '    a,',
      '    b',
      '  );',
      '',
      '  const result = run(config);',
      '  const output = format(result);',
      '  return output;',
      '}',
    ].join('\n');

    ruleTester.run('semantic-spacing', semanticSpacing, {
      valid: [],
      invalid: [
        {
          code: source,
          options: OPTIONS,
          errors: [{ message: 'Expected blank line after multiline statement.' }],
          output: fixed,
        },
      ],
    });
  });
});
