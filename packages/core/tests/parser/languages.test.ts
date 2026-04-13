import { describe, it, expect } from 'vitest';
import { getLanguageByExtension, getExtension } from '../../src/parser/languages.js';

describe('getLanguageByExtension', () => {
  it('should return typescript for ts', () => {
    expect(getLanguageByExtension('ts')).toBe('typescript');
  });

  it('should return typescript for tsx', () => {
    expect(getLanguageByExtension('tsx')).toBe('typescript');
  });

  it('should return javascript for js', () => {
    expect(getLanguageByExtension('js')).toBe('javascript');
  });

  it('should return python for py', () => {
    expect(getLanguageByExtension('py')).toBe('python');
  });

  it('should return go for go', () => {
    expect(getLanguageByExtension('go')).toBe('go');
  });

  it('should return rust for rs', () => {
    expect(getLanguageByExtension('rs')).toBe('rust');
  });

  it('should return markdown for md', () => {
    expect(getLanguageByExtension('md')).toBe('markdown');
  });

  it('should return null for unknown extension', () => {
    expect(getLanguageByExtension('xyz')).toBeNull();
  });

  it('should be case-insensitive', () => {
    expect(getLanguageByExtension('TS')).toBe('typescript');
    expect(getLanguageByExtension('Py')).toBe('python');
  });
});

describe('getExtension', () => {
  it('should extract extension from filename', () => {
    expect(getExtension('file.ts')).toBe('ts');
    expect(getExtension('file.test.ts')).toBe('ts');
    expect(getExtension('file')).toBe('');
  });
});
