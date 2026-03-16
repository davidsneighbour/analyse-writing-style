#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { HELP_TEXT } from './lib/writing-style/constants.js';
import { aggregateCorpus, analyseFile } from './lib/writing-style/corpus-aggregator.js';
import { buildCompareReport } from './lib/writing-style/compare-analysis.js';
import { buildConfig, loadConfigFile, parseCliArgs } from './lib/writing-style/config.js';
import { buildDriftReport } from './lib/writing-style/baseline-drift.js';
import { discoverFiles, loadTextFile, loadWordList } from './lib/writing-style/file-loader.js';
import { renderMarkdownReport } from './lib/writing-style/report-renderer.js';
import { cleanProseText, splitParagraphs, splitSentences, tokenize } from './lib/writing-style/text-cleaning.js';
import { AnalysisResult, LexiconSets, SourceFile } from './lib/writing-style/types.js';

const ensureParentDir = async (filePath: string): Promise<void> => {
  await mkdir(path.dirname(filePath), { recursive: true });
};

const loadCorpus = async (
  name: string,
  inputs: string[],
  config: { extensions: string[]; exclude: string[]; include: string[]; minWords: number; topN: number },
  lexicons: LexiconSets,
  verbose: boolean,
  mode: 'single' | 'compare' | 'drift'
) => {
  const files = await discoverFiles(inputs, config.extensions, config.exclude, config.include);
  const sourceFiles: SourceFile[] = [];

  for (const filePath of files) {
    const rawText = await loadTextFile(filePath);
    const cleanedText = cleanProseText(rawText);
    const paragraphs = splitParagraphs(cleanedText);
    const sentences = splitSentences(cleanedText);
    const tokens = tokenize(cleanedText);
    const wordCount = tokens.length;

    if (wordCount < config.minWords) {
      if (verbose) {
        console.log(`[skip:minWords] ${filePath} (${wordCount} words)`);
      }
      continue;
    }

    sourceFiles.push({ path: filePath, rawText, cleanedText, paragraphs, sentences, tokens, wordCount });
  }

  const analyses = sourceFiles.map((file) => analyseFile(file, lexicons, config.topN));
  return aggregateCorpus(analyses, name, mode, lexicons, config.topN);
};

const run = async (): Promise<void> => {
  const argv = process.argv.slice(2);
  if (argv.includes('--help')) {
    console.log(HELP_TEXT);
    return;
  }

  const cli = parseCliArgs(argv);
  const fileConfig = await loadConfigFile(cli.configPath);
  const config = buildConfig(cli, fileConfig);

  if (!['single', 'compare', 'drift'].includes(cli.mode)) {
    throw new Error(`Unsupported mode: ${cli.mode}`);
  }
  if (cli.mode === 'drift' && !cli.baseline) {
    throw new Error('Drift mode requires --baseline <path>.');
  }
  if (cli.mode === 'compare' && cli.compare.length === 0) {
    throw new Error('Compare mode requires at least one --compare path.');
  }

  if (cli.recentWeight !== undefined || fileConfig?.recentWeight !== undefined) {
    console.warn('Warning: recentWeight is not yet implemented and currently has no effect on the analysis.');
  }

  const lexicons: LexiconSets = {
    stopwords: await loadWordList(config.stopwordsPath),
    domainWords: await loadWordList(config.domainWordsPath),
    tropeWords: await loadWordList(config.tropeWordsPath),
  };

  const primary = await loadCorpus(
    'primary',
    cli.input,
    {
      extensions: config.extensions,
      exclude: config.exclude,
      include: cli.include,
      minWords: config.minWords,
      topN: config.topN,
    },
    lexicons,
    cli.verbose,
    cli.mode
  );

  const result: AnalysisResult = { primary };

  if (cli.mode === 'compare') {
    const comparators = await Promise.all(
      cli.compare.map((comparePath, index) =>
        loadCorpus(
          `compare-${index + 1}`,
          [comparePath],
          {
            extensions: config.extensions,
            exclude: config.exclude,
            include: cli.include,
            minWords: config.minWords,
            topN: config.topN,
          },
          lexicons,
          cli.verbose,
          cli.mode
        )
      )
    );
    result.compare = buildCompareReport(primary, comparators);
  }

  if (cli.mode === 'drift' && cli.baseline) {
    result.drift = await buildDriftReport(cli.baseline, primary);
  }

  const markdown = renderMarkdownReport(result);
  const json = JSON.stringify(result, null, 2);

  if (cli.format === 'markdown' || cli.format === 'both') {
    if (cli.output) {
      const outputPath = path.resolve(process.cwd(), cli.output);
      await ensureParentDir(outputPath);
      await writeFile(outputPath, markdown, 'utf8');
      console.log(`Markdown report written: ${outputPath}`);
    } else {
      console.log(markdown);
    }
  }

  if (cli.format === 'json' || cli.format === 'both') {
    if (cli.jsonOutput) {
      const jsonPath = path.resolve(process.cwd(), cli.jsonOutput);
      await ensureParentDir(jsonPath);
      await writeFile(jsonPath, json, 'utf8');
      console.log(`JSON report written: ${jsonPath}`);
    } else {
      console.log(json);
    }
  }
};

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown failure';
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
