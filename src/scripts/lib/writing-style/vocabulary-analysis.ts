import { LexiconSets, VocabularyProfile } from './types.js';

const topEntries = (counts: Map<string, number>, topN: number): Array<{ token: string; count: number }> => {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([token, count]) => ({ token, count }));
};

export const analyseVocabulary = (tokens: string[], lexicons: LexiconSets, topN: number): VocabularyProfile => {
  const counts = new Map<string, number>();

  for (const token of tokens) {
    if (lexicons.stopwords.has(token)) {
      continue;
    }
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  const domainCounts = new Map<string, number>();
  const tropeCounts = new Map<string, number>();

  for (const [token, count] of counts.entries()) {
    if (lexicons.domainWords.has(token)) {
      domainCounts.set(token, count);
    }
    if (lexicons.tropeWords.has(token)) {
      tropeCounts.set(token, count);
    }
  }

  const totalTokens = [...counts.values()].reduce((sum, count) => sum + count, 0);
  const uniqueTokens = counts.size;

  return {
    totalTokens,
    uniqueTokens,
    typeTokenRatio: uniqueTokens > 0 ? uniqueTokens / totalTokens : 0,
    topWords: topEntries(counts, topN),
    domainWords: topEntries(domainCounts, topN),
    tropeWords: topEntries(tropeCounts, topN),
  };
};
