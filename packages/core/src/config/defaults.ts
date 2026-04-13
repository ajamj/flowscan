import type { Config, ColumnConfig, TaskStatus } from '../types.js';

/** Default configuration for FlowScan */
export function generateDefaultConfig(): Config {
  const columns: ColumnConfig[] = [
    { name: 'Backlog', patterns: ['NOTE'] },
    { name: 'To Do', patterns: ['TODO', '- \\[ \\]'] },
    { name: 'In Progress', patterns: ['HACK', 'WIP'] },
    { name: 'Review', patterns: ['FIXME', 'BUG'] },
    { name: 'Done', patterns: ['DONE', '- \\[x\\]'] },
  ];

  const statusMapping: Record<string, TaskStatus> = {
    'TODO': 'todo',
    'FIXME': 'review',
    'HACK': 'in-progress',
    'NOTE': 'backlog',
    'BUG': 'review',
    'DONE': 'done',
    '- [x]': 'done',
    '- [ ]': 'todo',
    '- [-]': 'backlog',
  };

  return {
    version: 1,
    columns,
    filePatterns: {
      include: [
        '**/*.{ts,tsx,js,jsx,mjs,cjs,py,pyw,go,rs,md,mdx}',
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '.git/**',
        '**/*.min.*',
        '**/*.bundle.*',
        '**/vendor/**',
      ],
    },
    statusMapping,
    ignorePatterns: [],
    cachePath: '.flowscan/cache.json',
  };
}
