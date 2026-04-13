# Roadmap: FlowScan

**Created:** 2026-04-13
**Strategy:** Core-first — build the parsing engine and task model before any UI or distribution layer.

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Parser Core | Build task extraction engine with regex-based parsing + config system | SCAN-01, SCAN-02, SCAN-03, SCAN-04, CONFIG-01, CONFIG-02 | 4 |
| 2 | Kanban UI | Build interactive Kanban board with drag-and-drop | KANBAN-01, KANBAN-02, KANBAN-03, KANBAN-04, KANBAN-05, KANBAN-06 | 6 |
| 3 | Distribution (VS Code + CLI) | Package as VS Code extension and CLI with local server | VSCODE-01, VSCODE-02, VSCODE-03, CLI-01, CLI-02, CLI-03 | 6 |
| 4 | AI Agent API + Real-Time | Expose API for AI agents + file watcher for auto-refresh | API-01, API-02, API-03, API-04, WATCH-01, WATCH-02, SCAN-05 | 7 |

## Phase Details

### Phase 1: Parser Core

**GitHub Issue:** #1 — https://github.com/ajamj/flowscan/issues/1

**Goal:** Build @flowscan/core — the task extraction engine that scans repository files and builds a structured task model.

**Requirements:** SCAN-01, SCAN-02, SCAN-03, SCAN-04, CONFIG-01, CONFIG-02

**Success Criteria:**
1. Running `scan()` on a workspace with TODO/FIXME comments returns structured Task[] objects with file path, line number, content, and inferred status
2. Running `scan()` on Markdown files with task lists (- [ ], - [x]) correctly extracts tasks with status mapping
3. Status inference correctly maps common patterns: TODO → To Do, FIXME → Review, [x] → Done, [ ] → To Do
4. Scan completes for a workspace with 500 files in under 5 seconds
5. System reads .flowscan/config.yaml for custom columns, file include/exclude patterns, and creates default config on first run

**Key Design Decisions:**
- Regex-based parsing for MVP (tree-sitter deferred to Phase 2+)
- Task model includes: id (file:line based), title, description, file, line, status, labels, priority, dueDate
- Config schema: columns[], filePatterns[], ignorePatterns[], statusMapping{}

---

### Phase 2: Kanban UI

**GitHub Issue:** #2 — https://github.com/ajamj/flowscan/issues/2

**Goal:** Build @flowscan/web — the React Kanban board component that renders tasks from core, with drag-and-drop that updates source files.

**Requirements:** KANBAN-01, KANBAN-02, KANBAN-03, KANBAN-04, KANBAN-05, KANBAN-06

**Success Criteria:**
1. Board renders with 5 default columns (Backlog | To Do | In Progress | Review | Done) populated with tasks from @flowscan/core
2. Each card displays title, description snippet (truncated to 100 chars), file:line link, label badges, priority indicator, and due date (if present)
3. Dragging a card from "To Do" to "In Progress" updates the source file comment and re-renders the board
4. Clicking a card's file:line link opens the file in the appropriate editor (VS Code API in extension, vscode:// URL in web)
5. Board renders in under 2 seconds for a workspace with 200 tasks
6. Custom columns defined in .flowscan/config.yaml are reflected in the UI

**Key Design Decisions:**
- dnd-kit for drag-and-drop (lighter, more flexible than react-beautiful-dnd)
- Shared component: same React component used in VS Code WebView and local web server
- Atomic file writes for DnD updates (write to temp, rename)

---

### Phase 3: Distribution (VS Code + CLI)

**GitHub Issue:** #3 — https://github.com/ajamj/flowscan/issues/3

**Goal:** Package FlowScan as a VS Code extension and standalone CLI with local web server.

**Requirements:** VSCODE-01, VSCODE-02, VSCODE-03, CLI-01, CLI-02, CLI-03

**Success Criteria:**
1. VS Code extension shows Kanban board in a sidebar WebView panel
2. Extension auto-scans workspace on open and refreshes board
3. Command palette shows "FlowScan: Open Board" command that opens/focuses the board panel
4. CLI `flowscan scan` command prints task summary to terminal
5. CLI `flowscan serve` starts HTTP server at http://localhost:5173 with full Kanban board
6. Local web server serves the same UI as VS Code WebView (shared @flowscan/web component)

**Key Design Decisions:**
- VS Code extension uses WebView panel (not editor) for sidebar placement
- CLI built with commander.js for command parsing
- Local server uses Express to serve static web UI + API endpoints
- Single npm package for CLI: `npm install -g flowscan`

---

### Phase 4: AI Agent API + Real-Time

**GitHub Issue:** #4 — https://github.com/ajamj/flowscan/issues/4

**Goal:** Expose REST API for AI agent integration + implement file watcher for real-time board updates.

**Requirements:** API-01, API-02, API-03, API-04, WATCH-01, WATCH-02, SCAN-05

**Success Criteria:**
1. GET /api/v1/kanban returns JSON representation of current board state
2. POST /api/v1/tasks/:id/status with `{ status: "in-progress" }` updates the task in source file and returns 200
3. CLI commands `flowscan status` and `flowscan update-task` provide equivalent functionality to HTTP API
4. API documentation (OpenAPI spec + README) published for integrating with Claude Code, Gemini CLI, Qwen Code
5. File watcher detects file changes and auto-refreshes Kanban board without manual trigger
6. File watcher works correctly on Windows, macOS, and Linux (tested on all three)
7. At least 5 languages supported for code comment parsing: TypeScript, JavaScript, Python, Go, Rust

**Key Design Decisions:**
- API versioned from start (/api/v1/)
- Task IDs are stable across scans (derived from file:line hash)
- WebSocket for real-time push to connected clients (browser tabs, VS Code WebView)
- chokidar with debounce (300ms) for file watching

---

## Dependencies Between Phases

```
Phase 1 (Parser Core)
    ↓
Phase 2 (Kanban UI) — depends on Phase 1 task model
    ↓
Phase 3 (Distribution) — depends on Phase 1 + 2
    ↓
Phase 4 (API + Real-Time) — depends on Phase 3 server
```

**Parallelism:** Phase 2 UI work can begin once Phase 1 task model types are defined (mock data for development). Phase 3 CLI scaffolding can begin alongside Phase 2.

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Regex parsing too noisy | Start with strict patterns, add ignore file, defer tree-sitter |
| VS Code WebView bundle too large | Lazy-load, tree-shake, test bundle size early |
| File conflicts on DnD | Atomic writes, dirty file detection |
| Cross-platform file watching | chokidar tested on all 3 OSes in Phase 4 |

---
*Roadmap created: 2026-04-13*
*Last updated: 2026-04-13 after initial definition*
