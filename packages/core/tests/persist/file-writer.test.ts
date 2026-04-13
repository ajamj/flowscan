import { describe, it, expect } from 'vitest';
import {
  updateStatusInLine,
  updateMarkdownCheckbox,
} from '../../src/persist/file-writer';

describe('updateStatusInLine', () => {
  it('should update TODO marker to DONE', () => {
    const result = updateStatusInLine('// TODO: add validation', 'done');
    expect(result).toContain('DONE');
    expect(result).toContain('[status:done]');
  });

  it('should update FIXME marker to TODO', () => {
    const result = updateStatusInLine('// FIXME: null check', 'todo');
    expect(result).toContain('TODO');
    expect(result).toContain('[status:todo]');
  });

  it('should update HACK marker to FIXME', () => {
    const result = updateStatusInLine('# HACK: bypass check', 'review');
    expect(result).toContain('FIXME');
    expect(result).toContain('[status:review]');
  });

  it('should add status annotation to line without marker', () => {
    const result = updateStatusInLine('// some comment', 'todo');
    expect(result).toContain('[status:todo]');
  });

  it('should update existing status annotation', () => {
    const result = updateStatusInLine('// TODO: task [status:todo]', 'in-progress');
    expect(result).toContain('[status:in-progress]');
  });

  it('should handle Python comments', () => {
    const result = updateStatusInLine('# TODO: refactor function', 'review');
    expect(result).toContain('FIXME');
    expect(result).toContain('[status:review]');
  });

  it('should handle indented comments', () => {
    const result = updateStatusInLine('    // TODO: nested task', 'done');
    expect(result).toContain('DONE');
    expect(result).toContain('[status:done]');
  });
});

describe('updateMarkdownCheckbox', () => {
  it('should update unchecked to checked', () => {
    const result = updateMarkdownCheckbox('- [ ] Task one', 'done');
    expect(result).toBe('- [x] Task one');
  });

  it('should update checked to unchecked', () => {
    const result = updateMarkdownCheckbox('- [x] Completed task', 'todo');
    expect(result).toBe('- [ ] Completed task');
  });

  it('should update to backlog format', () => {
    const result = updateMarkdownCheckbox('- [ ] Some task', 'backlog');
    expect(result).toBe('- [-] Some task');
  });

  it('should update to in-progress format', () => {
    const result = updateMarkdownCheckbox('- [ ] Working on this', 'in-progress');
    expect(result).toBe('- [/] Working on this');
  });

  it('should add checkbox to line without one', () => {
    const result = updateMarkdownCheckbox('Plain text line', 'todo');
    expect(result).toBe('- [ ] Plain text line');
  });

  it('should handle indented checkboxes', () => {
    const result = updateMarkdownCheckbox('  - [ ] Indented task', 'done');
    expect(result).toBe('  - [x] Indented task');
  });
});
