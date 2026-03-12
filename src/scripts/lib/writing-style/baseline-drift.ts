import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { CorpusAnalysis, DriftFinding, DriftReport, DriftRule } from './types.js';

const RULES: DriftRule[] = [
  {
    key: 'sentence-length',
    description: 'Sentence length range',
    expected: 'average sentence length 15-21 words',
  },
  {
    key: 'paragraph-sentences',
    description: 'Paragraph sentence range',
    expected: 'average paragraph has 2-5 sentences',
  },
  {
    key: 'single-sentence-paragraphs',
    description: 'One-sentence paragraphs are rare',
    expected: 'one sentence paragraphs under 30%',
  },
  {
    key: 'rhetorical-questions',
    description: 'Rhetorical question avoidance',
    expected: 'rhetorical questions under 10%',
  },
  {
    key: 'metaphor',
    description: 'Minimal metaphor use',
    expected: 'metaphor/trope markers are low',
  },
];

export const parseBaselineRules = async (baselinePath: string): Promise<DriftRule[]> => {
  const raw = await readFile(path.resolve(process.cwd(), baselinePath), 'utf8');
  const lower = raw.toLowerCase();

  return RULES.filter((rule) => {
    const probe = rule.description.toLowerCase().split(' ')[0];
    return lower.includes(probe) || lower.includes(rule.key.replace('-', ' '));
  });
};

const evaluateRule = (rule: DriftRule, corpus: CorpusAnalysis): DriftFinding => {
  if (rule.key === 'sentence-length') {
    const avg = corpus.sentenceMetrics.averageWords;
    const aligned = avg >= 15 && avg <= 21;
    return {
      rule,
      status: aligned ? 'aligned' : 'drifted',
      observed: `Average sentence length is ${avg.toFixed(2)} words`,
      suggestion: aligned ? 'No action needed.' : 'Tune for tighter sentence-length control.',
    };
  }
  if (rule.key === 'paragraph-sentences') {
    const avg = corpus.paragraphMetrics.averageSentences;
    const aligned = avg >= 2 && avg <= 5;
    return {
      rule,
      status: aligned ? 'aligned' : 'drifted',
      observed: `Average paragraph has ${avg.toFixed(2)} sentences`,
      suggestion: aligned ? 'No action needed.' : 'Adjust paragraph structure guidance.',
    };
  }
  if (rule.key === 'single-sentence-paragraphs') {
    const ratio = corpus.paragraphMetrics.oneSentencePct;
    const aligned = ratio < 0.3;
    return {
      rule,
      status: aligned ? 'aligned' : 'drifted',
      observed: `${(ratio * 100).toFixed(1)}% one-sentence paragraphs`,
      suggestion: aligned ? 'No action needed.' : 'Reduce one-sentence paragraph frequency.',
    };
  }
  if (rule.key === 'rhetorical-questions') {
    const ratio = corpus.sentenceMetrics.rhetoricalQuestionPct;
    const aligned = ratio < 0.1;
    return {
      rule,
      status: aligned ? 'aligned' : 'drifted',
      observed: `${(ratio * 100).toFixed(1)}% rhetorical questions`,
      suggestion: aligned ? 'No action needed.' : 'Lower rhetorical-question usage.',
    };
  }
  if (rule.key === 'metaphor') {
    const tropeCount = corpus.vocabulary.tropeWords.reduce((sum, entry) => sum + entry.count, 0);
    const aligned = tropeCount <= Math.max(3, Math.round(corpus.filesAnalysed * 1.5));
    return {
      rule,
      status: aligned ? 'aligned' : 'drifted',
      observed: `${tropeCount} trope-marked tokens`,
      suggestion: aligned ? 'No action needed.' : 'Review metaphor/trope avoidance guidance.',
    };
  }

  return {
    rule,
    status: 'unknown',
    observed: 'No evaluator implemented.',
    suggestion: 'Add evaluator for this rule.',
  };
};

export const buildDriftReport = async (baselinePath: string, corpus: CorpusAnalysis): Promise<DriftReport> => {
  const parsedRules = await parseBaselineRules(baselinePath);
  const rules = parsedRules.length > 0 ? parsedRules : RULES;
  const findings = rules.map((rule) => evaluateRule(rule, corpus));
  return {
    baselinePath,
    findings,
  };
};
