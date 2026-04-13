import { glob } from 'fast-glob';
import { join, relative, resolve } from 'node:path';
import { existsSync, statSync, realpathSync, readFileSync } from 'node:fs';
import type { Config, ScanResult, ScanError, Task } from '../types.js';
import { isBinaryFile, validatePath, parseFile } from '../parser/engine.js';
import { parseMarkdown } from '../parser/markdown.js';
import { StatusMapper } from '../status/mapper.js';
import { generateDefaultConfig } from '../config/defaults.js';
import { getExtension } from '../parser/languages.js';
import { createHash } from 'node:crypto';

/** Generate deterministic task ID from file path and content */
export function generateTaskId(filePath: string, content: string): string {
  const hash = createHash('sha256');
  hash.update(filePath + ':' + content.slice(0, 100));
  return hash.digest('hex').slice(0, 16);
}

/** Main scan function */
export async function scan(
  workspaceRoot: string,
  config: Config = generateDefaultConfig(),
): Promise<ScanResult> {
  const startTime = Date.now();
  const tasks: Task[] = [];
  const errors: ScanError[] = [];
  let filesScanned = 0;

  const statusMapper = new StatusMapper(config);

  // Discover files
  const includePatterns = config.filePatterns.include;
  const excludePatterns = config.filePatterns.exclude;

  let filePaths: string[];
  try {
    filePaths = await glob(includePatterns, {
      cwd: workspaceRoot,
      ignore: excludePatterns,
      absolute: true,
      onlyFiles: true,
    });
  } catch (e) {
    errors.push({
      code: 'FILE_ERROR',
      message: `File discovery failed: ${(e as Error).message}`,
    });
    return { tasks: [], duration: Date.now() - startTime, filesScanned: 0, errors, timestamp: new Date().toISOString() };
  }

  // Filter out binary files and validate paths
  const validPaths = filePaths.filter(fp => {
    const resolved = realpathSync(fp);
    const resolvedRoot = resolve(workspaceRoot);
    if (!resolved.startsWith(resolvedRoot)) {
      errors.push({ code: 'PATH_ERROR', message: 'Path outside workspace', file: fp });
      return false;
    }
    if (isBinaryFile(fp)) {
      return false;
    }
    return true;
  });

  // Parse each file
  for (const fp of validPaths) {
    filesScanned++;

    const ext = getExtension(fp.split('/').pop() ?? '');
    const language = ext === 'md' || ext === 'mdx' ? 'markdown' :
                     ext ? (ext === 'ts' || ext === 'tsx' ? 'typescript' :
                     ext === 'js' || ext === 'jsx' || ext === 'mjs' || ext === 'cjs' ? 'javascript' :
                     ext === 'py' || ext === 'pyw' ? 'python' :
                     ext === 'go' ? 'go' :
                     ext === 'rs' ? 'rust' : null) : null;

    if (!language) {
      continue;
    }

    try {
      if (language === 'markdown') {
        const content = readFileSync(fp, 'utf-8');
        const rawTasks = parseMarkdown(content);
        const relativePath = relative(workspaceRoot, fp);
        for (const rawTask of rawTasks) {
          rawTask.file = relativePath;
          const status = statusMapper.mapStatus(rawTask.marker);
          tasks.push({
            id: generateTaskId(rawTask.file, rawTask.rawContent),
            title: rawTask.message.slice(0, 80),
            description: rawTask.message,
            file: rawTask.file,
            line: rawTask.line,
            column: rawTask.column,
            status,
            language: rawTask.language,
            rawContent: rawTask.rawContent,
            metadata: {},
          });
        }
      } else {
        const result = parseFile(fp, workspaceRoot);
        if (result.error) {
          errors.push(result.error);
        }
        for (const rawTask of result.tasks) {
          const status = statusMapper.mapStatus(rawTask.marker);
          tasks.push({
            id: generateTaskId(rawTask.file, rawTask.rawContent),
            title: rawTask.message.slice(0, 80),
            description: rawTask.message,
            file: rawTask.file,
            line: rawTask.line,
            column: rawTask.column,
            status,
            language: rawTask.language,
            rawContent: rawTask.rawContent,
            metadata: {},
          });
        }
      }
    } catch (e) {
      errors.push({
        code: 'PARSE_ERROR',
        message: `Failed to parse ${fp}: ${(e as Error).message}`,
        file: fp,
      });
    }
  }

  const duration = Date.now() - startTime;

  return {
    tasks,
    duration,
    filesScanned,
    errors,
    timestamp: new Date().toISOString(),
  };
}
