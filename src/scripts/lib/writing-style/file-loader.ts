import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';

const toPosix = (value: string): string => value.replaceAll('\\', '/');

const buildPatternForDirectory = (input: string, extensions: string[]): string => {
  const extPattern = extensions.length > 0 ? `**/*{${extensions.join(',')}}` : '**/*';
  return `${toPosix(input)}/${extPattern}`;
};

export const discoverFiles = async (
  inputs: string[],
  extensions: string[],
  exclude: string[],
  include: string[]
): Promise<string[]> => {
  const patterns: string[] = [];

  for (const input of inputs) {
    const absoluteInput = path.resolve(process.cwd(), input);
    try {
      const stats = await stat(absoluteInput);
      if (stats.isFile()) {
        patterns.push(toPosix(input));
      } else if (stats.isDirectory()) {
        patterns.push(buildPatternForDirectory(input, extensions));
      }
    } catch {
      patterns.push(buildPatternForDirectory(input, extensions));
    }
  }

  const found = await fg(patterns, {
    dot: false,
    onlyFiles: true,
    unique: true,
    ignore: exclude,
    cwd: process.cwd(),
  });

  if (include.length === 0) {
    return found.map((entry) => path.resolve(process.cwd(), entry));
  }

  const included = await fg(include, { onlyFiles: true, cwd: process.cwd(), unique: true });
  const includedSet = new Set(included.map((entry) => path.resolve(process.cwd(), entry)));
  return found.map((entry) => path.resolve(process.cwd(), entry)).filter((entry) => includedSet.has(entry));
};

export const loadTextFile = async (filePath: string): Promise<string> => {
  return readFile(filePath, 'utf8');
};

export const loadWordList = async (filePath?: string): Promise<Set<string>> => {
  if (!filePath) {
    return new Set<string>();
  }
  const absolutePath = path.resolve(process.cwd(), filePath);
  const raw = await readFile(absolutePath, 'utf8');
  return new Set(
    raw
      .split(/\r?\n/)
      .map((line: string) => line.trim().toLowerCase())
      .filter((line: string) => line.length > 0 && !line.startsWith('#'))
  );
};
