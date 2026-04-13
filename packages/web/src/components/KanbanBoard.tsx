import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import type { Task, ColumnConfig } from '../types';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';

export interface KanbanBoardProps {
  tasks: Task[];
  columns?: ColumnConfig[];
  onTaskMove: (taskId: string, newStatus: Task['status']) => Promise<void> | void;
  onTaskClick: (task: Task) => void;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { name: 'Backlog', status: 'backlog' },
  { name: 'To Do', status: 'todo' },
  { name: 'In Progress', status: 'in-progress' },
  { name: 'Review', status: 'review' },
  { name: 'Done', status: 'done' },
];

const STATUS_TO_COLUMN: Record<Task['status'], string> = {
  'backlog': 'Backlog',
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'review': 'Review',
  'done': 'Done',
};

function KanbanBoard({ tasks, columns = DEFAULT_COLUMNS, onTaskMove, onTaskClick }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    for (const col of columns) {
      grouped[col.name] = [];
    }
    for (const task of tasks) {
      const colName = STATUS_TO_COLUMN[task.status] ?? 'To Do';
      if (!grouped[colName]) {
        grouped[colName] = [];
      }
      grouped[colName].push(task);
    }
    return grouped;
  }, [tasks, columns]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id.toString());
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id.toString();
    const newStatus = (over.data?.current?.status as Task['status']) ??
                      (over.id.toString().toLowerCase().replace(' ', '-') as Task['status']) ??
                      'todo';

    // Map column name back to status
    const statusMap: Record<string, Task['status']> = {
      'Backlog': 'backlog',
      'To Do': 'todo',
      'In Progress': 'in-progress',
      'Review': 'review',
      'Done': 'done',
    };
    const mappedStatus = statusMap[over.id.toString()] ?? newStatus;

    await onTaskMove(taskId, mappedStatus);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const columnTasks = tasksByColumn[col.name] ?? [];
          return (
            <KanbanColumn
              key={col.name}
              name={col.name}
              tasks={columnTasks}
              status={col.status ?? 'todo'}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default KanbanBoard;
