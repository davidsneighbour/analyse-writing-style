import { CompareReport, CorpusAnalysis } from './types.js';

const sentenceTrait = (analysis: CorpusAnalysis): string => {
  return `${analysis.corpusName}: avg sentence length ${analysis.sentenceMetrics.averageWords.toFixed(1)}`;
};

export const buildCompareReport = (primary: CorpusAnalysis, comparators: CorpusAnalysis[]): CompareReport => {
  const distinctiveTraits: string[] = [];
  const sharedTraits: string[] = [];

  for (const comparator of comparators) {
    const diff = primary.sentenceMetrics.averageWords - comparator.sentenceMetrics.averageWords;
    if (Math.abs(diff) >= 2) {
      distinctiveTraits.push(
        `${primary.corpusName} differs from ${comparator.corpusName} by ${diff.toFixed(1)} words/sentence on average.`
      );
    }

    if (Math.abs(primary.paragraphMetrics.oneSentencePct - comparator.paragraphMetrics.oneSentencePct) < 0.1) {
      sharedTraits.push(
        `${primary.corpusName} and ${comparator.corpusName} have similar one-sentence paragraph ratios.`
      );
    }
  }

  if (distinctiveTraits.length === 0) {
    distinctiveTraits.push('No strong distinctive traits detected in sentence/paragraph structure.');
  }
  if (sharedTraits.length === 0) {
    sharedTraits.push('No major shared structural traits detected.');
  }

  return {
    primary,
    comparators,
    distinctiveTraits: [sentenceTrait(primary), ...distinctiveTraits],
    sharedTraits,
  };
};
