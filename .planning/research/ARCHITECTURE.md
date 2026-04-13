# Research: Architecture for Repository-Based Kanban Systems

## Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface Layer                  │
├──────────────┬──────────────┬──────────────┬─────────────┤
│ VS Code Ext  │  Antigravity │  Local Web   │  AI Agent   │
│ (WebView)    │  (WebView)   │  Server      │  CLI/API    │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬──────┘
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                          │
              ┌───────────▼───────────┐
              │   @flowscan/core       │
              │                        │
              │  ┌──────────────────┐  │
              │  │  Parser Engine   │  │
              │  │  (tree-sitter +  │  │
              │  │   remark + regex)│  │
              │  └────────┬─────────┘  │
              │           │            │
              │  ┌────────▼─────────┐  │
              │  │  Kanban Engine   │  │
              │  │  (task model,    │  │
              │  │   status map,    │  │
              │  │   DnD logic)     │  │
              │  └────────┬─────────┘  │
              │           │            │
              │  ┌────────▼─────────┐  │
              │  │  File Watcher &  │  │
              │  │  Persister       │  │
              │  └──────────────────┘  │
              └───────────┬───────────┘
                          │
              ┌───────────▼───────────┐
              │     File System        │
              │  (repo files + cache)  │
              └───────────────────────┘
```

## Component Boundaries

### @flowscan/core
- **Responsibility:** Parse repository files, build task model, manage Kanban state
- **Exports:** Task[] type, parseWorkspace(), KanbanEngine class, FileWatcher class
- **Dependencies:** tree-sitter, remark, chokidar
- **Boundary:** Pure library, no UI, no server — just data transformation

### @flowscan/web
- **Responsibility:** React Kanban board UI with drag-and-drop
- **Exports:** KanbanBoard React component
- **Dependencies:** React, dnd-kit, Tailwind, @flowscan/core (types)
- **Boundary:** Reusable in VS Code WebView and local web server

### @flowscan/cli
- **Responsibility:** CLI entry point + local HTTP/WebSocket server
- **Exports:** `flowscan` CLI commands (scan, serve, status)
- **Dependencies:** commander, express, ws, @flowscan/core, @flowscan/web (served statically)
- **Boundary:** Server process, no VS Code dependencies

### @flowscan/vscode
- **Responsibility:** VS Code extension wrapping @flowscan/web in WebView
- **Exports:** VS Code extension (activity bar panel, command palette)
- **Dependencies:** vscode extension API, @flowscan/core, @flowscan/web
- **Boundary:** VS Code specific glue code only

## Data Flow

### Scan Flow
```
User opens workspace
    → Extension/CLI triggers auto-scan
    → @flowscan/core walks file tree
    → Parser extracts tasks from code comments + MD files
    → Tasks cached in .flowscan/cache.json
    → KanbanEngine builds board state
    → UI renders (WebView or browser)
```

### Update Flow (Drag-and-Drop)
```
User drags card from "To Do" → "In Progress"
    → dnd-kit captures drop event
    → KanbanEngine maps new status
    → File Persister updates source file comment
    → Git stage + optional commit
    → File watcher detects change
    → Re-render (incremental, only changed card)
```

### AI Agent Flow
```
AI agent calls: GET /api/kanban
    → @flowscan/core returns JSON board state
AI agent calls: POST /api/tasks/:id/status
    → { status: "in-progress" }
    → KanbanEngine updates
    → File Persister writes to source
    → Returns 200 OK
```

## Suggested Build Order

1. **@flowscan/core** — Parser + task model (foundation for everything)
2. **@flowscan/web** — Kanban React component (visualizes core output)
3. **@flowscan/cli** — CLI wrapper (core + web server)
4. **@flowscan/vscode** — VS Code extension (core + WebView)
5. **AI Agent API** — HTTP endpoints on CLI server
6. **File watcher** — Real-time updates

## Key Architectural Decisions

- **Shared UI:** @flowscan/web is used by BOTH VS Code WebView and local server — single codebase
- **Thin adapters:** VS Code and CLI are thin wrappers around core + web
- **Git as storage:** No database; source files are the database
- **Incremental parsing:** Only re-parse changed files on file watcher events
