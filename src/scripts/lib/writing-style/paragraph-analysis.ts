import { ParagraphMetrics } from './types.js';
import { splitSentences } from './text-cleaning.js';

export const analyseParagraphMetrics = (paragraphs: string[]): ParagraphMetrics => {
  if (paragraphs.length === 0) {
    return {
      total: 0,
      averageSentences: 0,
      oneSentencePct: 0,
    };
  }

  const sentenceCounts = paragraphs.map((paragraph) => splitSentences(paragraph).length);
  const totalSentences = sentenceCounts.reduce((sum, count) => sum + count, 0);
  const oneSentence = sentenceCounts.filter((count) => count === 1).length;

  return {
    total: paragraphs.length,
    averageSentences: totalSentences / paragraphs.length,
    oneSentencePct: oneSentence / paragraphs.length,
  };
};
