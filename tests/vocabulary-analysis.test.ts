import test from 'node:test';
import assert from 'node:assert/strict';
import { analyseVocabulary } from '../src/scripts/lib/writing-style/vocabulary-analysis.js';

test('analyseVocabulary applies stopwords and classifications', () => {
  const profile = analyseVocabulary(
    ['this', 'clarity', 'clarity', 'code', 'journey'],
    {
      stopwords: new Set(['this']),
      domainWords: new Set(['code']),
      tropeWords: new Set(['journey']),
    },
    10
  );

  assert.equal(profile.totalTokens, 4);
  assert.equal(profile.topWords[0]?.token, 'clarity');
  assert.equal(profile.domainWords[0]?.token, 'code');
  assert.equal(profile.tropeWords[0]?.token, 'journey');
});
