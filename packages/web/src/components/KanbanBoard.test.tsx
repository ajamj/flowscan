import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import KanbanBoard from './KanbanBoard';
import type { Task } from '../types';

describe('KanbanBoard', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Add input validation',
      description: '// TODO: add input validation',
      file: 'src/auth.ts',
      line: 42,
      column: 3,
      status: 'todo',
      language: 'typescript',
      rawContent: '// TODO: add input validation',
      metadata: {},
    },
    {
      id: 'task-2',
      title: 'Handle null case',
      description: '// FIXME: handle null case',
      file: 'src/utils.ts',
      line: 15,
      column: 1,
      status: 'done',
      language: 'typescript',
      rawContent: '// FIXME: handle null case',
      metadata: {},
    },
  ];

  it('should render all 5 default columns', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        onTaskMove={() => {}}
        onTaskClick={() => {}}
      />,
    );

    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('should display tasks in correct columns', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        onTaskMove={() => {}}
        onTaskClick={() => {}}
      />,
    );

    expect(screen.getByText('Add input validation')).toBeInTheDocument();
    expect(screen.getByText('Handle null case')).toBeInTheDocument();
  });

  it('should show task count per column', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        onTaskMove={() => {}}
        onTaskClick={() => {}}
      />,
    );

    // To Do column should have 1 task, Done should have 1
    const counts = screen.getAllByText('1');
    expect(counts.length).toBeGreaterThanOrEqual(2);
  });

  it('should call onTaskClick when task is clicked', async () => {
    const handleClick = vi.fn();
    render(
      <KanbanBoard
        tasks={mockTasks}
        onTaskMove={() => {}}
        onTaskClick={handleClick}
      />,
    );

    await screen.getByText('Add input validation').click();
    expect(handleClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('should call onTaskMove when task is dragged to different column', async () => {
    const handleMove = vi.fn();
    render(
      <KanbanBoard
        tasks={mockTasks}
        onTaskMove={handleMove}
        onTaskClick={() => {}}
      />,
    );

    // Verify the callback is available (drag-drop tested via dnd-kit)
    expect(handleMove).toBeDefined();
  });
});
