export type AnalysisMode = 'single' | 'compare' | 'drift';
export type OutputFormat = 'markdown' | 'json' | 'both';

export interface WritingStyleConfig {
  extensions: string[];
  exclude: string[];
  minWords: number;
  topN: number;
  recentWeight: number;
  stopwordsPath?: string;
  domainWordsPath?: string;
  tropeWordsPath?: string;
}

export interface CliOptions {
  input: string[];
  compare: string[];
  output?: string;
  jsonOutput?: string;
  format: OutputFormat;
  baseline?: string;
  include: string[];
  exclude: string[];
  extensions?: string[];
  recentWeight?: number;
  minWords?: number;
  stopwords?: string;
  domainWords?: string;
  tropeWords?: string;
  topN?: number;
  mode: AnalysisMode;
  verbose: boolean;
  configPath?: string;
}

export interface SourceFile {
  path: string;
  rawText: string;
  cleanedText: string;
  paragraphs: string[];
  sentences: string[];
  tokens: string[];
  wordCount: number;
}

export interface SentenceMetrics {
  total: number;
  averageWords: number;
  medianWords: number;
  shortPct: number;
  mediumPct: number;
  longPct: number;
  rhetoricalQuestionPct: number;
}

export interface ParagraphMetrics {
  total: number;
  averageSentences: number;
  oneSentencePct: number;
}

export interface VocabularyProfile {
  totalTokens: number;
  uniqueTokens: number;
  typeTokenRatio: number;
  topWords: Array<{ token: string; count: number }>;
  domainWords: Array<{ token: string; count: number }>;
  tropeWords: Array<{ token: string; count: number }>;
}

export interface PatternProfile {
  rhetoricalQuestions: number;
  contrastPattern: number;
  firstPerson: number;
  modalVerbs: number;
}

export interface EvidenceProfile {
  citationMarkers: number;
  numericClaims: number;
  hedgeMarkers: number;
}

export type SignalClassification =
  | 'stable-style-signal'
  | 'possible-style-signal'
  | 'likely-topic-artefact'
  | 'likely-corpus-artefact';

export interface StyleSignal {
  label: string;
  reason: string;
  classification: SignalClassification;
}

export interface FileAnalysis {
  file: SourceFile;
  sentenceMetrics: SentenceMetrics;
  paragraphMetrics: ParagraphMetrics;
  vocabulary: VocabularyProfile;
  patterns: PatternProfile;
  evidence: EvidenceProfile;
}

export interface CorpusAnalysis {
  mode: AnalysisMode;
  corpusName: string;
  filesAnalysed: number;
  wordsAnalysed: number;
  sentenceMetrics: SentenceMetrics;
  paragraphMetrics: ParagraphMetrics;
  vocabulary: VocabularyProfile;
  patterns: PatternProfile;
  evidence: EvidenceProfile;
  stableSignals: StyleSignal[];
  possibleSignals: StyleSignal[];
  topicArtefacts: StyleSignal[];
  corpusArtefacts: StyleSignal[];
  fileAnalyses: FileAnalysis[];
}

export interface DriftRule {
  key: string;
  description: string;
  expected: string;
}

export interface DriftFinding {
  rule: DriftRule;
  status: 'aligned' | 'drifted' | 'unknown';
  observed: string;
  suggestion: string;
}

export interface DriftReport {
  baselinePath: string;
  findings: DriftFinding[];
}

export interface CompareReport {
  primary: CorpusAnalysis;
  comparators: CorpusAnalysis[];
  distinctiveTraits: string[];
  sharedTraits: string[];
}

export interface AnalysisResult {
  primary: CorpusAnalysis;
  compare?: CompareReport;
  drift?: DriftReport;
}

export interface LexiconSets {
  stopwords: Set<string>;
  domainWords: Set<string>;
  tropeWords: Set<string>;
}
