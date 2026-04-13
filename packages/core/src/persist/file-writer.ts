import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import type { TaskStatus } from '../types.js';

/** Status marker format for code comments */
const STATUS_ANNOTATION = '[status:';

/** Map status to comment marker for code files */
const STATUS_TO_MARKER: Record<TaskStatus, string> = {
  'backlog': 'NOTE',
  'todo': 'TODO',
  'in-progress': 'HACK',
  'review': 'FIXME',
  'done': 'DONE',
};

/** Map status to markdown checkbox format */
const STATUS_TO_MARKDOWN: Record<TaskStatus, string> = {
  'backlog': '- [-]',
  'todo': '- [ ]',
  'in-progress': '- [/]',
  'review': '- [?]',
  'done': '- [x]',
};

/**
 * Update the status annotation in a raw comment line.
 * If no status annotation exists, adds one.
 */
export function updateStatusInLine(line: string, newStatus: TaskStatus): string {
  const marker = STATUS_TO_MARKER[newStatus];

  // Check if line has [status:X] annotation
  const statusAnnotationRegex = /\[status:[^\]]+\]/;
  if (statusAnnotationRegex.test(line)) {
    return line.replace(statusAnnotationRegex, `[status:${newStatus}]`);
  }

  // Check if line starts with a task marker (TODO, FIXME, HACK, NOTE, DONE, BUG)
  const markerRegex = /^(.*?\s*)(TODO|FIXME|HACK|NOTE|DONE|BUG)\s*:?\s*(.*)$/i;
  const match = line.match(markerRegex);

  if (match && match[2]) {
    const prefix = match[1] ?? '';
    const oldMarker = match[2];
    const rest = match[3] ?? '';

    // Replace marker with new one, add status annotation
    return `${prefix}${marker}: ${rest} [status:${newStatus}]`.trimEnd();
  }

  // No marker found — append status annotation
  return `${line.trim()} [status:${newStatus}]`;
}

/**
 * Update a markdown checkbox line with new status.
 */
export function updateMarkdownCheckbox(line: string, newStatus: TaskStatus): string {
  const checkboxFormat = STATUS_TO_MARKDOWN[newStatus];

  // Match existing checkbox: - [x], - [ ], - [-]
  const checkboxRegex = /^(\s*)-\s*\[[ xX-]\]\s*(.*)$/;
  const match = line.match(checkboxRegex);

  if (match) {
    const indent = match[1] ?? '';
    const taskText = match[2] ?? '';
    return `${indent}${checkboxFormat} ${taskText}`.trimEnd();
  }

  // No checkbox — add one
  return `${checkboxFormat} ${line.trim()}`;
}

/**
 * Update task status in source file.
 * Returns the updated file content or null if task not found.
 */
export function updateTaskInFile(
  filePath: string,
  workspaceRoot: string,
  taskLine: number,
  newStatus: TaskStatus,
  language: string,
): string | null {
  const fullPath = resolve(workspaceRoot, filePath);

  let content: string;
  try {
    content = readFileSync(fullPath, 'utf-8');
  } catch {
    return null;
  }

  const lines = content.split('\n');
  const lineIndex = taskLine - 1; // 1-indexed to 0-indexed

  if (lineIndex < 0 || lineIndex >= lines.length) {
    return null;
  }

  const originalLine = lines[lineIndex]!;
  let updatedLine: string;

  if (language === 'markdown') {
    updatedLine = updateMarkdownCheckbox(originalLine, newStatus);
  } else {
    updatedLine = updateStatusInLine(originalLine, newStatus);
  }

  lines[lineIndex] = updatedLine;
  return lines.join('\n');
}

/**
 * Write updated content back to file atomically.
 */
export function writeUpdatedFile(
  filePath: string,
  workspaceRoot: string,
  content: string,
): { success: boolean; error?: string } {
  const fullPath = resolve(workspaceRoot, filePath);
  const tempPath = fullPath + '.flowscan.tmp';

  try {
    writeFileSync(tempPath, content, 'utf-8');
    // Atomic rename
    renameSync(tempPath, fullPath);
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  };
}
