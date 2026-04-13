/** Map file extensions to language identifiers */
const LANGUAGE_EXTENSIONS: Record<string, string> = {
  'ts': 'typescript',
  'tsx': 'typescript',
  'js': 'javascript',
  'jsx': 'javascript',
  'mjs': 'javascript',
  'cjs': 'javascript',
  'py': 'python',
  'pyw': 'python',
  'go': 'go',
  'rs': 'rust',
  'md': 'markdown',
  'mdx': 'markdown',
};

/** Get language by file extension */
export function getLanguageByExtension(ext: string): string | null {
  return LANGUAGE_EXTENSIONS[ext.toLowerCase()] ?? null;
}

/** Get file extension from filename */
export function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1] ?? '' : '';
}
