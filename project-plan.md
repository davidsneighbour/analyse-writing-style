
This is a **content-analysis tool**, not a prose generator. Its job is to inspect one or more corpora, extract measurable style signals, classify them, and turn them into **actionable updates** for your instruction files.

It should be designed for:

* your own site content
* older writing archives
* third-party reference corpora
* comparison between multiple writing sets

It should support your workflow of maintaining:

* `prose-style-baseline.instructions.md`
* `prose-style-target.instructions.md`
* prose compiler rules

## Primary Goals

The script MUST:

* analyse prose from files and directories
* distinguish likely style signals from topic artefacts
* produce a Markdown report
* propose updates for style instruction files
* support single-corpus and comparison modes
* be usable from the repository root
* work with strict TypeScript and no `any`

The script SHOULD:

* support Markdown-first content workflows
* ignore code blocks and frontmatter when analysing prose
* allow custom stopwords, trope lists, and domain vocab lists
* allow weighting recent content more heavily
* produce drift reports against an existing baseline

The script MUST NOT:

* rewrite the source files
* auto-edit baseline instruction files unless explicitly requested later
* treat raw word frequency alone as a style rule
* confuse topic vocabulary with stylistic vocabulary when avoidable

## Recommended File Location

```txt
src/scripts/analyse-writing-style.ts
```

If you want supporting utilities:

```txt
src/scripts/lib/writing-style/
```

Suggested helper files:

```txt
src/scripts/lib/writing-style/types.ts
src/scripts/lib/writing-style/config.ts
src/scripts/lib/writing-style/file-loader.ts
src/scripts/lib/writing-style/text-cleaning.ts
src/scripts/lib/writing-style/sentence-analysis.ts
src/scripts/lib/writing-style/paragraph-analysis.ts
src/scripts/lib/writing-style/vocabulary-analysis.ts
src/scripts/lib/writing-style/pattern-analysis.ts
src/scripts/lib/writing-style/evidence-analysis.ts
src/scripts/lib/writing-style/report-renderer.ts
src/scripts/lib/writing-style/baseline-diff.ts
```

## Execution Model

The script SHOULD run from the repository root.

Example:

```bash
node src/scripts/analyse-writing-style.ts --input "./src/content"
```

### CLI Requirements

The CLI MUST support `--help`.

The CLI SHOULD support `--verbose`.

The CLI MUST fail gracefully with clear errors if inputs are missing or invalid.

### Proposed CLI Options

```txt
--input <path>              One or more input files or directories
--compare <path>            One or more comparison files or directories
--output <path>             Output Markdown report path
--format <markdown|json|both>
--baseline <path>           Existing baseline instruction file
--target <path>             Existing target instruction file
--include <glob>            Include pattern
--exclude <glob>            Exclude pattern
--extensions <list>         Allowed file extensions
--recent-weight <number>    Weight newer files more heavily
--min-words <number>        Ignore files below minimum prose word count
--stopwords <path>          Custom stopword list
--domain-words <path>       Domain vocabulary list
--trope-words <path>        Trope vocabulary list
--top-n <number>            Number of items to show in ranked lists
--mode <single|compare|drift>
--verbose                   Verbose output
--help                      Show usage
```

### Example Commands

Single corpus:

```bash
node src/scripts/analyse-writing-style.ts \
  --input "./src/content" \
  --output "./reports/style-report.md" \
  --format markdown
```

Comparison mode:

```bash
node src/scripts/analyse-writing-style.ts \
  --input "./src/content" \
  --compare "../archive/content" \
  --compare "../reference-site/content" \
  --output "./reports/style-compare.md" \
  --format markdown
```

Drift mode:

```bash
node src/scripts/analyse-writing-style.ts \
  --input "./src/content" \
  --baseline ".vscode/instructions/prose-style-baseline.instructions.md" \
  --mode drift \
  --output "./reports/style-drift.md"
```

## Input Handling

### Supported Input Types

The script SHOULD support:

* Markdown files
* plain text files
* optionally HTML, if stripped to text first

Recommended default extensions:

```txt
.md,.mdx,.txt
```

### Directory Traversal

The script MUST recurse through directories.

The script SHOULD use `fast-glob`.

It SHOULD support include and exclude patterns.

### File Filtering

The script MUST ignore:

* binary files
* files below minimum text threshold
* generated output folders if excluded
* empty files

The script SHOULD log skipped files in verbose mode.

## Text Extraction and Cleaning

This stage is critical. The quality of the analysis depends on proper cleaning.

### The Extractor MUST Remove or Isolate

* YAML/TOML frontmatter
* code fences
* inline code
* HTML tags where possible
* shortcode-like syntax where obvious
* navigation boilerplate if detectable
* repeated template fragments if common across files

### The Extractor SHOULD Preserve

* headings
* paragraphs
* sentence boundaries
* list items as prose when they are natural-language content
* emphasis markers only if needed for structural interpretation

### Cleaning Modes

The script SHOULD support internal cleaned representations:

* raw text
* prose-only text
* paragraph array
* sentence array
* token array

## Analysis Model

The script should produce findings in five major categories.

### 1. Sentence Metrics

The script MUST calculate:

* total sentence count
* average sentence length in words
* median sentence length
* sentence length distribution
* percentage of short / medium / long sentences

Recommended bands:

* short: 1-9 words
* medium: 10-24 words
* long: 25+ words

The script SHOULD also estimate:

* fragment frequency
* subordinate clause density
* conjunction density
* punctuation-based complexity indicators

### 2. Paragraph Metrics

The script MUST calculate:

* total paragraph count
* average paragraph length in sentences
* median paragraph length
* percentage of one-sentence paragraphs
* percentage of long paragraphs

Recommended long paragraph threshold:

* 6+ sentences

The script SHOULD also detect:

* paragraph pacing consistency
* heading-to-paragraph ratios
* excessive fragmentation

### 3. Vocabulary Profile

The script MUST calculate:

* top verbs
* top nouns
* adverb frequency
* adjective frequency
* abstract-vs-concrete word signals
* type-token ratio or a similar lexical diversity signal

The script SHOULD separate:

* stopwords
* domain words
* trope words
* structural words
* preferred recurring words

The script SHOULD allow configurable domain and trope lists.

#### Vocabulary Classification

Each high-frequency token SHOULD be classified where possible as:

* likely style signal
* likely domain signal
* possible trope signal
* unknown

### 4. Structural and Rhetorical Pattern Analysis

The script MUST detect occurrences of patterns such as:

* rhetorical questions
* `not X, but Y`
* `not X. not Y. just Z.`
* `the result?`
* `here's the thing`
* `let's break this down`
* `think of it as`
* conclusion signposting
* repeated sentence openings
* tricolon-like sequences
* frequent em dash usage

These detections do not need perfect NLP. Strong heuristics are acceptable.

The script SHOULD report:

* count
* rate per 1,000 words
* representative examples

### 5. Evidence and Argument Style

This is heuristic, but valuable.

The script SHOULD estimate:

* mechanism markers: `because`, `when`, `if`, `therefore`, `so that`
* example markers: `for example`, `for instance`, `such as`
* metric presence: numbers, percentages, durations, counts
* source markers: named docs, named orgs, citations, links
* observation markers: `in this project`, `in our tests`, `I found`, `we saw`

The script SHOULD also attempt to score whether paragraphs follow:

```txt
observation -> explanation -> implication
```

This can be approximate. A simple scoring heuristic is enough.

## Style-signal Classification

This is one of the most important parts.

Every major finding SHOULD be classified as one of:

* stable style signal
* possible style signal
* likely topic artefact
* likely corpus artefact

### Stable Style Signal

Use when the pattern is:

* frequent
* distributed across many files
* not heavily topic-dependent
* consistent across time or groups

Example:

* medium sentence length across most files
* rare rhetorical questions
* consistent paragraph size

### Possible Style Signal

Use when the pattern appears meaningful but evidence is weaker.

Example:

* frequent use of `behaviour`, `mechanism`, `system`

### Likely Topic Artefact

Use when the finding probably reflects subject matter.

Example:

* high usage of `Astro`, `component`, `Tailwind`

### Likely Corpus Artefact

Use when the finding may be caused by:

* a repeated template
* a shared footer
* imported fragments
* one very large file skewing results

## Comparison Mode

Comparison mode SHOULD support:

* one primary corpus
* one or more comparison corpora

The report MUST compare:

* sentence metrics
* paragraph metrics
* rhetorical pattern frequency
* vocabulary profile
* evidence tendencies

The report SHOULD answer:

* what is distinctive about the primary corpus
* what overlaps with reference corpora
* what differs materially
* which differences appear stylistic rather than topical

## Drift Mode

Drift mode compares current writing against the existing baseline file.

### Inputs

Drift mode SHOULD take:

* analysed corpus
* `prose-style-baseline.instructions.md`

### Behaviour

The script SHOULD parse key measurable rules from the baseline where possible.

Examples:

* target sentence length
* preferred paragraph size
* metaphor tolerance
* rhetorical-question avoidance
* density expectations

The script MUST then report:

* rules still supported by current writing
* rules no longer supported
* candidate new rules
* areas where writing has shifted

### Output Example

```txt
Baseline says: paragraphs SHOULD usually contain 3-5 sentences.
Observed current corpus: median paragraph length is 2.8 sentences.
Recommendation: revise to 2-4 sentences or keep existing rule if current corpus is transitional.
```

## Output Requirements

The script MUST support Markdown output.

The script SHOULD support JSON output for later tooling.

### Markdown Report Structure

Recommended sections:

```txt
1. Scope
2. Corpus summary
3. Sentence metrics
4. Paragraph metrics
5. Vocabulary profile
6. Structural and rhetorical patterns
7. Evidence and argument style
8. Stable style signals
9. Possible style signals
10. Topic artefacts
11. Baseline update suggestions
12. Drift report
13. Appendix / examples
```

### Examples in Report

The report SHOULD include a few short representative examples for flagged patterns.

Do not quote long passages.

Keep examples brief and diagnostic.

## Suggested Baseline Update Output

The tool SHOULD produce a section like this:

```md
## Proposed baseline updates

* Sentence length SHOULD average 16-20 words.
* Paragraphs SHOULD usually contain 2-4 sentences.
* Mechanism-first explanation SHOULD be preferred over analogy.
* Rhetorical questions SHOULD be avoided.
* One-sentence paragraphs SHOULD be rare.
```

These suggestions SHOULD be framed as proposals, not automatic truth.

## Configuration

The script SHOULD support a config file so you do not have to pass everything via CLI.

Recommended file:

```txt
src/scripts/config/writing-style.config.json
```

Example shape:

```json
{
  "extensions": [".md", ".mdx", ".txt"],
  "exclude": [
    "**/node_modules/**",
    "**/dist/**",
    "**/.astro/**",
    "**/public/**"
  ],
  "minWords": 150,
  "topN": 25,
  "recentWeight": 1,
  "stopwordsPath": "./src/scripts/config/stopwords.txt",
  "domainWordsPath": "./src/scripts/config/domain-words.txt",
  "tropeWordsPath": "./src/scripts/config/trope-words.txt"
}
```

## Heuristic Rules

This script does not need full NLP. It should prefer robust heuristics over fragile complexity.

### Good Heuristic Candidates

* regex-based trope detection
* simple sentence splitting with cleanup
* paragraph splitting by blank lines
* word frequency with configurable ignore lists
* count-based evidence markers
* file-distribution checks for stability

### Avoid for V1

* dependency parsing
* semantic embeddings
* heavy ML models
* author identification models
* automatic instruction rewriting

## Data Structures

Suggested core types:

```ts
interface CorpusInput {
  name: string;
  paths: string[];
}

interface FileAnalysis {
  filePath: string;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  metrics: FileMetrics;
  patterns: PatternMatchSummary;
  vocabulary: VocabularySummary;
}

interface CorpusAnalysis {
  corpusName: string;
  files: FileAnalysis[];
  aggregate: AggregateMetrics;
  styleSignals: StyleSignal[];
  topicArtefacts: StyleSignal[];
  examples: DiagnosticExample[];
}

interface StyleSignal {
  label: string;
  category: 'sentence' | 'paragraph' | 'vocabulary' | 'pattern' | 'evidence';
  classification:
    | 'stable-style-signal'
    | 'possible-style-signal'
    | 'likely-topic-artefact'
    | 'likely-corpus-artefact';
  confidence: number;
  rationale: string;
  recommendation?: string;
}

interface DiagnosticExample {
  label: string;
  filePath: string;
  snippet: string;
}
```

## Success Criteria

Version 1 is successful if it can reliably do the following:

* analyse a content directory without crashing
* output useful sentence and paragraph metrics
* detect obvious trope patterns
* separate some domain vocabulary from likely style vocabulary
* generate reasonable baseline update suggestions
* produce a drift report that is actually worth reading

It does not need to be academically perfect.

It needs to be editorially useful.

## Development Phases

### Phase 1

Build:

* file loading
* cleaning
* sentence metrics
* paragraph metrics
* Markdown report

### Phase 2

Add:

* vocabulary analysis
* trope detection
* evidence heuristics
* baseline suggestions

### Phase 3

Add:

* comparison mode
* drift mode
* config file
* JSON export

## Key Design Principle

The output should help answer this question:

> Which traits in this corpus are genuinely part of the author's style, and which are just side effects of topic, format, or template?

If the tool does that well, it becomes useful for maintaining your prose instruction system.

## Implementation Plan

This plan is designed to sit next to the specification and give an AI agent a concrete build map.

It assumes:

* Node.js 22+
* TypeScript strict mode
* ESM
* `fast-glob`
* no `any`
* execution from repository root
* Markdown-first corpus analysis

The goal is to make the implementation **modular, testable, and incremental**.

### 1. Project Structure

```txt
src/
  scripts/
    analyse-writing-style.ts
    lib/
      writing-style/
        types.ts
        constants.ts
        cli.ts
        config.ts
        errors.ts
        logger.ts
        path-utils.ts
        file-loader.ts
        frontmatter.ts
        text-cleaning.ts
        sentence-analysis.ts
        paragraph-analysis.ts
        vocabulary-analysis.ts
        pattern-analysis.ts
        evidence-analysis.ts
        style-signal-classifier.ts
        corpus-aggregator.ts
        baseline-parser.ts
        baseline-diff.ts
        comparison.ts
        report-renderer.ts
        json-renderer.ts
        snippets.ts
        stats.ts
        guards.ts
        normalise.ts
```

Optional config and data:

```txt
src/
  scripts/
    config/
      writing-style.config.json
      stopwords.txt
      domain-words.txt
      trope-words.txt
```

Optional tests:

```txt
tests/
  writing-style/
    cli.test.ts
    file-loader.test.ts
    text-cleaning.test.ts
    sentence-analysis.test.ts
    paragraph-analysis.test.ts
    vocabulary-analysis.test.ts
    pattern-analysis.test.ts
    evidence-analysis.test.ts
    baseline-parser.test.ts
    baseline-diff.test.ts
    report-renderer.test.ts
```

### 2. Delivery Phases

#### Phase 1: Minimum Working Report

Implement:

* CLI parsing
* config loading
* file discovery
* Markdown cleaning
* sentence metrics
* paragraph metrics
* Markdown report output

#### Phase 2: Core Style Analysis

Implement:

* vocabulary analysis
* trope detection
* evidence heuristics
* style-signal classification
* representative snippets

#### Phase 3: Advanced Workflows

Implement:

* comparison mode
* drift mode
* baseline parsing
* baseline diff suggestions
* JSON output

### 3. Main Execution Flow

#### Entry File

`src/scripts/analyse-writing-style.ts`

This file should be thin. It should orchestrate, not contain analysis logic.

##### Responsibilities

* parse CLI args
* load config
* resolve runtime mode
* run analysis pipeline
* render outputs
* exit with proper status code

##### Main Flow

```txt
parse args
-> build runtime config
-> validate inputs
-> load corpora
-> clean and analyse files
-> aggregate corpus results
-> classify style signals
-> optionally compare / drift
-> render report
-> write output
```

##### Functions

###### `main(): Promise<void>`

Top-level script execution.

###### `run(): Promise<void>`

Main orchestration body used inside `main()` with `try/catch`.

###### `handleFatalError(error: unknown): never`

Formats an error message and exits with non-zero code.

### 4. File-by-file Implementation Plan

#### `types.ts`

This is the backbone. Define all shared strict types here.

##### Must Include

###### CLI and Config

```ts
export type OutputFormat = 'markdown' | 'json' | 'both';
export type AnalysisMode = 'single' | 'compare' | 'drift';
export type SignalClassification =
  | 'stable-style-signal'
  | 'possible-style-signal'
  | 'likely-topic-artefact'
  | 'likely-corpus-artefact';
```

###### Runtime Config

```ts
export interface CliOptions { … }
export interface WritingStyleConfig { … }
export interface RuntimeConfig { … }
```

###### Inputs

```ts
export interface CorpusInput {
  name: string;
  paths: string[];
}
```

###### Cleaned Text Model

```ts
export interface CleanedText {
  rawText: string;
  proseText: string;
  headings: string[];
  paragraphs: string[];
  sentences: string[];
  tokens: string[];
}
```

###### Analysis Units

```ts
export interface FileAnalysis { … }
export interface CorpusAnalysis { … }
export interface AggregateMetrics { … }
export interface StyleSignal { … }
export interface DiagnosticExample { … }
```

###### Pattern and Evidence

```ts
export interface PatternMatch {
  label: string;
  count: number;
  ratePerThousandWords: number;
  examples: DiagnosticExample[];
}

export interface PatternMatchSummary {
  matches: Record<string, PatternMatch>;
}

export interface EvidenceMetrics {
  mechanismMarkers: number;
  exampleMarkers: number;
  metricMarkers: number;
  sourceMarkers: number;
  observationMarkers: number;
  mechanismRatePerThousandWords: number;
}
```

###### Baseline and Drift

```ts
export interface BaselineRule {
  key: string;
  rawText: string;
  parsedValue?: string | number | [number, number];
  confidence: number;
}

export interface DriftFinding {
  ruleKey: string;
  baselineValue: string;
  observedValue: string;
  status: 'aligned' | 'drifted' | 'uncertain';
  recommendation: string;
}
```

###### Functions

No runtime logic required here.

#### `constants.ts`

Centralise defaults and heuristic thresholds.

##### Include

* default extensions
* sentence band thresholds
* paragraph length thresholds
* trope regex labels
* evidence marker lists
* default top-N
* default minimum prose word count

##### Exports

###### `DEFAULT_EXTENSIONS`

###### `DEFAULT_EXCLUDE_PATTERNS`

###### `SHORT_SENTENCE_MAX`

###### `MEDIUM_SENTENCE_MAX`

###### `LONG_PARAGRAPH_SENTENCE_THRESHOLD`

###### `DEFAULT_TOP_N`

###### `DEFAULT_MIN_WORDS`

###### `TROPE_PATTERNS: readonly PatternDefinition[]`

Pattern definitions with label and regex.

###### `EVIDENCE_MARKERS`

Grouped marker lists.

#### `errors.ts`

Custom error types for clean failure handling.

##### Classes

###### `CliValidationError extends Error`

For invalid CLI combinations.

###### `ConfigError extends Error`

For invalid or unreadable config.

###### `InputDiscoveryError extends Error`

For file resolution issues.

###### `OutputWriteError extends Error`

For write failures.

#### `logger.ts`

Simple logging utility with verbose support.

##### Functions

###### `createLogger(verbose: boolean): Logger`

##### `Logger` Methods

###### `info(message: string): void`

###### `warn(message: string): void`

###### `error(message: string): void`

###### `debug(message: string): void`

`debug()` should no-op unless verbose.

#### `guards.ts`

Type guards for safe parsing and strict TS.

##### Functions

###### `isRecord(value: unknown): value is Record<string, unknown>`

###### `isStringArray(value: unknown): value is string[]`

###### `isOutputFormat(value: unknown): value is OutputFormat`

###### `isAnalysisMode(value: unknown): value is AnalysisMode`

#### `normalise.ts`

Small normalisation utilities used everywhere.

##### Functions

###### `normaliseWhitespace(input: string): string`

###### `normaliseLineEndings(input: string): string`

###### `normaliseToken(input: string): string`

###### `stripPunctuationEdges(input: string): string`

###### `toSafeCorpusName(input: string): string`

---

#### `path-utils.ts`

Path resolution helpers.

##### Functions

###### `resolveFromCwd(inputPath: string): string`

###### `ensureAbsolutePaths(paths: string[]): string[]`

###### `deriveCorpusNameFromPath(inputPath: string): string`

###### `isDirectory(pathname: string): Promise<boolean>`

###### `isFile(pathname: string): Promise<boolean>`

#### `cli.ts`

Parse CLI args and build `CliOptions`.

No external CLI framework is required for v1 unless you want one. Manual parsing is acceptable and keeps dependencies small.

##### Functions

###### `parseCliArgs(argv: string[]): CliOptions`

Parse raw args.

###### `validateCliOptions(options: CliOptions): void`

Validate required fields and mutual exclusions.

###### `renderHelpMessage(scriptName: string): string`

Generate `--help`.

###### `parseListArgument(value: string): string[]`

For comma-separated extensions or similar.

##### Behaviour

* print help and exit on `--help`
* reject missing `--input`
* reject invalid `--mode`
* allow multiple `--input` and `--compare`
* reject `--compare` in non-compare mode only if you want strictness; otherwise infer compare mode

#### `config.ts`

Load defaults, optional config file, then merge with CLI overrides.

##### Functions

###### `loadConfig(configPath?: string): Promise<WritingStyleConfig>`

Reads JSON config if present.

###### `mergeConfig(cli: CliOptions, fileConfig: WritingStyleConfig): RuntimeConfig`

CLI overrides config.

###### `validateRuntimeConfig(config: RuntimeConfig): void`

Final validation.

###### `loadWordList(filePath: string): Promise<Set<string>>`

For stopwords, domain words, trope words.

##### Notes

This module should not analyse content. Only config management.

#### `file-loader.ts`

Discover and load input files.

##### Responsibilities

* resolve directories and files
* recurse with `fast-glob`
* filter by extension and exclude patterns
* read file content
* ignore empty or too-small files
* create per-file input objects

##### Types

```ts
export interface SourceFile {
  filePath: string;
  corpusName: string;
  content: string;
  extension: string;
}
```

##### Functions

###### `discoverCorpusFiles(corpus: CorpusInput, config: RuntimeConfig, logger: Logger): Promise<SourceFile[]>`

Resolve one corpus into source files.

###### `discoverAllCorpora(config: RuntimeConfig, logger: Logger): Promise<Map<string, SourceFile[]>>`

Load all configured corpora.

###### `readSourceFile(filePath: string): Promise<string>`

Read file content.

###### `shouldIncludeFile(filePath: string, config: RuntimeConfig): boolean`

Check extension and patterns.

###### `filterByMinimumWordCount(files: SourceFile[], minWords: number): SourceFile[]`

Quick pre-clean word threshold.

##### Notes

Use `fast-glob` instead of `glob`, per your preference.

#### `frontmatter.ts`

Dedicated frontmatter handling.

##### Functions

###### `stripFrontmatter(input: string): string`

Remove YAML/TOML frontmatter block from Markdown-like files.

###### `extractFrontmatter(input: string): { frontmatter: string | null; body: string }`

Useful if later you want metadata weighting.

#### `text-cleaning.ts`

This is critical. It converts source text into analyzable prose.

##### Responsibilities

* remove frontmatter
* remove fenced code blocks
* remove inline code
* strip HTML tags
* collapse repeated whitespace
* preserve paragraphs and headings
* produce sentence and token-friendly text

##### Functions

###### `cleanSourceText(content: string): CleanedText`

Main entry point.

###### `removeCodeFences(input: string): string`

###### `removeInlineCode(input: string): string`

###### `stripHtmlTags(input: string): string`

###### `stripShortcodes(input: string): string`

###### `splitParagraphs(input: string): string[]`

###### `extractHeadings(input: string): string[]`

###### `tokenise(input: string): string[]`

###### `buildProseText(paragraphs: string[]): string`

Joins paragraphs for sentence splitting.

##### Notes

Do not over-engineer. Strong heuristics are enough.

#### `sentence-analysis.ts`

Sentence segmentation and sentence-level metrics.

##### Responsibilities

* split prose into sentences
* measure sentence lengths
* classify short/medium/long
* estimate fragments and complexity heuristics

##### Functions

###### `splitSentences(proseText: string): string[]`

Use heuristic sentence splitting.

###### `analyseSentences(sentences: string[]): SentenceMetrics`

Return aggregated metrics.

###### `getSentenceWordCounts(sentences: string[]): number[]`

###### `classifySentenceLengths(counts: number[]): SentenceLengthDistribution`

###### `estimateFragmentRate(sentences: string[]): number`

Heuristic only.

###### `estimateSentenceComplexity(sentences: string[]): SentenceComplexityMetrics`

Can use punctuation/conjunction indicators.

##### Output Types

```ts
export interface SentenceMetrics {
  totalSentences: number;
  averageWordsPerSentence: number;
  medianWordsPerSentence: number;
  shortSentencePercentage: number;
  mediumSentencePercentage: number;
  longSentencePercentage: number;
  estimatedFragmentPercentage: number;
}
```

#### `paragraph-analysis.ts`

Paragraph-level metrics and pacing.

##### Functions

###### `analyseParagraphs(paragraphs: string[]): ParagraphMetrics`

Main entry point.

###### `countSentencesPerParagraph(paragraphs: string[]): number[]`

###### `countWordsPerParagraph(paragraphs: string[]): number[]`

###### `calculateParagraphPacing(paragraphs: string[]): ParagraphPacingMetrics`

Optional heuristic.

###### `detectExcessiveFragmentation(paragraphs: string[]): number`

Based on one-sentence paragraph rate.

##### Output Types

```ts
export interface ParagraphMetrics {
  totalParagraphs: number;
  averageSentencesPerParagraph: number;
  medianSentencesPerParagraph: number;
  averageWordsPerParagraph: number;
  oneSentenceParagraphPercentage: number;
  longParagraphPercentage: number;
}
```

#### `vocabulary-analysis.ts`

Analyse vocabulary without conflating topic and style too aggressively.

##### Responsibilities

* token frequency
* lexical diversity
* word class buckets by heuristic
* domain/trope/stopword filtering
* preferred recurring words

##### Functions

###### `analyseVocabulary(tokens: string[], config: RuntimeConfig): VocabularySummary`

Main entry point.

###### `countTokenFrequency(tokens: string[]): Map<string, number>`

###### `calculateTypeTokenRatio(tokens: string[]): number`

###### `getTopTokens(tokens: string[], limit: number): RankedToken[]`

###### `classifyToken(token: string, config: RuntimeConfig): TokenClassification`

Returns stopword/domain/trope/unknown/possible-style.

###### `extractTopStyleCandidates(frequencies: Map<string, number>, config: RuntimeConfig): RankedToken[]`

###### `extractTopTropeWords(…)`

###### `extractTopDomainWords(…)`

##### Notes

Part-of-speech tagging is optional. For v1, simple heuristics and suffixes are acceptable if needed, but not required.

#### `pattern-analysis.ts`

Detect AI-writing tropes and structural rhetorical patterns.

##### Responsibilities

* run regex/heuristic matchers
* compute per-pattern counts
* compute rates per 1,000 words
* extract representative snippets

##### Functions

###### `analysePatterns(cleaned: CleanedText, filePath: string): PatternMatchSummary`

Main entry point for one file.

###### `findPatternMatches(text: string, pattern: PatternDefinition, filePath: string): PatternMatch`

###### `extractPatternExamples(text: string, regex: RegExp, filePath: string, label: string): DiagnosticExample[]`

###### `calculateRatePerThousandWords(count: number, wordCount: number): number`

##### Patterns to Include in V1

* rhetorical questions
* `not X, but Y`
* `not X. not Y. just Z.`
* `the result?`
* `here's the thing`
* `let's break this down`
* `think of it as`
* conclusion signposting
* repeated sentence openings
* em-dash overuse marker

##### Special Helper

###### `detectRepeatedSentenceOpenings(sentences: string[]): PatternMatch | null`

Heuristic detector.

#### `evidence-analysis.ts`

Heuristic evidence and argument style analysis.

##### Responsibilities

* count mechanism markers
* count example markers
* count number/metric presence
* count source/attribution markers
* count direct observation markers
* estimate paragraph support style

##### Functions

###### `analyseEvidence(cleaned: CleanedText): EvidenceMetrics`

Main entry point.

###### `countMechanismMarkers(text: string): number`

###### `countExampleMarkers(text: string): number`

###### `countMetricMarkers(text: string): number`

###### `countSourceMarkers(text: string): number`

###### `countObservationMarkers(text: string): number`

###### `scoreParagraphArgumentShape(paragraph: string): ParagraphArgumentScore`

Try to detect observation/explanation/implication shape.

###### `analyseParagraphArgumentShapes(paragraphs: string[]): ParagraphArgumentSummary`

##### Notes

Keep it heuristic. This module should produce useful editorial signals, not claim linguistic certainty.

#### `stats.ts`

Pure statistical utilities reused across modules.

##### Functions

###### `sum(values: number[]): number`

###### `average(values: number[]): number`

###### `median(values: number[]): number`

###### `percentage(part: number, total: number): number`

###### `ratePerThousand(count: number, totalWords: number): number`

###### `standardDeviation(values: number[]): number`

Optional but useful for pacing consistency.

#### `snippets.ts`

Snippet extraction utilities for examples.

##### Functions

###### `extractSnippetAroundMatch(text: string, start: number, end: number, radius?: number): string`

###### `truncateSnippet(input: string, maxLength?: number): string`

###### `cleanSnippet(input: string): string`

#### `style-signal-classifier.ts`

Turns metrics into editorial interpretations.

This is where raw stats become:

* stable style signal
* possible style signal
* likely topic artefact
* likely corpus artefact

##### Responsibilities

* evaluate distribution across files
* distinguish topic-heavy tokens
* generate rationales
* generate recommendations

##### Functions

###### `classifyStyleSignals(corpus: CorpusAnalysis, config: RuntimeConfig): StyleSignal[]`

Main entry point.

###### `classifySentenceSignals(corpus: CorpusAnalysis): StyleSignal[]`

###### `classifyParagraphSignals(corpus: CorpusAnalysis): StyleSignal[]`

###### `classifyVocabularySignals(corpus: CorpusAnalysis, config: RuntimeConfig): StyleSignal[]`

###### `classifyPatternSignals(corpus: CorpusAnalysis): StyleSignal[]`

###### `classifyEvidenceSignals(corpus: CorpusAnalysis): StyleSignal[]`

###### `isStableAcrossFiles(values: number[], threshold?: number): boolean`

###### `buildSignalRationale(…): string`

###### `buildSignalRecommendation(…): string | undefined`

##### Example Outputs

* "The corpus strongly prefers medium-length declarative sentences."
* "Rhetorical question usage is negligible and is likely a stable style signal."
* "`Astro` appears frequently but is classified as a likely topic artefact."

#### `corpus-aggregator.ts`

Aggregate per-file analyses into corpus-level results.

##### Responsibilities

* combine metrics
* combine vocabulary frequencies
* combine pattern counts
* combine evidence stats
* track file distribution
* produce representative examples

##### Functions

###### `analyseFile(source: SourceFile, config: RuntimeConfig): FileAnalysis`

Main entry point for one file.

###### `aggregateCorpus(corpusName: string, files: FileAnalysis[]): CorpusAnalysis`

Main entry point for one corpus.

###### `aggregateMetrics(files: FileAnalysis[]): AggregateMetrics`

###### `aggregateVocabulary(files: FileAnalysis[]): VocabularySummary`

###### `aggregatePatterns(files: FileAnalysis[]): PatternMatchSummary`

###### `aggregateEvidence(files: FileAnalysis[]): EvidenceMetrics`

###### `collectRepresentativeExamples(files: FileAnalysis): DiagnosticExample[]`

Probably helper fed by pattern matches.

##### Notes

This module is central and should remain pure where possible.

#### `baseline-parser.ts`

Parse measurable rules from `prose-style-baseline.instructions.md`.

This should be intentionally limited to measurable patterns.

##### Responsibilities

* read the baseline file as text
* extract rule-like statements
* parse measurable constraints

##### Functions

###### `parseBaselineInstructionFile(content: string): BaselineRule[]`

Main entry point.

###### `extractSentenceLengthRule(content: string): BaselineRule | null`

###### `extractParagraphLengthRule(content: string): BaselineRule | null`

###### `extractRhetoricalQuestionRule(content: string): BaselineRule | null`

###### `extractMetaphorToleranceRule(content: string): BaselineRule | null`

###### `extractOneSentenceParagraphRule(content: string): BaselineRule | null`

##### Notes

Do not try to fully parse natural language. Only support a small set of known measurable patterns.

#### `baseline-diff.ts`

Compare observed corpus against baseline rules.

##### Responsibilities

* map corpus metrics to baseline keys
* decide aligned/drifted/uncertain
* generate editorial recommendations

##### Functions

###### `diffAgainstBaseline(corpus: CorpusAnalysis, rules: BaselineRule[]): DriftFinding[]`

Main entry point.

###### `compareSentenceLengthRule(…)`

###### `compareParagraphLengthRule(…)`

###### `compareOneSentenceParagraphRule(…)`

###### `compareRhetoricalQuestionRule(…)`

###### `renderBaselineSuggestion(findings: DriftFinding[]): string[]`

Can return proposed new rule statements.

##### Output Examples

* aligned
* drifted
* uncertain due to weak corpus size

#### `comparison.ts`

Compare primary corpus with one or more secondary corpora.

##### Responsibilities

* compute deltas for major metrics
* identify distinctive traits
* identify overlaps
* identify likely stylistic differences

##### Functions

###### `compareCorpora(primary: CorpusAnalysis, others: CorpusAnalysis[]): ComparisonReport`

Main entry point.

###### `compareSentenceMetrics(…)`

###### `compareParagraphMetrics(…)`

###### `comparePatternRates(…)`

###### `compareVocabularyProfiles(…)`

###### `compareEvidenceProfiles(…)`

###### `identifyDistinctiveSignals(…)`

###### `identifySharedSignals(…)`

##### Output Type

```ts
export interface ComparisonReport {
  primaryCorpusName: string;
  comparisons: CorpusComparison[];
  distinctiveSignals: StyleSignal[];
  sharedSignals: StyleSignal[];
}
```

#### `report-renderer.ts`

Generate Markdown output.

##### Responsibilities

* render human-readable report
* include sections in consistent order
* support single / compare / drift modes
* include short examples
* include proposed baseline updates

##### Functions

###### `renderMarkdownReport(input: RenderReportInput): string`

Main entry point.

###### `renderScopeSection(…)`

###### `renderCorpusSummarySection(…)`

###### `renderSentenceMetricsSection(…)`

###### `renderParagraphMetricsSection(…)`

###### `renderVocabularySection(…)`

###### `renderPatternSection(…)`

###### `renderEvidenceSection(…)`

###### `renderStyleSignalsSection(…)`

###### `renderComparisonSection(…)`

###### `renderDriftSection(…)`

###### `renderBaselineSuggestionsSection(…)`

###### `renderAppendixSection(…)`

##### Report Style

Keep Markdown simple:

* headings
* short bullet lists
* short tables only if useful
* inline file paths in backticks

#### `json-renderer.ts`

Optional structured export.

##### Functions

###### `renderJsonReport(input: RenderReportInput): string`

Serialize cleanly formatted JSON.

### 5. Core Orchestration Design

#### In `analyse-writing-style.ts`

Recommended orchestration steps:

##### Step 1

Parse CLI args using `parseCliArgs(process.argv.slice(2))`

##### Step 2

Load config using `loadConfig()`

##### Step 3

Merge into `RuntimeConfig`

##### Step 4

Resolve corpora:

* one primary corpus from `--input`
* zero or more compare corpora from `--compare`

##### Step 5

For each source file:

* clean text
* analyse file
* aggregate corpus

##### Step 6

Classify style signals for each corpus

##### Step 7

If drift mode:

* read baseline file
* parse rules
* compute drift findings

##### Step 8

If compare mode:

* compute comparison report

##### Step 9

Render Markdown and/or JSON

##### Step 10

Write to output path, or print to stdout if no output path is provided

### 6. Data Flow between Modules

```txt
file-loader
  -> SourceFile

text-cleaning
  -> CleanedText

sentence-analysis
paragraph-analysis
vocabulary-analysis
pattern-analysis
evidence-analysis
  -> per-file metrics

corpus-aggregator
  -> CorpusAnalysis

style-signal-classifier
  -> StyleSignal[]

baseline-parser
baseline-diff
  -> DriftFinding[]

comparison
  -> ComparisonReport

report-renderer / json-renderer
  -> output
```

### 7. Function-level Build order

This is the order I would give an AI agent.

#### Build order A: Foundation

1. `types.ts`
2. `constants.ts`
3. `stats.ts`
4. `guards.ts`
5. `logger.ts`
6. `errors.ts`
7. `normalise.ts`

#### Build order B: IO and Cleaning

1. `cli.ts`
2. `config.ts`
3. `path-utils.ts`
4. `file-loader.ts`
5. `frontmatter.ts`
6. `text-cleaning.ts`

#### Build order C: Analysis

1. `sentence-analysis.ts`
2. `paragraph-analysis.ts`
3. `vocabulary-analysis.ts`
4. `pattern-analysis.ts`
5. `evidence-analysis.ts`

#### Build order D: Aggregation and Interpretation

1. `corpus-aggregator.ts`
2. `style-signal-classifier.ts`
3. `comparison.ts`
4. `baseline-parser.ts`
5. `baseline-diff.ts`

#### Build order E: Outputs

1. `snippets.ts`
2. `report-renderer.ts`
3. `json-renderer.ts`
4. `analyse-writing-style.ts`

### 8. Suggested Initial Implementation Details

#### `analyseFile()` In `corpus-aggregator.ts`

This should be the single per-file assembly point.

##### Pseudocode

```ts
export function analyseFile(source: SourceFile, config: RuntimeConfig): FileAnalysis {
  const cleaned = cleanSourceText(source.content);
  const sentenceMetrics = analyseSentences(cleaned.sentences);
  const paragraphMetrics = analyseParagraphs(cleaned.paragraphs);
  const vocabulary = analyseVocabulary(cleaned.tokens, config);
  const patterns = analysePatterns(cleaned, source.filePath);
  const evidence = analyseEvidence(cleaned);

  return {
    filePath: source.filePath,
    wordCount: cleaned.tokens.length,
    sentenceCount: cleaned.sentences.length,
    paragraphCount: cleaned.paragraphs.length,
    cleaned,
    sentenceMetrics,
    paragraphMetrics,
    vocabulary,
    patterns,
    evidence
  };
}
```

#### `aggregateCorpus()` In `corpus-aggregator.ts`

##### Responsibilities

* sum and average metrics
* aggregate vocabulary maps
* merge pattern counts
* merge examples
* create a `CorpusAnalysis`

### 9. Style-signal Heuristics

The AI agent should implement these as conservative heuristics, not truth claims.

#### Sentence Signal Examples

##### Stable Style Signal

If:

* average sentence length is 15-21 across most files
* variance is moderate
* not driven by one huge file

Then:

* classify as `stable-style-signal`

#### Topic Artefact Example

If:

* top token is `astro`
* token exists in domain words list
* it appears in only Astro-related corpora

Then:

* classify as `likely-topic-artefact`

#### Corpus Artefact Example

If:

* `in conclusion` appears 20 times
* but all 20 come from one imported article template

Then:

* classify as `likely-corpus-artefact`

### 10. Drift-mode Measurable Rules to Support First

Do not attempt to parse every prose rule. Support a practical subset.

#### V1 Rule Set

* sentence length range
* paragraph sentence range
* one-sentence paragraphs rarity
* rhetorical-question avoidance
* minimal metaphor use
* direct/mechanistic explanation preference only as a weak heuristic

This keeps baseline parsing realistic.

### 11. Output Report Contract

The generated Markdown report should include these sections in this order:

#### Single Mode

1. Scope
2. Corpus summary
3. Sentence metrics
4. Paragraph metrics
5. Vocabulary profile
6. Structural and rhetorical patterns
7. Evidence and argument style
8. Stable style signals
9. Possible style signals
10. Likely topic artefacts
11. Baseline update suggestions
12. Appendix examples

#### Compare Mode

Add:

* Comparison summary
* Distinctive primary-corpus traits
* Shared traits across corpora

#### Drift Mode

Add:

* Baseline alignment summary
* Drift findings
* Proposed baseline updates

### 12. Suggested Config Shape

The implementation should support this interface:

```ts
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
```

Later you can extend with:

* corpus aliases
* weighting by date
* excerpt limits
* report style preferences

### 13. Suggested Test Strategy

#### Unit Tests First

Prioritise tests for:

* frontmatter stripping
* code fence removal
* sentence splitting
* paragraph counting
* trope detection
* baseline parsing

#### Fixture-based Tests

Create small Markdown fixtures:

```txt
tests/fixtures/writing-style/
  simple-post.md
  trope-heavy-post.md
  code-heavy-post.md
  baseline-sample.instructions.md
```

#### Regression Tests

Important for:

* repeated sentence opening detection
* `not X, but Y` regex
* frontmatter parsing
* HTML stripping

### 14. AI-agent Task Breakdown

This is how I would instruct an AI coding agent to proceed.

#### Task 1

Create all types, constants, and shared utility modules.

#### Task 2

Implement CLI parsing, config loading, and file discovery.

#### Task 3

Implement text cleaning and cleaned-text model generation.

#### Task 4

Implement sentence and paragraph analysis.

#### Task 5

Implement vocabulary analysis with stopword/domain/trope classification.

#### Task 6

Implement rhetorical pattern detection with representative snippets.

#### Task 7

Implement evidence heuristics.

#### Task 8

Implement corpus aggregation and style-signal classification.

#### Task 9

Implement baseline parsing and drift mode.

#### Task 10

Implement comparison mode and Markdown/JSON renderers.

#### Task 11

Integrate everything in `analyse-writing-style.ts`.

#### Task 12

Add tests and sample config.

### 15. Suggested Acceptance Criteria per Milestone

#### Milestone 1

The script can analyse one Markdown directory and produce a readable Markdown report.

#### Milestone 2

The report includes trope counts, vocabulary classification, and evidence heuristics.

#### Milestone 3

The script supports compare mode and drift mode.

#### Milestone 4

The script produces baseline update suggestions worth reviewing manually.

### 16. Suggested Future Enhancements after V1

Not needed for first delivery, but worth tracking.

#### Near-term

* frontmatter date extraction for recency weighting
* heading structure analysis
* sentence-opening n-gram analysis
* metaphor marker heuristics
* repeated phrase detection across corpus

#### Later

* style fingerprint snapshots over time
* baseline update draft output
* HTML corpus support
* visual charts
* corpus clustering
* "compare me vs target style" mode

### 17. Practical Prompt-ready Build Brief for an AI Agent

You can use this as the build brief:

```md
Implement `src/scripts/analyse-writing-style.ts` and its supporting modules according to the provided specification and implementation plan.

Requirements:

* Use TypeScript with strict typing and no `any`
* Use ESM
* Use `fast-glob` for file discovery
* Run from repository root
* Support Markdown-first analysis
* Ignore frontmatter, code fences, inline code, and obvious non-prose content
* Support `single`, `compare`, and `drift` modes
* Output Markdown report, with optional JSON output
* Keep modules focused and testable
* Add graceful error handling
* Add `--help` and `--verbose`
* Do not auto-modify baseline files
* Build in phases so the script is runnable as early as possible

Implementation order:

1. shared types and constants
2. CLI/config/file loading
3. text cleaning
4. sentence/paragraph analysis
5. vocabulary/pattern/evidence analysis
6. corpus aggregation and style-signal classification
7. baseline parsing and drift mode
8. comparison mode
9. report rendering
10. integration in `analyse-writing-style.ts`

Deliverables:

* complete script and support modules
* sample config file
* tests for core parsing and analysis utilities
* example Markdown report output from fixtures
```
