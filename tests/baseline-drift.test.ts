import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDriftReport } from '../src/scripts/lib/writing-style/baseline-drift.js';
import { CorpusAnalysis } from '../src/scripts/lib/writing-style/types.js';

const corpus: CorpusAnalysis = {
  mode: 'drift',
  corpusName: 'fixture',
  filesAnalysed: 2,
  wordsAnalysed: 200,
  sentenceMetrics: {
    total: 10,
    averageWords: 16,
    medianWords: 15,
    shortPct: 0.2,
    mediumPct: 0.7,
    longPct: 0.1,
    rhetoricalQuestionPct: 0.05,
  },
  paragraphMetrics: {
    total: 4,
    averageSentences: 2.5,
    oneSentencePct: 0.25,
  },
  vocabulary: {
    totalTokens: 180,
    uniqueTokens: 60,
    typeTokenRatio: 0.33,
    topWords: [{ token: 'clarity', count: 9 }],
    domainWords: [],
    tropeWords: [],
  },
  patterns: {
    rhetoricalQuestions: 1,
    contrastPattern: 1,
    firstPerson: 2,
    modalVerbs: 2,
  },
  evidence: {
    citationMarkers: 0,
    numericClaims: 2,
    hedgeMarkers: 1,
  },
  stableSignals: [],
  possibleSignals: [],
  topicArtefacts: [],
  corpusArtefacts: [],
  fileAnalyses: [],
};

test('buildDriftReport evaluates baseline rules', async () => {
  const report = await buildDriftReport('tests/fixtures/writing-style/baseline-sample.instructions.md', corpus);
  assert.equal(report.findings.length > 0, true);
  assert.equal(report.findings.some((finding) => finding.status === 'aligned'), true);
});
