import { describe, it, expect } from 'vitest';
import type { Task, ColumnConfig, TaskStatus } from '../src/types';

describe('types', () => {
  it('should have valid Task type', () => {
    const task: Task = {
      id: 'test-1',
      title: 'Test task',
      description: 'A test task',
      file: 'src/test.ts',
      line: 10,
      column: 1,
      status: 'todo',
      language: 'typescript',
      rawContent: '// TODO: test task',
      metadata: { priority: 'high', labels: ['core'] },
    };

    expect(task.id).toBe('test-1');
    expect(task.status).toBe('todo');
    expect(task.metadata.priority).toBe('high');
    expect(task.metadata.labels).toContain('core');
  });

  it('should have valid TaskStatus values', () => {
    const statuses: TaskStatus[] = ['backlog', 'todo', 'in-progress', 'review', 'done'];
    expect(statuses).toHaveLength(5);
  });

  it('should have valid ColumnConfig type', () => {
    const col: ColumnConfig = { name: 'To Do', status: 'todo' };
    expect(col.name).toBe('To Do');
    expect(col.status).toBe('todo');
  });
});
