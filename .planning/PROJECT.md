# FlowScan

## What This Is

FlowScan is an extension/project management tool that automatically scans a repository (code comments, Markdown plans, Git issues) and visualizes them as an interactive Kanban board. It can be accessed via VS Code/Antigravity or a local web server, and can also be installed as a plugin/CLI in AI coding tools (Claude Code, Gemini CLI, Qwen Code, Continue.dev, Aider, etc.).

## Core Value

"No more context switching. Repo kamu sendiri yang jadi single source of truth untuk project tracking." — Your repo itself becomes the project tracker, zero setup.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **SCAN-01**: Auto-scan TODO/FIXME/HACK/NOTE comments from code files across multiple languages
- [ ] **SCAN-02**: Auto-scan Markdown task lists (TODO.md, ROADMAP.md, PLAN.md, checklists, sections like # Backlog, # In Progress)
- [ ] **SCAN-03**: Auto-infer task status from comment syntax (TODO → To Do, [x] → Done, etc.)
- [ ] **KANBAN-01**: Render interactive Kanban board with default columns (Backlog | To Do | In Progress | Review | Done)
- [ ] **KANBAN-02**: Card display with title, description snippet, file:line link, label, priority, due date (if present)
- [ ] **KANBAN-03**: Drag-and-drop to update task status in source file (Git-friendly)
- [ ] **KANBAN-04**: Click card to open file in editor at the correct line
- [ ] **VSCODE-01**: VS Code extension with sidebar WebView for Kanban board
- [ ] **CLI-01**: CLI command `flowscan serve` to run local web server with Kanban board
- [ ] **API-01**: REST/CLI API for AI agents (get_kanban_status, update_task, add_task_from_comment)
- [ ] **WATCH-01**: File watcher for real-time auto-refresh when files change
- [ ] **CONFIG-01**: Configurable columns and settings via .flowscan/config.yaml

### Out of Scope

- Full Jira/Trello sync — Deferred to Phase 2
- Multi-user real-time collaboration — Deferred to Phase 2
- GitHub/GitLab issue sync — Deferred to Phase 2
- LLM-powered task inference — Deferred to Phase 3
- Multi-repo support — Deferred to Phase 3
- Export to JSON/CSV/PDF — Nice-to-have, deferred
- VS Code notifications for overdue tasks — Nice-to-have, deferred

## Context

Target users:
- Solo developer / indie hacker
- AI agent users (Claude/Gemini/Qwen working alongside repo)
- Small teams using GitOps (tasks stored in repo, not external tools)

Success metrics (MVP):
- 80% of tasks detected automatically from repo
- < 2 seconds to render Kanban after scan
- Minimal 3 platform support (VS Code, Antigravity, CLI AI agents)

This is an open-source project. Repository: https://github.com/ajamj/flowscan.git

Technical approach:
- TypeScript monorepo with Turborepo
- React + Tailwind + shadcn/ui + dnd-kit for UI
- tree-sitter for code parsing, remark for Markdown
- chokidar for file watching
- Express + WebSocket for local server

## Constraints

- **Tech Stack**: TypeScript, React, Node.js — Ecosystem chosen for VS Code extension support and web UI maturity
- **Performance**: < 2 second render time after scan — Critical for UX
- **Privacy**: Local-first, no data leaves machine — Core to value proposition
- **Open Source**: MIT or Apache 2.0 license — Project must be community-friendly

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| TypeScript monorepo (Turborepo) | Shared core between VS Code extension, CLI, and web UI | — Pending |
| Regex + tree-sitter for code parsing | Balance simplicity (regex) with multi-language accuracy (tree-sitter) | — Pending |
| Git-friendly task storage | All tasks live in repo files; drag-drop updates source, not external DB | — Pending |
| Local-first architecture | No cloud dependency; privacy is a feature | — Pending |
| AI agent API via CLI/HTTP | Enables Claude Code, Gemini CLI, Qwen integration | — Pending |
| .flowscan/ config directory | Standard config location, gitignored for sensitive data | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-13 after initialization*
