# Requirements: FlowScan

**Defined:** 2026-04-13
**Core Value:** "No more context switching. Repo kamu sendiri yang jadi single source of truth untuk project tracking."

## v1 Requirements

Requirements for MVP release. Each maps to roadmap phases.

### Scanning

- [ ] **SCAN-01**: System scans all files in workspace and extracts TODO/FIXME/HACK/NOTE comments from code files
- [ ] **SCAN-02**: System scans Markdown files and extracts task lists (- [ ], - [x]) and section-based tasks (# Backlog, # In Progress)
- [ ] **SCAN-03**: System infers task status from comment syntax (e.g., TODO → To Do, [x] → Done, FIXME → Review)
- [ ] **SCAN-04**: Scan completes for a medium workspace (<500 files) in under 5 seconds
- [ ] **SCAN-05**: System supports at minimum: TypeScript, JavaScript, Python, Go, Rust code comment parsing (regex-based for MVP)

### Kanban Board

- [ ] **KANBAN-01**: System renders interactive Kanban board with default columns: Backlog | To Do | In Progress | Review | Done
- [ ] **KANBAN-02**: Each card displays: title, description snippet, file:line link, label, priority, due date (if present in comment)
- [ ] **KANBAN-03**: User can drag a card from one column to another and the source file is updated accordingly
- [ ] **KANBAN-04**: User can click a card to open the source file in their editor at the correct line
- [ ] **KANBAN-05**: Columns are configurable via .flowscan/config.yaml
- [ ] **KANBAN-06**: Board renders in under 2 seconds after scan completes

### VS Code Extension

- [ ] **VSCODE-01**: Extension provides a sidebar WebView displaying the Kanban board
- [ ] **VSCODE-02**: Extension auto-scans workspace on open
- [ ] **VSCODE-03**: Extension provides command palette command "FlowScan: Open Board"

### CLI & Local Server

- [ ] **CLI-01**: CLI command `flowscan scan` runs a scan and outputs task list to terminal
- [ ] **CLI-02**: CLI command `flowscan serve` starts a local web server with Kanban board accessible at http://localhost:5173
- [ ] **CLI-03**: Local server serves a fully functional Kanban board (same UI as VS Code WebView)

### AI Agent API

- [ ] **API-01**: Local server exposes GET /api/v1/kanban returning JSON board state
- [ ] **API-02**: Local server exposes POST /api/v1/tasks/:id/status to update task status
- [ ] **API-03**: CLI provides equivalent commands for AI agent integration (flowscan status, flowscan update-task)
- [ ] **API-04**: API documentation provided for integrating with Claude Code, Gemini CLI, Qwen Code

### Real-Time Updates

- [ ] **WATCH-01**: File watcher detects changes to source files and auto-refreshes the Kanban board
- [ ] **WATCH-02**: File watcher works on Windows, macOS, and Linux

### Configuration

- [ ] **CONFIG-01**: System reads .flowscan/config.yaml for custom columns, file patterns, and ignore rules
- [ ] **CONFIG-02**: System creates default .flowscan/config.yaml on first run if not present

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Parsing

- **PARSE-01**: Tree-sitter-based parsing for multi-language comment extraction (beyond regex)
- **PARSE-02**: LLM-powered task inference for ambiguous comments
- **PARSE-03**: Extract tasks from PR descriptions and commit messages

### External Integration

- **SYNC-01**: GitHub Issues sync (bidirectional)
- **SYNC-02**: GitLab Issues sync (bidirectional)
- **SYNC-03**: Jira sync (one-way, read-only)

### Analytics

- **ANALYTICS-01**: Progress percentage dashboard
- **ANALYTICS-02**: Burndown chart
- **ANALYTICS-03**: Velocity tracking (tasks completed/week)

### Collaboration

- **COLLAB-01**: Multi-user real-time collaboration via WebSocket
- **COLLAB-02**: Multi-repo workspace support

### Export

- **EXPORT-01**: Export board to JSON, CSV, PDF, or Markdown summary

### Notifications

- **NOTIF-01**: VS Code notification for overdue tasks or new tasks detected

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Cloud-hosted service | Breaks local-first privacy promise |
| Mobile app | Target users are developers in IDEs |
| Full Jira/Trello replacement | FlowScan complements, not replaces, external tools |
| Rich text editing in cards | Cards are references, not editors; complexity vs value |
| Multi-user auth for local server | Out of scope; local server is trusted local network only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCAN-01 | Phase 1 | Pending |
| SCAN-02 | Phase 1 | Pending |
| SCAN-03 | Phase 1 | Pending |
| SCAN-04 | Phase 1 | Pending |
| SCAN-05 | Phase 1 | Pending |
| KANBAN-01 | Phase 2 | Pending |
| KANBAN-02 | Phase 2 | Pending |
| KANBAN-03 | Phase 2 | Pending |
| KANBAN-04 | Phase 2 | Pending |
| KANBAN-05 | Phase 2 | Pending |
| KANBAN-06 | Phase 2 | Pending |
| VSCODE-01 | Phase 3 | Pending |
| VSCODE-02 | Phase 3 | Pending |
| VSCODE-03 | Phase 3 | Pending |
| CLI-01 | Phase 3 | Pending |
| CLI-02 | Phase 3 | Pending |
| CLI-03 | Phase 3 | Pending |
| API-01 | Phase 4 | Pending |
| API-02 | Phase 4 | Pending |
| API-03 | Phase 4 | Pending |
| API-04 | Phase 4 | Pending |
| WATCH-01 | Phase 4 | Pending |
| WATCH-02 | Phase 4 | Pending |
| CONFIG-01 | Phase 1 | Pending |
| CONFIG-02 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-13*
*Last updated: 2026-04-13 after initial definition*
