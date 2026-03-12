import { PatternProfile } from './types.js';

const CONTRAST_RE = /\bnot\b[\s\S]{0,40}\bbut\b/i;
const FIRST_PERSON_RE = /\b(i|we|my|our|me|us)\b/i;
const MODAL_RE = /\b(should|must|could|might|may|can|would)\b/i;

export const analysePatterns = (sentences: string[]): PatternProfile => {
  let rhetoricalQuestions = 0;
  let contrastPattern = 0;
  let firstPerson = 0;
  let modalVerbs = 0;

  for (const sentence of sentences) {
    if (sentence.endsWith('?')) {
      rhetoricalQuestions += 1;
    }
    if (CONTRAST_RE.test(sentence)) {
      contrastPattern += 1;
    }
    if (FIRST_PERSON_RE.test(sentence)) {
      firstPerson += 1;
    }
    if (MODAL_RE.test(sentence)) {
      modalVerbs += 1;
    }
  }

  return {
    rhetoricalQuestions,
    contrastPattern,
    firstPerson,
    modalVerbs,
  };
};
