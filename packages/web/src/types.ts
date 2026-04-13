export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

export interface TaskMetadata {
  labels?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  assignee?: string;
  [key: string]: unknown;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  file: string;
  line: number;
  column: number;
  status: TaskStatus;
  language: string;
  rawContent: string;
  metadata: TaskMetadata;
}

export interface ColumnConfig {
  name: string;
  status?: TaskStatus;
}

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { name: 'Backlog', status: 'backlog' },
  { name: 'To Do', status: 'todo' },
  { name: 'In Progress', status: 'in-progress' },
  { name: 'Review', status: 'review' },
  { name: 'Done', status: 'done' },
];
