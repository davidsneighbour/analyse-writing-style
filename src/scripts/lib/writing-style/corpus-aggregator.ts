import { analyseEvidence } from './evidence-analysis.js';
import { analyseParagraphMetrics } from './paragraph-analysis.js';
import { analysePatterns } from './pattern-analysis.js';
import { analyseSentenceMetrics } from './sentence-analysis.js';
import { analyseVocabulary } from './vocabulary-analysis.js';
import { FileAnalysis, CorpusAnalysis, LexiconSets, SourceFile, StyleSignal, AnalysisMode } from './types.js';

const classifySignals = (analysis: CorpusAnalysis): StyleSignal[] => {
  const signals: StyleSignal[] = [];
  if (analysis.sentenceMetrics.averageWords >= 15 && analysis.sentenceMetrics.averageWords <= 21) {
    signals.push({
      label: 'Average sentence length in stable band',
      reason: `Average ${analysis.sentenceMetrics.averageWords.toFixed(1)} words per sentence`,
      classification: 'stable-style-signal',
    });
  }
  if (analysis.patterns.rhetoricalQuestions > 0) {
    signals.push({
      label: 'Rhetorical question usage',
      reason: `${analysis.patterns.rhetoricalQuestions} rhetorical questions`,
      classification: 'possible-style-signal',
    });
  }
  for (const domainWord of analysis.vocabulary.domainWords.slice(0, 3)) {
    signals.push({
      label: `Domain token: ${domainWord.token}`,
      reason: `Appears ${domainWord.count} times and is in domain vocabulary`,
      classification: 'likely-topic-artefact',
    });
  }
  return signals;
};

export const analyseFile = (file: SourceFile, lexicons: LexiconSets, topN: number): FileAnalysis => {
  return {
    file,
    sentenceMetrics: analyseSentenceMetrics(file.sentences),
    paragraphMetrics: analyseParagraphMetrics(file.paragraphs),
    vocabulary: analyseVocabulary(file.tokens, lexicons, topN),
    patterns: analysePatterns(file.sentences),
    evidence: analyseEvidence(file.sentences),
  };
};

const sum = (values: number[]): number => values.reduce((acc, value) => acc + value, 0);

export const aggregateCorpus = (
  fileAnalyses: FileAnalysis[],
  corpusName: string,
  mode: AnalysisMode,
  lexicons: LexiconSets,
  topN: number
): CorpusAnalysis => {
  const allSentences = fileAnalyses.flatMap((entry) => entry.file.sentences);
  const allParagraphs = fileAnalyses.flatMap((entry) => entry.file.paragraphs);
  const allTokens = fileAnalyses.flatMap((entry) => entry.file.tokens);

  const sentenceMetrics = analyseSentenceMetrics(allSentences);
  const paragraphMetrics = analyseParagraphMetrics(allParagraphs);
  const vocabulary = analyseVocabulary(allTokens, lexicons, topN);
  const patterns = analysePatterns(allSentences);
  const evidence = analyseEvidence(allSentences);

  const base: CorpusAnalysis = {
    mode,
    corpusName,
    filesAnalysed: fileAnalyses.length,
    wordsAnalysed: sum(fileAnalyses.map((entry) => entry.file.wordCount)),
    sentenceMetrics,
    paragraphMetrics,
    vocabulary,
    patterns,
    evidence,
    stableSignals: [],
    possibleSignals: [],
    topicArtefacts: [],
    corpusArtefacts: [],
    fileAnalyses,
  };

  const signals = classifySignals(base);
  base.stableSignals = signals.filter((signal) => signal.classification === 'stable-style-signal');
  base.possibleSignals = signals.filter((signal) => signal.classification === 'possible-style-signal');
  base.topicArtefacts = signals.filter((signal) => signal.classification === 'likely-topic-artefact');
  base.corpusArtefacts = signals.filter((signal) => signal.classification === 'likely-corpus-artefact');

  return base;
};
