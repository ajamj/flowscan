// FlowScan Core - Public API

export type {
  Task,
  TaskStatus,
  TaskMetadata,
  ScanResult,
  ScanError,
  ScanErrorCode,
  Config,
  ColumnConfig,
  FilePatterns,
  StatusMapping,
  RawTask,
  ParseResult,
  WriteResult,
} from './types.js';

export { scan } from './scan/scanner.js';
export { generateTaskId } from './scan/scanner.js';
export { ConfigLoader } from './config/loader.js';
export { generateDefaultConfig } from './config/defaults.js';
export { validateConfig, mergeConfig } from './config/schema.js';
export { StatusMapper } from './status/mapper.js';
export { parseFile, parseFileContent, isBinaryFile, validatePath } from './parser/engine.js';
export { parseMarkdown } from './parser/markdown.js';
export { getLanguageByExtension } from './parser/languages.js';
