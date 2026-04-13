import { describe, it, expect } from 'vitest';
import type { Task, ScanResult, Config, ScanError, TaskStatus } from '../src/types.js';

describe('Task type', () => {
  it('should have all required fields', () => {
    const task: Task = {
      id: 'test-id',
      title: 'Test task',
      description: 'A test task from a comment',
      file: 'src/test.ts',
      line: 10,
      column: 1,
      status: 'todo',
      language: 'typescript',
      rawContent: '// TODO: test task',
      metadata: {},
    };

    expect(task.id).toBe('test-id');
    expect(task.title).toBe('Test task');
    expect(task.file).toBe('src/test.ts');
    expect(task.line).toBe(10);
    expect(task.status).toBe('todo');
    expect(task.language).toBe('typescript');
    expect(task.rawContent).toBe('// TODO: test task');
    expect(task.metadata).toEqual({});
  });

  it('should support optional metadata fields', () => {
    const task: Task = {
      id: 'test-id-2',
      title: 'Task with metadata',
      description: 'Task with priority',
      file: 'src/main.ts',
      line: 5,
      column: 3,
      status: 'in-progress',
      language: 'typescript',
      rawContent: '// TODO: task with priority [priority:high]',
      metadata: {
        priority: 'high',
        labels: ['core'],
        dueDate: '2026-04-20',
        assignee: 'ajamj',
      },
    };

    expect(task.metadata.priority).toBe('high');
    expect(task.metadata.labels).toEqual(['core']);
    expect(task.metadata.dueDate).toBe('2026-04-20');
    expect(task.metadata.assignee).toBe('ajamj');
  });
});

describe('ScanResult type', () => {
  it('should have correct shape', () => {
    const result: ScanResult = {
      tasks: [],
      duration: 1234,
      filesScanned: 500,
      errors: [],
      timestamp: '2026-04-13T00:00:00.000Z',
    };

    expect(result.tasks).toBeInstanceOf(Array);
    expect(result.duration).toBe(1234);
    expect(result.filesScanned).toBe(500);
    expect(result.errors).toBeInstanceOf(Array);
    expect(result.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });
});

describe('Config type', () => {
  it('should have correct shape', () => {
    const config: Config = {
      version: 1,
      columns: [
        { name: 'Backlog' },
        { name: 'To Do' },
        { name: 'In Progress' },
        { name: 'Review' },
        { name: 'Done' },
      ],
      filePatterns: {
        include: ['**/*.ts', '**/*.md'],
        exclude: ['node_modules/**', 'dist/**'],
      },
      statusMapping: {
        'TODO': 'todo',
        'FIXME': 'review',
      },
    };

    expect(config.version).toBe(1);
    expect(config.columns).toHaveLength(5);
    expect(config.filePatterns.include).toContain('**/*.ts');
    expect(config.filePatterns.exclude).toContain('node_modules/**');
    expect(config.statusMapping['TODO']).toBe('todo');
  });
});

describe('ScanError type', () => {
  it('should have correct shape', () => {
    const error: ScanError = {
      code: 'PARSE_ERROR',
      message: 'Failed to parse file',
      file: 'src/broken.ts',
      line: 42,
    };

    expect(error.code).toBe('PARSE_ERROR');
    expect(error.message).toBe('Failed to parse file');
    expect(error.file).toBe('src/broken.ts');
    expect(error.line).toBe(42);
  });
});

describe('TaskStatus enum', () => {
  it('should have exactly 5 valid values', () => {
    const validStatuses: TaskStatus[] = [
      'backlog',
      'todo',
      'in-progress',
      'review',
      'done',
    ];

    expect(validStatuses).toHaveLength(5);
    expect(validStatuses).toContain('backlog');
    expect(validStatuses).toContain('todo');
    expect(validStatuses).toContain('in-progress');
    expect(validStatuses).toContain('review');
    expect(validStatuses).toContain('done');
  });
});
