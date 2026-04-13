import { describe, it, expect } from 'vitest';
import { StatusMapper } from '../../src/status/mapper.js';
import { generateDefaultConfig } from '../../src/config/defaults.js';

describe('StatusMapper', () => {
  it('should map TODO to todo', () => {
    const mapper = new StatusMapper();
    expect(mapper.mapStatus('TODO')).toBe('todo');
  });

  it('should map FIXME to review', () => {
    const mapper = new StatusMapper();
    expect(mapper.mapStatus('FIXME')).toBe('review');
  });

  it('should map HACK to in-progress', () => {
    const mapper = new StatusMapper();
    expect(mapper.mapStatus('HACK')).toBe('in-progress');
  });

  it('should map NOTE to backlog', () => {
    const mapper = new StatusMapper();
    expect(mapper.mapStatus('NOTE')).toBe('backlog');
  });

  it('should map DONE to done', () => {
    const mapper = new StatusMapper();
    expect(mapper.mapStatus('DONE')).toBe('done');
  });

  it('should map checkbox markers', () => {
    const mapper = new StatusMapper();
    expect(mapper.mapStatus('- [x]')).toBe('done');
    expect(mapper.mapStatus('- [ ]')).toBe('todo');
    expect(mapper.mapStatus('- [-]')).toBe('backlog');
  });

  it('should fall back to todo for unknown markers', () => {
    const mapper = new StatusMapper();
    expect(mapper.mapStatus('UNKNOWN')).toBe('todo');
  });

  it('should map to columns correctly', () => {
    const mapper = new StatusMapper();
    expect(mapper.mapToColumn('todo')).toBe('To Do');
    expect(mapper.mapToColumn('review')).toBe('Review');
    expect(mapper.mapToColumn('done')).toBe('Done');
    expect(mapper.mapToColumn('backlog')).toBe('Backlog');
  });

  it('should use custom config mapping', () => {
    const config = generateDefaultConfig();
    config.statusMapping = { 'TODO': 'in-progress' };
    const mapper = new StatusMapper(config);
    expect(mapper.mapStatus('TODO')).toBe('in-progress');
  });
});
