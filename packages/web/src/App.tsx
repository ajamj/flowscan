import KanbanBoard from './components/KanbanBoard';

// Mock data for development
const mockTasks = [
  {
    id: 'task-1',
    title: 'Add input validation',
    description: 'TODO: add input validation',
    file: 'src/auth.ts',
    line: 42,
    column: 3,
    status: 'todo' as const,
    language: 'typescript',
    rawContent: '// TODO: add input validation',
    metadata: {},
  },
  {
    id: 'task-2',
    title: 'Handle null case',
    description: 'FIXME: handle null case',
    file: 'src/utils.ts',
    line: 15,
    column: 1,
    status: 'review' as const,
    language: 'typescript',
    rawContent: '// FIXME: handle null case',
    metadata: { priority: 'high' as const },
  },
  {
    id: 'task-3',
    title: 'Refactor database queries',
    description: 'TODO: refactor database queries',
    file: 'db/models.py',
    line: 100,
    column: 1,
    status: 'backlog' as const,
    language: 'python',
    rawContent: '# TODO: refactor database queries',
    metadata: {},
  },
  {
    id: 'task-4',
    title: 'Add error handling',
    description: 'HACK: bypass error handling for now',
    file: 'src/api.rs',
    line: 55,
    column: 5,
    status: 'in-progress' as const,
    language: 'rust',
    rawContent: '// HACK: bypass error handling for now',
    metadata: {},
  },
  {
    id: 'task-5',
    title: 'Initialize project',
    description: '- [x] Initialize project',
    file: 'PLAN.md',
    line: 10,
    column: 1,
    status: 'done' as const,
    language: 'markdown',
    rawContent: '- [x] Initialize project',
    metadata: {},
  },
];

function App() {
  return (
    <div className="min-h-screen p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">FlowScan</h1>
        <p className="text-sm text-gray-500">{mockTasks.length} tasks found</p>
      </header>
      <KanbanBoard
        tasks={mockTasks}
        onTaskMove={async (taskId, newStatus) => {
          console.log(`Move ${taskId} → ${newStatus}`);
        }}
        onTaskClick={(task) => {
          console.log(`Open ${task.file}:${task.line}`);
        }}
      />
    </div>
  );
}

export default App;
