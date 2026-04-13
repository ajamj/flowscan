// Core type definitions for FlowScan

/** Valid task statuses */
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

/** A parsed task from a code comment or Markdown file */
export interface Task {
  /** Deterministic ID: hash(relativePath + contentHash) */
  id: string;
  /** Short title extracted from the comment */
  title: string;
  /** Longer description or raw comment text */
  description: string;
  /** Relative path from workspace root */
  file: string;
  /** 1-indexed line number */
  line: number;
  /** 1-indexed column number */
  column: number;
  /** Inferred status */
  status: TaskStatus;
  /** Programming language or 'markdown' */
  language: string;
  /** Original comment text */
  rawContent: string;
  /** Optional metadata (labels, priority, dueDate, assignee) */
  metadata: TaskMetadata;
}

export interface TaskMetadata {
  labels?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  assignee?: string;
  [key: string]: unknown;
}

/** Result of a complete workspace scan */
export interface ScanResult {
  tasks: Task[];
  duration: number; // milliseconds
  filesScanned: number;
  errors: ScanError[];
  timestamp: string; // ISO 8601
}

/** Structured error from scanning a file */
export interface ScanError {
  code: ScanErrorCode;
  message: string;
  file?: string;
  line?: number;
}

export type ScanErrorCode =
  | 'CONFIG_ERROR'
  | 'PARSE_ERROR'
  | 'FILE_ERROR'
  | 'PATH_ERROR'
  | 'BINARY_FILE'
  | 'ENCODING_ERROR';

/** FlowScan configuration */
export interface Config {
  version: number;
  columns: ColumnConfig[];
  filePatterns: FilePatterns;
  statusMapping: Record<string, TaskStatus>;
  ignorePatterns?: string[];
  cachePath?: string;
}

export interface ColumnConfig {
  name: string;
  patterns?: string[];
}

export interface FilePatterns {
  include: string[];
  exclude: string[];
}

/** Status mapping: marker → TaskStatus */
export type StatusMapping = Record<string, TaskStatus>;

/** Raw task before status mapping */
export interface RawTask {
  marker: string; // TODO, FIXME, [x], etc.
  message: string;
  file: string;
  line: number;
  column: number;
  language: string;
  rawContent: string;
}

/** Parse result for a single file */
export interface ParseResult {
  tasks: RawTask[];
  error?: ScanError;
}

/** Write result for file persistence */
export interface WriteResult {
  success: boolean;
  error?: string;
}
