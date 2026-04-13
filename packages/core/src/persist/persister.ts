import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { ScanResult, WriteResult } from '../types.js';

const DEFAULT_CACHE_PATH = '.flowscan/cache.json';

export class FilePersister {
  private workspaceRoot: string;
  private cachePath: string;

  constructor(workspaceRoot: string, cachePath?: string) {
    this.workspaceRoot = workspaceRoot;
    this.cachePath = cachePath ?? DEFAULT_CACHE_PATH;
  }

  /** Write scan result to cache */
  write(result: ScanResult): WriteResult {
    try {
      const fullPath = join(this.workspaceRoot, this.cachePath);
      const dir = dirname(fullPath);

      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      // Atomic write: write to temp file, then rename
      const tempPath = fullPath + '.tmp';
      writeFileSync(tempPath, JSON.stringify(result, null, 2), 'utf-8');
      renameSync(tempPath, fullPath);

      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  /** Read cached scan result */
  read(): ScanResult | null {
    const fullPath = join(this.workspaceRoot, this.cachePath);

    if (!existsSync(fullPath)) {
      return null;
    }

    try {
      const raw = readFileSync(fullPath, 'utf-8');
      return JSON.parse(raw) as ScanResult;
    } catch {
      return null;
    }
  }
}
