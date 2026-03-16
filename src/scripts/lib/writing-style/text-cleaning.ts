import { CODE_FENCE_RE, FRONTMATTER_RE, INLINE_CODE_RE } from './constants.js';

const SHORTCODE_RE = /\{[%{][\s\S]*?[%}]\}/g;
const HTML_TAG_RE = /<[^>]+>/g;
const URL_LINE_RE = /^https?:\/\/\S+$/gm;

export const stripFrontmatter = (text: string): string => text.replace(FRONTMATTER_RE, '');

export const cleanProseText = (text: string): string => {
  return stripFrontmatter(text)
    .replace(CODE_FENCE_RE, '\n')
    .replace(INLINE_CODE_RE, ' ')
    .replace(SHORTCODE_RE, ' ')
    .replace(HTML_TAG_RE, ' ')
    .replace(URL_LINE_RE, ' ')
    .replace(/^\s*[-_*]{3,}\s*$/gm, ' ')
    .replace(/\|/g, ' ')
    // Normalize spaces and tabs, but preserve line breaks and paragraph boundaries
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const splitParagraphs = (text: string): string[] => {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .filter((paragraph) => !/^#{1,6}\s*\w*$/.test(paragraph));
};

export const splitSentences = (text: string): string[] => {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z"'([])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
    .filter((sentence) => /[a-zA-Z]{2,}/.test(sentence));
};

export const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\-\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1)
    .filter((token) => !/^\d+$/.test(token));
};
