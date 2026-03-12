import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_CONFIG } from './constants.js';
import { CliOptions, WritingStyleConfig } from './types.js';

const getArgValue = (args: string[], key: string): string[] => {
  const values: string[] = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === key) {
      const value = args[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for ${key}`);
      }
      values.push(value);
      i += 1;
    }
  }
  return values;
};

const getSingle = (args: string[], key: string): string | undefined => {
  const values = getArgValue(args, key);
  return values.length > 0 ? values[values.length - 1] : undefined;
};

const hasFlag = (args: string[], key: string): boolean => args.includes(key);

const parseNumericArg = (raw: string | undefined, flag: string): number | undefined => {
  if (raw === undefined) return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid value for ${flag}: expected a finite number, got "${raw}".`);
  }
  return value;
};

export const parseCliArgs = (argv: string[]): CliOptions => {
  const input = getArgValue(argv, '--input');
  const compare = getArgValue(argv, '--compare');
  const mode = (getSingle(argv, '--mode') ?? (compare.length > 0 ? 'compare' : 'single')) as CliOptions['mode'];

  if (input.length === 0 && !hasFlag(argv, '--help')) {
    throw new Error('At least one --input path is required.');
  }

  const extensionsRaw = getSingle(argv, '--extensions');

  return {
    input,
    compare,
    output: getSingle(argv, '--output'),
    jsonOutput: getSingle(argv, '--json-output'),
    format: (getSingle(argv, '--format') as CliOptions['format']) ?? 'markdown',
    baseline: getSingle(argv, '--baseline'),
    include: getArgValue(argv, '--include'),
    exclude: getArgValue(argv, '--exclude'),
    extensions: extensionsRaw ? extensionsRaw.split(',').map((entry) => entry.trim()).filter(Boolean) : undefined,
    recentWeight: parseNumericArg(getSingle(argv, '--recent-weight'), '--recent-weight'),
    minWords: parseNumericArg(getSingle(argv, '--min-words'), '--min-words'),
    stopwords: getSingle(argv, '--stopwords'),
    domainWords: getSingle(argv, '--domain-words'),
    tropeWords: getSingle(argv, '--trope-words'),
    topN: parseNumericArg(getSingle(argv, '--top-n'), '--top-n'),
    mode,
    verbose: hasFlag(argv, '--verbose'),
    configPath: getSingle(argv, '--config'),
  };
};

export const loadConfigFile = async (configPath?: string): Promise<Partial<WritingStyleConfig>> => {
  if (!configPath) {
    return {};
  }

  const absolutePath = path.resolve(process.cwd(), configPath);
  const raw = await readFile(absolutePath, 'utf8');
  const parsed = JSON.parse(raw) as Partial<WritingStyleConfig>;
  return parsed;
};

export const buildConfig = (cli: CliOptions, fileConfig: Partial<WritingStyleConfig>): WritingStyleConfig => {
  return {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    extensions: cli.extensions ?? fileConfig.extensions ?? DEFAULT_CONFIG.extensions,
    exclude: [...(DEFAULT_CONFIG.exclude ?? []), ...(fileConfig.exclude ?? []), ...(cli.exclude ?? [])],
    minWords: cli.minWords ?? fileConfig.minWords ?? DEFAULT_CONFIG.minWords,
    topN: cli.topN ?? fileConfig.topN ?? DEFAULT_CONFIG.topN,
    recentWeight: cli.recentWeight ?? fileConfig.recentWeight ?? DEFAULT_CONFIG.recentWeight,
    stopwordsPath: cli.stopwords ?? fileConfig.stopwordsPath,
    domainWordsPath: cli.domainWords ?? fileConfig.domainWordsPath,
    tropeWordsPath: cli.tropeWords ?? fileConfig.tropeWordsPath,
  };
};
