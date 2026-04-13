import type { RawTask, ParseResult, ScanError } from '../types.js';
import { getSingleLineCommentPattern, getBlockCommentPattern, getPythonDocstringPattern } from './patterns.js';
import { getLanguageByExtension, getExtension } from './languages.js';
import { readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';

/** Parse tasks from a file's content */
export function parseFileContent(content: string, language: string): RawTask[] {
  const tasks: RawTask[] = [];
  const lines = content.split('\n');

  const singleLinePattern = getSingleLineCommentPattern(language);
  const blockPattern = getBlockCommentPattern(language);

  // Single-line comments
  if (singleLinePattern) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const match = singleLinePattern.exec(line);
      if (match && match[1] && match[2]) {
        tasks.push({
          marker: match[1].toUpperCase(),
          message: match[2].trim(),
          file: '', // filled in by scanner
          line: i + 1,
          column: line.indexOf(match[0]) + 1,
          language,
          rawContent: line.trim(),
        });
        singleLinePattern.lastIndex = 0; // reset for next iteration
      }
    }
  }

  // Block comments
  if (blockPattern) {
    let blockMatch: RegExpExecArray | null;
    while ((blockMatch = blockPattern.exec(content)) !== null) {
      if (blockMatch[1] && blockMatch[2]) {
        const lineNumber = content.slice(0, blockMatch.index).split('\n').length;
        tasks.push({
          marker: blockMatch[1].toUpperCase(),
          message: blockMatch[2].trim(),
          file: '',
          line: lineNumber,
          column: 1,
          language,
          rawContent: blockMatch[0].trim(),
        });
      }
    }
  }

  // Python docstrings
  if (language === 'python') {
    const pyPattern = getPythonDocstringPattern();
    let pyMatch: RegExpExecArray | null;
    while ((pyMatch = pyPattern.exec(content)) !== null) {
      if (pyMatch[1] && pyMatch[2]) {
        const lineNumber = content.slice(0, pyMatch.index).split('\n').length;
        tasks.push({
          marker: pyMatch[1].toUpperCase(),
          message: pyMatch[2].trim(),
          file: '',
          line: lineNumber,
          column: 1,
          language,
          rawContent: pyMatch[0].trim(),
        });
      }
    }
  }

  return tasks;
}

/** Binary file extensions to skip */
const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'svg', 'webp',
  'exe', 'dll', 'so', 'dylib', 'bin', 'o', 'obj', 'lib',
  'zip', 'tar', 'gz', 'bz2', '7z', 'rar',
  'pdf', 'doc', 'docx', 'xls', 'xlsx',
  'wasm', 'class', 'pyc',
]);

/** Check if file is binary by extension */
export function isBinaryFile(filename: string): boolean {
  const ext = getExtension(filename).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

/** Validate that a file path is within the workspace root */
export function validatePath(filePath: string, workspaceRoot: string): boolean {
  const resolved = resolve(filePath);
  const resolvedRoot = resolve(workspaceRoot);
  return resolved.startsWith(resolvedRoot);
}

/** Parse a single file */
export function parseFile(filePath: string, workspaceRoot: string): ParseResult {
  // Validate path
  if (!validatePath(filePath, workspaceRoot)) {
    return {
      tasks: [],
      error: { code: 'PATH_ERROR', message: `Path ${filePath} is outside workspace root`, file: filePath },
    };
  }

  // Skip binary files
  if (isBinaryFile(filePath)) {
    return {
      tasks: [],
      error: { code: 'BINARY_FILE', message: 'Binary file skipped', file: filePath },
    };
  }

  // Read file
  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch (e) {
    return {
      tasks: [],
      error: { code: 'FILE_ERROR', message: `Cannot read file: ${(e as Error).message}`, file: filePath },
    };
  }

  // Get language and parse
  const ext = getExtension(filePath);
  const language = getLanguageByExtension(ext);
  if (!language) {
    return { tasks: [] };
  }

  if (language === 'markdown') {
    // Markdown handled separately by markdown parser
    return { tasks: [] };
  }

  const tasks = parseFileContent(content, language);

  // Attach file path (relative to workspace)
  const relativePath = relative(workspaceRoot, filePath);
  for (const task of tasks) {
    task.file = relativePath;
  }

  return { tasks };
}
