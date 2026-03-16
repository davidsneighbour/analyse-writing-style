import { SentenceMetrics } from './types.js';

const median = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};

export const analyseSentenceMetrics = (sentences: string[]): SentenceMetrics => {
  if (sentences.length === 0) {
    return {
      total: 0,
      averageWords: 0,
      medianWords: 0,
      shortPct: 0,
      mediumPct: 0,
      longPct: 0,
      rhetoricalQuestionPct: 0,
    };
  }

  const lengths = sentences.map((sentence) => sentence.split(/\s+/).filter(Boolean).length);
  const short = lengths.filter((length) => length <= 9).length;
  const medium = lengths.filter((length) => length >= 10 && length <= 24).length;
  const long = lengths.filter((length) => length >= 25).length;
  const rhetoricalQuestions = sentences.filter((sentence) => sentence.endsWith('?')).length;

  const averageWords = lengths.reduce((sum, length) => sum + length, 0) / lengths.length;

  return {
    total: sentences.length,
    averageWords,
    medianWords: median(lengths),
    shortPct: short / sentences.length,
    mediumPct: medium / sentences.length,
    longPct: long / sentences.length,
    rhetoricalQuestionPct: rhetoricalQuestions / sentences.length,
  };
};
