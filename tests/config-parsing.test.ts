import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCliArgs } from '../src/scripts/lib/writing-style/config.js';

test('parseCliArgs accepts valid numeric options', () => {
  const result = parseCliArgs(['--input', 'file.md', '--recent-weight', '1.5', '--min-words', '10', '--top-n', '20']);
  assert.equal(result.recentWeight, 1.5);
  assert.equal(result.minWords, 10);
  assert.equal(result.topN, 20);
});

test('parseCliArgs throws on non-numeric --recent-weight', () => {
  assert.throws(
    () => parseCliArgs(['--input', 'file.md', '--recent-weight', 'abc']),
    /Invalid value for --recent-weight/,
  );
});

test('parseCliArgs throws on non-numeric --min-words', () => {
  assert.throws(
    () => parseCliArgs(['--input', 'file.md', '--min-words', 'not-a-number']),
    /Invalid value for --min-words/,
  );
});

test('parseCliArgs throws on non-numeric --top-n', () => {
  assert.throws(
    () => parseCliArgs(['--input', 'file.md', '--top-n', 'NaN']),
    /Invalid value for --top-n/,
  );
});

test('parseCliArgs treats omitted numeric options as undefined', () => {
  const result = parseCliArgs(['--input', 'file.md']);
  assert.equal(result.recentWeight, undefined);
  assert.equal(result.minWords, undefined);
  assert.equal(result.topN, undefined);
});
