# Research: Stack for Project Management / Kanban Tools

## Recommended Stack

### Core Language & Framework

| Technology | Version | Rationale | Confidence |
|------------|---------|-----------|------------|
| **TypeScript** | 5.x | Type safety critical for shared core (VS Code extension, CLI, web UI). VS Code extensions require TS/JS. | High |
| **Turborepo** | 2.x | Monorepo orchestration for @flowscan/core, @flowscan/vscode, @flowscan/cli, @flowscan/web. Better than Nx for this scale. | High |
| **Node.js** | 20+ LTS | Runtime for CLI and server. Required for VS Code extension. | High |

### Parsing Layer

| Technology | Version | Rationale | Confidence |
|------------|---------|-----------|------------|
| **tree-sitter** | latest | Multi-language code parsing (Python, Rust, Go, JS, etc.). Far superior to regex for complex comment structures. WASM bindings available for browser/Node. | High |
| **remark + mdast** | latest | Best Markdown AST for parsing GitHub-flavored task lists (- [ ], - [x]). Handles nested checklists, sections. | High |
| **regex fallback** | — | Simple TODO/FIXME patterns for languages where tree-sitter overhead isn't justified. Fast path for common cases. | High |

**NOT recommended:**
- **AST parsers per language** — Too much maintenance overhead vs tree-sitter's unified API
- **Pure regex parsing** — Fragile across languages, misses nested structures

### UI Layer

| Technology | Version | Rationale | Confidence |
|------------|---------|-----------|------------|
| **React** | 18+ | VS Code WebView uses standard web tech. React ecosystem is mature for Kanban patterns. | High |
| **Tailwind CSS** | 3.x | Utility-first CSS, works well in VS Code WebView (no external CSS files needed). | High |
| **shadcn/ui** | latest | Accessible, copy-paste components (no runtime dependency). Perfect for WebView bundle constraints. | High |
| **dnd-kit** | latest | Lightweight drag-and-drop for React. Better than react-beautiful-dnd for custom drop targets (Kanban columns). | High |

**NOT recommended:**
- **react-beautiful-dnd** — Abandoned, performance issues with large boards
- **Vue/Svelte** — Less ecosystem maturity for VS Code WebView patterns

### File System & Persistence

| Technology | Version | Rationale | Confidence |
|------------|---------|-----------|------------|
| **chokidar** | 4.x | Industry standard for file watching. Handles cross-platform edge cases (Windows file locks, Mac FSEvents). | High |
| **simple-git** | latest | Git operations for commit creation, status checking. Lighter than isomorphic-git for Node.js context. | Medium |

### Local Server

| Technology | Version | Rationale | Confidence |
|------------|---------|-----------|------------|
| **Express** | 4.x | Mature, well-documented REST API. Sufficient for local server (no need for Koa/Hono). | High |
| **ws (WebSocket)** | latest | Real-time updates for connected clients (VS Code WebView + browser tabs). | High |
| **Vite** | 5.x | Dev server + build tool for web UI. Fast HMR, tree-shaking. | High |

**NOT recommended:**
- **Next.js** — Overkill for single-page Kanban; VS Code WebView doesn't support SSR anyway
- **Fastify** — Unnecessary complexity for local-only server

### Packaging & Distribution

| Technology | Version | Rationale | Confidence |
|------------|---------|-----------|------------|
| **vsce** | latest | Official VS Code extension packaging tool | High |
| **npm** | latest | CLI distribution via `npm install -g flowscan` | High |
| **esbuild** | latest | Fast bundling for CLI and web. Better than webpack for this use case. | High |

### AI Agent Integration

| Technology | Version | Rationale | Confidence |
|------------|---------|-----------|------------|
| **MCP (Model Context Protocol)** | latest | Standard for AI tool integration. Claude Code, Cursor support it natively. | Medium |
| **OpenAI-compatible function calling** | — | Works with any LLM provider (Claude, Gemini, local Ollama). | High |

### Storage

| Technology | Version | Rationale | Confidence |
|------------|---------|-----------|------------|
| **Git-friendly Markdown files** | — | Primary storage. Tasks live in source files. No external DB needed. | High |
| **.flowscan/cache.json** | — | Optional cache for scan results. Speeds up re-render. Should be gitignored or committed based on user preference. | Medium |

## Build Order Implications

1. **@flowscan/core** first (parsing + task model) — everything depends on this
2. **@flowscan/web** second (Kanban UI) — needs core for data
3. **@flowscan/cli** third (wraps core + web server)
4. **@flowscan/vscode** fourth (wraps core + web in WebView)

## Dependencies Between Components

```
@flowscan/core (no deps)
    ↓
@flowscan/web (depends on core)
    ↓
@flowscan/cli (depends on core + web)
@flowscan/vscode (depends on core + web)
```
