# CLAUDE.md — FlowScan Project Guide

> This file provides project context and workflow guidance for AI assistants working on FlowScan.

## Project Overview

**FlowScan** is an open-source tool that scans a repository (code comments, Markdown plans, Git issues) and visualizes tasks as an interactive Kanban board. Accessible via VS Code extension, local web server, and CLI for AI agents.

**Value proposition:** "No more context switching. Repo kamu sendiri yang jadi single source of truth untuk project tracking."

**Repository:** https://github.com/ajamj/flowscan.git
**GitHub username:** ajamj
**License:** MIT (recommended)

## Project Structure

```
flowscan/
├── .planning/           # GSD workflow artifacts
│   ├── PROJECT.md       # Project context and requirements
│   ├── config.json      # Workflow configuration
│   ├── REQUIREMENTS.md  # Scoped requirements
│   ├── ROADMAP.md       # Phase structure
│   ├── STATE.md         # Project memory
│   └── research/        # Domain research
├── packages/            # (Future monorepo structure)
│   ├── core/            # Parser engine + task model
│   ├── web/             # React Kanban component
│   ├── cli/             # CLI + local server
│   └── vscode/          # VS Code extension
└── .flowscan/           # User config directory (gitignored)
```

## GSD Workflow

This project uses the **Get Shit Done (GSD)** workflow with the following configuration:

- **Mode:** YOLO (auto-approve)
- **Granularity:** Standard
- **Parallelization:** Enabled
- **Commit docs:** Yes
- **Research:** Enabled
- **Plan check:** Enabled
- **Verifier:** Enabled

### Workflow Commands

| Command | Description |
|---------|-------------|
| `/gsd:plan-phase N` | Plan phase N execution |
| `/gsd:discuss-phase N` | Discuss phase N approach |
| `/gsd:ui-phase N` | Generate UI design for phase N |
| `/gsd:new-milestone` | Create new milestone |
| `/metaswarm:create-issue` | Create GitHub issue |

### Rules

1. **Design review gate** — Always run plan/design review before executing any plan
2. **No push before review** — Don't push to main before code review passes
3. **One issue per PR** — Each PR addresses a single GitHub issue
4. **Tests must pass** — All tests must pass before creating PR

## Tech Stack

- **Language:** TypeScript 5.x
- **Monorepo:** Turborepo (simple setup, no separate publishing)
- **Runtime:** Node.js 20+
- **Parsing:** regex (MVP) → tree-sitter (Phase 2+), remark/mdast for Markdown
- **UI:** React 18 + Tailwind + shadcn/ui + dnd-kit
- **Server:** Hono (preferred) or Express 4.x + ws (WebSocket)
- **File watching:** chokidar 4.x
- **Build:** Vite + esbuild

## Architecture

```
@flowscan/core (ParserEngine, StatusMapper, FilePersister, FileWatcher, TaskModel)
    ↓
@flowscan/web (KanbanBoard React component with dnd-kit)
    ↓
@flowscan/cli (CLI commands + HTTP/WebSocket server)
@flowscan/vscode (VS Code extension with WebView)
```

## Security Requirements

1. Server binds to `127.0.0.1` only — never `0.0.0.0`
2. All file operations validated within workspace root (path traversal prevention)
3. Symlink resolution before any file operation
4. UTF-8 encoding enforcement
5. Git auto-commit OFF by default
6. `.flowscan/cache.json` gitignored by default
7. All dependency versions pinned (no `latest`)
8. `npm audit` in CI

## Key Decisions

| Decision | Outcome |
|----------|---------|
| Monorepo from Day 1 (simple Turborepo) | Yes — boundary discipline without publishing complexity |
| Regex-only parsing for MVP | Yes — tree-sitter deferred to Phase 2+ |
| Content-based task IDs (not line-based) | Yes — hash(relativePath + contentHash) for stability |
| Local-first, no cloud | Hard constraint |

## Next Action

Run `/gsd:plan-phase 1` to begin planning Phase 1: Parser Core.

---
*Last updated: 2026-04-13*
