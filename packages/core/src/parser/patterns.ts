/** Regex patterns for extracting task markers from different languages */

// Single-line comment patterns by language
const SINGLE_LINE_COMMENT_PATTERNS: Record<string, RegExp> = {
  typescript: /^(?:\s*)(?:\/\/)\s*(TODO|FIXME|HACK|NOTE|BUG|XXX)\s*:?\s*(.+)$/im,
  javascript: /^(?:\s*)(?:\/\/)\s*(TODO|FIXME|HACK|NOTE|BUG|XXX)\s*:?\s*(.+)$/im,
  python: /^(?:\s*)(?:#)\s*(TODO|FIXME|HACK|NOTE|BUG|XXX)\s*:?\s*(.+)$/im,
  go: /^(?:\s*)(?:\/\/)\s*(TODO|FIXME|HACK|NOTE|BUG|XXX)\s*:?\s*(.+)$/im,
  rust: /^(?:\s*)(?:\/\/)\s*(TODO|FIXME|HACK|NOTE|BUG|XXX)\s*:?\s*(.+)$/im,
};

// Block comment patterns
const BLOCK_COMMENT_PATTERNS: Record<string, RegExp> = {
  typescript: /\/\*\s*(TODO|FIXME|HACK|NOTE|BUG|XXX)\s*:?\s*([\s\S]*?)\s*\*\//gi,
  javascript: /\/\*\s*(TODO|FIXME|HACK|NOTE|BUG|XXX)\s*:?\s*([\s\S]*?)\s*\*\//gi,
  go: /\/\*\s*(TODO|FIXME|HACK|NOTE|BUG|XXX)\s*:?\s*([\s\S]*?)\s*\*\//gi,
  rust: /\/\*\s*(TODO|FIXME|HACK|NOTE|BUG|XXX)\s*:?\s*([\s\S]*?)\s*\*\//gi,
};

// Python docstring pattern
const PYTHON_DOCSTRING_PATTERN = /"""\s*(TODO|FIXME|HACK|NOTE|BUG|XXX)\s*:?\s*([\s\S]*?)\s*"""/gi;

// Markdown checkbox patterns
const MARKDOWN_CHECKBOX_PATTERN = /^\s*-\s*\[([ xX-])\]\s+(.+)$/gm;

// Markdown section headers
const MARKDOWN_SECTION_PATTERN = /^#{1,3}\s+(Backlog|To Do|In Progress|Review|Done|TODO)$/gm;

/** Get single-line comment regex for a language */
export function getSingleLineCommentPattern(language: string): RegExp | null {
  return SINGLE_LINE_COMMENT_PATTERNS[language] ?? null;
}

/** Get block comment regex for a language */
export function getBlockCommentPattern(language: string): RegExp | null {
  return BLOCK_COMMENT_PATTERNS[language] ?? null;
}

/** Get markdown checkbox pattern */
export function getMarkdownCheckboxPattern(): RegExp {
  return MARKDOWN_CHECKBOX_PATTERN;
}

/** Get markdown section header pattern */
export function getMarkdownSectionPattern(): RegExp {
  return MARKDOWN_SECTION_PATTERN;
}

/** Get Python docstring pattern */
export function getPythonDocstringPattern(): RegExp {
  return PYTHON_DOCSTRING_PATTERN;
}
