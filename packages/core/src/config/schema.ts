import type { Config, TaskStatus } from '../types.js';
import { generateDefaultConfig } from './defaults.js';

const VALID_STATUSES: TaskStatus[] = ['backlog', 'todo', 'in-progress', 'review', 'done'];

/** Validate configuration and return a normalized Config */
export function validateConfig(input: unknown): Config {
  if (input == null || typeof input !== 'object') {
    throw new Error('Config must be an object');
  }

  const obj = input as Record<string, unknown>;

  // version is required
  if (typeof obj.version !== 'number' || obj.version < 1) {
    throw new Error('Config requires valid version number (>= 1)');
  }

  // Validate columns if present
  if (obj.columns !== undefined) {
    if (!Array.isArray(obj.columns)) {
      throw new Error('columns must be an array');
    }
    for (const col of obj.columns) {
      if (col == null || typeof col !== 'object') {
        throw new Error('Each column must be an object');
      }
      const c = col as Record<string, unknown>;
      if (typeof c.name !== 'string' || c.name.length === 0) {
        throw new Error('Each column must have a name');
      }
    }
  }

  // Validate filePatterns if present
  if (obj.filePatterns !== undefined) {
    const fp = obj.filePatterns as Record<string, unknown>;
    if (typeof fp !== 'object') {
      throw new Error('filePatterns must be an object');
    }
    if (fp.include !== undefined && !Array.isArray(fp.include)) {
      throw new Error('filePatterns.include must be an array');
    }
    if (fp.exclude !== undefined && !Array.isArray(fp.exclude)) {
      throw new Error('filePatterns.exclude must be an array');
    }
  }

  // Validate statusMapping if present
  if (obj.statusMapping !== undefined) {
    const sm = obj.statusMapping as Record<string, unknown>;
    if (typeof sm !== 'object') {
      throw new Error('statusMapping must be an object');
    }
    for (const [key, value] of Object.entries(sm)) {
      if (!VALID_STATUSES.includes(value as TaskStatus)) {
        throw new Error(`statusMapping["${key}"] must be a valid TaskStatus, got "${value}"`);
      }
    }
  }

  return obj as unknown as Config;
}

/** Deep merge user config over defaults */
export function mergeConfig(user: Partial<Config>): Config {
  const defaults = generateDefaultConfig();

  const merged: Config = {
    version: user.version ?? defaults.version,
    columns: user.columns ?? defaults.columns,
    filePatterns: {
      include: user.filePatterns?.include ?? defaults.filePatterns.include,
      exclude: user.filePatterns?.exclude ?? defaults.filePatterns.exclude,
    },
    statusMapping: { ...defaults.statusMapping, ...(user.statusMapping ?? {}) },
    ignorePatterns: user.ignorePatterns ?? defaults.ignorePatterns,
    cachePath: user.cachePath ?? defaults.cachePath,
  };

  return merged;
}
