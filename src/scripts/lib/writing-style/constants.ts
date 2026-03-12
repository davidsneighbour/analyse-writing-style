import { WritingStyleConfig } from './types.js';

export const DEFAULT_CONFIG: WritingStyleConfig = {
  extensions: ['.md', '.mdx', '.txt'],
  exclude: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/reports/**'],
  minWords: 80,
  topN: 20,
  recentWeight: 1,
};

export const HELP_TEXT = `Analyse writing style across one or more corpora.

Usage:
  npm run analyse -- --input <path> [options]

Required:
  --input <path>              Input file or directory (repeatable)

Options:
  --compare <path>            Comparison file or directory (repeatable)
  --output <path>             Markdown report output path
  --json-output <path>        JSON output path (when format json/both)
  --format <markdown|json|both>
  --mode <single|compare|drift>
  --baseline <path>           Baseline instructions file for drift mode
  --config <path>             JSON config path
  --include <glob>            Include glob (repeatable)
  --exclude <glob>            Exclude glob (repeatable)
  --extensions <.md,.txt>     Comma separated extensions
  --recent-weight <number>
  --min-words <number>
  --stopwords <path>
  --domain-words <path>
  --trope-words <path>
  --top-n <number>
  --verbose
  --help`;

export const INLINE_CODE_RE = /`[^`]*`/g;
export const CODE_FENCE_RE = /```[\s\S]*?```/g;
export const FRONTMATTER_RE = /^(---|\+\+\+)\s*[\r\n][\s\S]*?[\r\n]\1\s*[\r\n]*/;
