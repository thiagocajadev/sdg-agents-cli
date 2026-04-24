import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PruneBacklog } from './prune-backlog.mjs';

const { pruneBacklog } = PruneBacklog;

const buildBacklog = (doneEntries, trailingSection = '') => {
  const header = '# Tasks\n\n## Active\n\n- _(idle)_\n\n## Backlog\n\n- foo\n\n## Done\n\n';
  const entries = doneEntries
    .map((label, index) => `- [DONE] ${label} entry ${index + 1}`)
    .join('\n');

  const trailer = trailingSection ? `\n\n${trailingSection}\n` : '\n';
  return header + entries + trailer;
};

describe('PruneBacklog.pruneBacklog()', () => {
  it('should truncate Done section to keepCount and report dropped count', () => {
    const input = buildBacklog(Array.from({ length: 28 }, (_unused, index) => `cycle-${index}`));
    const expectedRemoved = 25;
    const expectedRemaining = 3;

    const actual = pruneBacklog(input, 3);
    const actualEntries = actual.pruned.match(/^-\s+\[DONE\]/gm) ?? [];

    assert.equal(actual.removed, expectedRemoved);
    assert.equal(actualEntries.length, expectedRemaining);
  });

  it('should no-op when Done already within threshold', () => {
    const input = buildBacklog(['alpha', 'beta']);
    const expectedRemoved = 0;
    const actual = pruneBacklog(input, 3);

    assert.equal(actual.removed, expectedRemoved);
    assert.equal(actual.pruned, input);
  });

  it('should no-op when Done section is absent', () => {
    const input = '# Tasks\n\n## Active\n\n- pending\n\n## Backlog\n\n- later\n';
    const expectedRemoved = 0;
    const actual = pruneBacklog(input, 3);

    assert.equal(actual.removed, expectedRemoved);
    assert.equal(actual.pruned, input);
  });

  it('should preserve sections that appear after Done', () => {
    const trailingSection = '## Notes\n\n- keep me intact';
    const input = buildBacklog(
      Array.from({ length: 5 }, (_unused, index) => `cycle-${index}`),
      trailingSection
    );

    const expectedRemoved = 2;
    const actual = pruneBacklog(input, 3);

    assert.equal(actual.removed, expectedRemoved);
    const hasNotesSection = actual.pruned.includes('## Notes');
    const hasKeepMarker = actual.pruned.includes('- keep me intact');
    assert.ok(hasNotesSection);
    assert.ok(hasKeepMarker);
  });

  it('should be idempotent — second prune is no-op', () => {
    const input = buildBacklog(Array.from({ length: 10 }, (_unused, index) => `cycle-${index}`));
    const expectedSecondRemoved = 0;

    const firstPass = pruneBacklog(input, 3);
    const secondPass = pruneBacklog(firstPass.pruned, 3);

    assert.equal(secondPass.removed, expectedSecondRemoved);
    assert.equal(secondPass.pruned, firstPass.pruned);
  });

  it('should leave exactly one blank line between Done header and first entry', () => {
    const input = buildBacklog(Array.from({ length: 6 }, (_unused, index) => `cycle-${index}`));
    const expectedSeparator = '## Done\n\n- [DONE]';
    const actual = pruneBacklog(input, 3);

    assert.ok(
      actual.pruned.includes(expectedSeparator),
      `Expected clean separator; got:\n${actual.pruned}`
    );

    assert.ok(
      !actual.pruned.includes('## Done\n\n\n'),
      'Must not leave double blank line after Done header'
    );
  });
});
