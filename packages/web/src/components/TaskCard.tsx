import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';

export interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors: Record<string, string> = {
    'low': 'bg-gray-100 text-gray-600',
    'medium': 'bg-blue-100 text-blue-700',
    'high': 'bg-orange-100 text-orange-700',
    'critical': 'bg-red-100 text-red-700',
  };

  const langColors: Record<string, string> = {
    typescript: 'bg-blue-500',
    javascript: 'bg-yellow-500',
    python: 'bg-green-500',
    go: 'bg-cyan-500',
    rust: 'bg-orange-500',
    markdown: 'bg-gray-500',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-md p-3 cursor-pointer hover:shadow-md transition-shadow group"
      onClick={() => onClick(task)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0" {...attributes} {...listeners}>
          <p className="text-sm font-medium text-gray-800 truncate">
            {task.title}
          </p>
          {task.description && task.description !== task.title && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <div
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {/* File link */}
        <span className="text-xs text-gray-400 font-mono">
          {task.file}:{task.line}
        </span>

        {/* Language badge */}
        {task.language && (
          <span className={`text-xs text-white px-1.5 py-0.5 rounded ${langColors[task.language] ?? 'bg-gray-400'}`}>
            {task.language.slice(0, 2).toUpperCase()}
          </span>
        )}

        {/* Priority badge */}
        {task.metadata.priority && (
          <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColors[task.metadata.priority]}`}>
            {task.metadata.priority}
          </span>
        )}

        {/* Labels */}
        {task.metadata.labels?.map((label) => (
          <span key={label} className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default TaskCard;
