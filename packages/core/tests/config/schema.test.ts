import { describe, it, expect } from 'vitest';
import { generateDefaultConfig } from '../../src/config/defaults.js';
import { validateConfig, mergeConfig } from '../../src/config/schema.js';

describe('generateDefaultConfig', () => {
  it('should return config with 5 default columns', () => {
    const config = generateDefaultConfig();
    expect(config.columns).toHaveLength(5);
    expect(config.columns.map(c => c.name)).toEqual([
      'Backlog',
      'To Do',
      'In Progress',
      'Review',
      'Done',
    ]);
  });

  it('should include default file patterns for TS/JS/Python/Go/Rust/MD', () => {
    const config = generateDefaultConfig();
    expect(config.filePatterns.include.join(',')).toContain('ts');
    expect(config.filePatterns.include.join(',')).toContain('py');
    expect(config.filePatterns.include.join(',')).toContain('go');
    expect(config.filePatterns.include.join(',')).toContain('rs');
    expect(config.filePatterns.include.join(',')).toContain('md');
  });

  it('should exclude node_modules, dist, .git', () => {
    const config = generateDefaultConfig();
    expect(config.filePatterns.exclude).toContain('node_modules/**');
    expect(config.filePatterns.exclude).toContain('dist/**');
    expect(config.filePatterns.exclude).toContain('.git/**');
  });

  it('should have status mapping for common markers', () => {
    const config = generateDefaultConfig();
    expect(config.statusMapping['TODO']).toBe('todo');
    expect(config.statusMapping['FIXME']).toBe('review');
    expect(config.statusMapping['HACK']).toBe('in-progress');
    expect(config.statusMapping['NOTE']).toBe('backlog');
    expect(config.statusMapping['DONE']).toBe('done');
  });
});

describe('validateConfig', () => {
  it('should reject null input', () => {
    expect(() => validateConfig(null)).toThrow();
    expect(() => validateConfig(undefined)).toThrow();
  });

  it('should reject config without version', () => {
    expect(() => validateConfig({})).toThrow();
  });

  it('should reject invalid statusMapping values', () => {
    expect(() =>
      validateConfig({ version: 1, statusMapping: { TODO: 'invalid' } }),
    ).toThrow();
  });

  it('should accept valid minimal config', () => {
    const config = validateConfig({ version: 1 });
    expect(config.version).toBe(1);
  });

  it('should accept full valid config', () => {
    const input = {
      version: 1,
      columns: [{ name: 'To Do' }],
      filePatterns: { include: ['**/*.ts'], exclude: [] },
      statusMapping: { TODO: 'todo' },
    };
    const config = validateConfig(input);
    expect(config.version).toBe(1);
    expect(config.columns).toHaveLength(1);
  });
});

describe('mergeConfig', () => {
  it('should merge user config over defaults', () => {
    const merged = mergeConfig({
      version: 2,
      columns: [{ name: 'Custom Column' }],
    });

    expect(merged.version).toBe(2);
    expect(merged.columns).toHaveLength(1);
    // statusMapping should still have defaults
    expect(merged.statusMapping['TODO']).toBe('todo');
  });

  it('should preserve default filePatterns when not overridden', () => {
    const merged = mergeConfig({});
    expect(merged.filePatterns.exclude).toContain('node_modules/**');
  });
});
