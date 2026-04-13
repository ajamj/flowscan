import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Task } from '../types';
import TaskCard from './TaskCard';

export interface KanbanColumnProps {
  name: string;
  tasks: Task[];
  status: Task['status'];
  onTaskClick: (task: Task) => void;
}

function KanbanColumn({ name, tasks, status, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: name,
    data: { status },
  });

  const priorityColors: Record<string, string> = {
    'Backlog': 'border-gray-300',
    'To Do': 'border-blue-400',
    'In Progress': 'border-yellow-400',
    'Review': 'border-orange-400',
    'Done': 'border-green-400',
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 bg-white rounded-lg shadow-sm border-t-4 ${priorityColors[name] ?? 'border-gray-300'} flex flex-col max-h-[calc(100vh-12rem)]`}
      data-status={status}
    >
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700 text-sm">{name}</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center text-gray-300 text-sm py-8">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}

export default KanbanColumn;
