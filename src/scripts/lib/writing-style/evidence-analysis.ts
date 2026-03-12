import { EvidenceProfile } from './types.js';

const HEDGE_RE = /\b(maybe|perhaps|likely|possibly|roughly|around)\b/i;

export const analyseEvidence = (sentences: string[]): EvidenceProfile => {
  let citationMarkers = 0;
  let numericClaims = 0;
  let hedgeMarkers = 0;

  for (const sentence of sentences) {
    if (/\[[0-9]+\]/.test(sentence) || /\([^)]*\d{4}[^)]*\)/.test(sentence)) {
      citationMarkers += 1;
    }
    if (/\b\d+(\.\d+)?%?\b/.test(sentence)) {
      numericClaims += 1;
    }
    if (HEDGE_RE.test(sentence)) {
      hedgeMarkers += 1;
    }
  }

  return {
    citationMarkers,
    numericClaims,
    hedgeMarkers,
  };
};
