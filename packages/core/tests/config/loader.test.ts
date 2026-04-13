import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigLoader } from '../../src/config/loader.js';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('ConfigLoader', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(process.cwd(), 'tests', 'temp-config-test');
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should return default config when config.yaml does not exist', () => {
    const loader = new ConfigLoader(tempDir);
    const config = loader.loadConfig();

    expect(config.version).toBe(1);
    expect(config.columns).toHaveLength(5);
  });

  it('should read and parse config.yaml when it exists', () => {
    const flowscanDir = join(tempDir, '.flowscan');
    mkdirSync(flowscanDir, { recursive: true });

    const yamlContent = `
version: 1
columns:
  - name: Custom Column
statusMapping:
  TODO: done
`;
    writeFileSync(join(flowscanDir, 'config.yaml'), yamlContent, 'utf-8');

    const loader = new ConfigLoader(tempDir);
    const config = loader.loadConfig();

    expect(config.columns).toHaveLength(1);
    expect(config.columns[0]?.name).toBe('Custom Column');
    expect(config.statusMapping['TODO']).toBe('done');
  });

  it('should throw on invalid YAML', () => {
    const flowscanDir = join(tempDir, '.flowscan');
    mkdirSync(flowscanDir, { recursive: true });

    writeFileSync(join(flowscanDir, 'config.yaml'), ':\ninvalid: yaml: [', 'utf-8');

    const loader = new ConfigLoader(tempDir);
    expect(() => loader.loadConfig()).toThrow();
  });

  it('should create default config file', () => {
    const loader = new ConfigLoader(tempDir);
    const path = loader.createDefaultConfig();

    expect(path).toContain('.flowscan');
    expect(path).toContain('config.yaml');
    expect(existsSync(path)).toBe(true);

    const content = readFileSync(path, 'utf-8');
    expect(content).toContain('version: 1');
  });

  it('should not overwrite existing config', () => {
    const flowscanDir = join(tempDir, '.flowscan');
    mkdirSync(flowscanDir, { recursive: true });
    const configPath = join(flowscanDir, 'config.yaml');
    writeFileSync(configPath, 'version: 1\n', 'utf-8');

    const loader = new ConfigLoader(tempDir);
    expect(() => loader.createDefaultConfig()).toThrow();
  });
});
