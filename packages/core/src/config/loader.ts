import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import yaml from 'js-yaml';
import type { Config } from '../types.js';
import { generateDefaultConfig } from './defaults.js';
import { validateConfig, mergeConfig } from './schema.js';

const CONFIG_PATH = '.flowscan/config.yaml';

export class ConfigLoader {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  /** Load config from workspace root. Returns merged config or defaults. */
  loadConfig(): Config {
    const configPath = join(this.workspaceRoot, CONFIG_PATH);

    if (!existsSync(configPath)) {
      return generateDefaultConfig();
    }

    const raw = readFileSync(configPath, 'utf-8');
    let parsed: unknown;

    try {
      parsed = yaml.load(raw);
    } catch (e) {
      throw new Error(`Invalid YAML in ${CONFIG_PATH}: ${(e as Error).message}`);
    }

    const validated = validateConfig(parsed);
    const defaults = generateDefaultConfig();

    // Merge user config over defaults
    const merged: Config = {
      version: validated.version ?? defaults.version,
      columns: validated.columns ?? defaults.columns,
      filePatterns: {
        include: validated.filePatterns?.include ?? defaults.filePatterns.include,
        exclude: validated.filePatterns?.exclude ?? defaults.filePatterns.exclude,
      },
      statusMapping: { ...defaults.statusMapping, ...(validated.statusMapping ?? {}) },
      ignorePatterns: validated.ignorePatterns ?? defaults.ignorePatterns,
      cachePath: validated.cachePath ?? defaults.cachePath,
    };

    return merged;
  }

  /** Create default config file at .flowscan/config.yaml */
  createDefaultConfig(): string {
    const configPath = join(this.workspaceRoot, CONFIG_PATH);

    if (existsSync(configPath)) {
      throw new Error(`Config file already exists at ${CONFIG_PATH}`);
    }

    const config = generateDefaultConfig();
    const yamlContent = yaml.dump(config, { indent: 2, lineWidth: 120 });

    // Ensure directory exists
    const configDir = dirname(configPath);
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }

    writeFileSync(configPath, yamlContent, 'utf-8');

    return configPath;
  }

  /** Get the default config without writing to disk */
  getDefaultConfig(): Config {
    return generateDefaultConfig();
  }
}
