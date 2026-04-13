# Research Summary: FlowScan

## Stack Recommendations

**Core:** TypeScript 5.x + Turborepo monorepo + Node.js 20+
**Parsing:** tree-sitter (multi-language) + remark/mdast (Markdown) + regex (fallback)
**UI:** React 18 + Tailwind + shadcn/ui + dnd-kit
**Server:** Express + ws (WebSocket) + Vite (dev/build)
**File watching:** chokidar 4.x
**Packaging:** vsce (VS Code), npm (CLI), esbuild (bundling)
**AI Integration:** MCP + OpenAI-compatible function calling

**Key decision:** Start with single package, split into monorepo when 2+ consumers exist. Don't over-engineer workspace structure before core works.

## Table Stakes Features

1. Auto-scan code comments (TODO/FIXME/HACK/NOTE)
2. Auto-scan Markdown task lists
3. Status inference from comment syntax
4. Kanban board with columns + cards
5. Drag-and-drop to update source files
6. Click card → open file at line
7. File watcher for auto-refresh
8. Custom columns via config

## Architecture

**4 packages (thin adapters around shared core):**
- @flowscan/core — Parser + task model + Kanban engine
- @flowscan/web — React Kanban component (shared between VS Code + web server)
- @flowscan/cli — CLI + local HTTP/WebSocket server
- @flowscan/vscode — VS Code extension (WebView wrapper)

**Data flow:** Scan → Parse → Cache → Render → (Drag → Update → Re-scan)

## What to Watch Out For

| Risk | Mitigation |
|------|-----------|
| Over-parsing noise | Start regex-only, add tree-sitter later, provide ignore file |
| VS Code WebView bundle size | Lazy-load tree-sitter WASM, tree-shake with esbuild |
| File conflicts on DnD | Check file dirty state before write, atomic writes |
| Cross-platform file watching | Debounce events, test on all OSes early |
| Markdown ambiguity | Scan only specific directories, configurable patterns |
| API lock-in for AI agents | Design around LLM tool schemas from day 1 |
| Monorepo complexity | Start single package, split when needed |
| Ignoring existing tools | Study Agent Kanban, TODO.md Kanban issues |

## Recommended Build Order

1. **Core** (parser + task model) — Foundation
2. **Web** (Kanban React component) — Visualization
3. **CLI** (scan + serve commands) — Distribution
4. **VS Code extension** — IDE integration
5. **AI Agent API** — MCP/HTTP endpoints

## Confidence Level

**High confidence:** Stack choices (TypeScript, React, tree-sitter, dnd-kit) are well-established for this use case.
**Medium confidence:** AI agent API design (MCP is evolving, may need iteration).
**Low confidence:** Optimal monorepo structure (depends on growth trajectory).
