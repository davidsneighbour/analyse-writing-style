import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanProseText, splitSentences, tokenize } from '../src/scripts/lib/writing-style/text-cleaning.js';

test('cleanProseText removes frontmatter and code fences', () => {
  const input = `---\ntitle: hello\n---\n\nText before.\n\n\`inline\`\n\n\
\`\`\`ts\nconst x = 1;\n\`\`\``;
  const cleaned = cleanProseText(input);
  assert.equal(cleaned.includes('title:'), false);
  assert.equal(cleaned.includes('const x'), false);
  assert.equal(cleaned.includes('inline'), false);
  assert.equal(cleaned.includes('Text before.'), true);
});

test('splitSentences keeps natural sentence boundaries', () => {
  const sentences = splitSentences('First sentence. Second sentence? Third sentence!');
  assert.equal(sentences.length, 3);
});

test('tokenize drops pure numbers and punctuation', () => {
  const tokens = tokenize('Alpha beta 123 gamma, delta.');
  assert.deepEqual(tokens, ['alpha', 'beta', 'gamma', 'delta']);
});
