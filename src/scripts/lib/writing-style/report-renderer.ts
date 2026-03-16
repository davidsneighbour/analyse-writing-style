import { AnalysisResult, CorpusAnalysis, StyleSignal } from './types.js';

const pct = (value: number): string => `${(value * 100).toFixed(1)}%`;

const renderSignalSection = (title: string, signals: StyleSignal[]): string => {
  if (signals.length === 0) {
    return `## ${title}\n\n- None detected.\n`;
  }
  const lines = signals.map((signal) => `- **${signal.label}** — ${signal.reason}`);
  return `## ${title}\n\n${lines.join('\n')}\n`;
};

const renderCorpusSections = (analysis: CorpusAnalysis): string => {
  const topWords = analysis.vocabulary.topWords.map((entry) => `- ${entry.token}: ${entry.count}`).join('\n') || '- None';

  return [
    '## Scope',
    '',
    `- Corpus: ${analysis.corpusName}`,
    `- Files analysed: ${analysis.filesAnalysed}`,
    `- Words analysed: ${analysis.wordsAnalysed}`,
    '',
    '## Corpus summary',
    '',
    `- Sentences: ${analysis.sentenceMetrics.total}`,
    `- Paragraphs: ${analysis.paragraphMetrics.total}`,
    '',
    '## Sentence metrics',
    '',
    `- Average words/sentence: ${analysis.sentenceMetrics.averageWords.toFixed(2)}`,
    `- Median words/sentence: ${analysis.sentenceMetrics.medianWords.toFixed(2)}`,
    `- Short/Medium/Long: ${pct(analysis.sentenceMetrics.shortPct)} / ${pct(analysis.sentenceMetrics.mediumPct)} / ${pct(analysis.sentenceMetrics.longPct)}`,
    '',
    '## Paragraph metrics',
    '',
    `- Average sentences/paragraph: ${analysis.paragraphMetrics.averageSentences.toFixed(2)}`,
    `- One-sentence paragraphs: ${pct(analysis.paragraphMetrics.oneSentencePct)}`,
    '',
    '## Vocabulary profile',
    '',
    `- Unique tokens: ${analysis.vocabulary.uniqueTokens}`,
    `- Type-token ratio: ${analysis.vocabulary.typeTokenRatio.toFixed(3)}`,
    '- Top words:',
    topWords,
    '',
    '## Structural and rhetorical patterns',
    '',
    `- Rhetorical questions: ${analysis.patterns.rhetoricalQuestions}`,
    `- Contrast patterns (not X but Y): ${analysis.patterns.contrastPattern}`,
    `- First-person markers: ${analysis.patterns.firstPerson}`,
    `- Modal verbs: ${analysis.patterns.modalVerbs}`,
    '',
    '## Evidence and argument style',
    '',
    `- Citation markers: ${analysis.evidence.citationMarkers}`,
    `- Numeric claims: ${analysis.evidence.numericClaims}`,
    `- Hedge markers: ${analysis.evidence.hedgeMarkers}`,
    '',
    renderSignalSection('Stable style signals', analysis.stableSignals),
    renderSignalSection('Possible style signals', analysis.possibleSignals),
    renderSignalSection('Likely topic artefacts', analysis.topicArtefacts),
    '## Baseline update suggestions',
    '',
    '- Review drift findings and manually update baseline instructions where recurring drift appears.',
    '',
    '## Appendix examples',
    '',
    '- File-level details included in JSON output when enabled.',
    '',
  ].join('\n');
};

export const renderMarkdownReport = (result: AnalysisResult): string => {
  const sections: string[] = ['# Writing Style Analysis Report', ''];
  sections.push(renderCorpusSections(result.primary));

  if (result.compare) {
    sections.push('## Comparison summary', '');
    sections.push(...result.compare.distinctiveTraits.map((line) => `- ${line}`), '');
    sections.push('## Distinctive primary-corpus traits', '');
    sections.push(...result.compare.distinctiveTraits.map((line) => `- ${line}`), '');
    sections.push('## Shared traits across corpora', '');
    sections.push(...result.compare.sharedTraits.map((line) => `- ${line}`), '');
  }

  if (result.drift) {
    sections.push('## Baseline alignment summary', '');
    for (const finding of result.drift.findings) {
      sections.push(`- **${finding.rule.description}**: ${finding.status} (${finding.observed})`);
    }
    sections.push('', '## Drift findings', '');
    for (const finding of result.drift.findings) {
      sections.push(`- ${finding.rule.description}: ${finding.observed}`);
    }
    sections.push('', '## Proposed baseline updates', '');
    for (const finding of result.drift.findings.filter((entry) => entry.status === 'drifted')) {
      sections.push(`- ${finding.suggestion}`);
    }
    sections.push('');
  }

  return sections.join('\n');
};
