# STATE.md — FlowScan Project Memory

**Last Updated:** 2026-04-13
**Project Phase:** Shipped via PRs ✅

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-13)

**Core value:** "No more context switching. Repo kamu sendiri yang jadi single source of truth untuk project tracking."

## Current State

- [x] Project initialized
- [x] Git repository created + pushed to https://github.com/ajamj/flowscan
- [x] Research completed (STACK, FEATURES, ARCHITECTURE, PITFALLS, SUMMARY)
- [x] REQUIREMENTS.md defined (25 v1 requirements)
- [x] ROADMAP.md created (4 phases)
- [x] Phase 1: Parser Core — ✅ **MERGED via PR #5**
- [x] Phase 2: Kanban UI — ✅ **MERGED via PR #6**
- [x] Phase 3: Distribution — ✅ **MERGED via PR #7**
- [x] Phase 4: AI Agent API + Real-Time — ✅ **MERGED via PR #8**

## Merged Pull Requests

| PR | Phase | Branch | Status |
|----|-------|--------|--------|
| [#5](https://github.com/ajamj/flowscan/pull/5) | Phase 1: Parser Core | feature/phase-1-parser-core | ✅ Merged |
| [#6](https://github.com/ajamj/flowscan/pull/6) | Phase 2: Kanban UI | feature/phase-2-kanban-ui | ✅ Merged |
| [#7](https://github.com/ajamj/flowscan/pull/7) | Phase 3: Distribution | feature/phase-3-distribution | ✅ Merged |
| [#8](https://github.com/ajamj/flowscan/pull/8) | Phase 4: AI Agent API | feature/phase-4-api-realtime | ✅ Merged |

## Phase Details

### Phase 1: Parser Core ✅
- **Package:** @flowscan/core
- **Features:** Regex parsing (TS/JS/Python/Go/Rust), Markdown parsing, config system, status mapper, file write-back, file watcher, CLI
- **Tests:** 42 passing

### Phase 2: Kanban UI ✅
- **Package:** @flowscan/web
- **Features:** React 18 + dnd-kit Kanban board, Tailwind CSS, Vite build
- **Tests:** 8 passing

### Phase 3: Distribution ✅
- **Packages:** @flowscan/cli, @flowscan/vscode
- **Features:** Express server, WebSocket, file write-back integration, VS Code extension scaffold, CI/CD via GitHub Actions

### Phase 4: AI Agent API + Real-Time ✅
- **Features:** WebSocket server at /ws, CLI commands (status, update-task, scan --watch), API documentation (docs/API.md), OpenAI function calling schema

## Phase Status

| Phase | Status | Tests | Progress |
|-------|--------|-------|----------|
| 1: Parser Core | ✓ | 42/42 | 100% |
| 2: Kanban UI | ✓ | 8/8 | 100% |
| 3: Distribution | ✓ | — | 100% |
| 4: AI Agent API | ✓ | 4/4 | 100% |
| **Total** | | **65 passing** | **100%** |

## GitHub Issues

| Issue | Phase | Status |
|-------|-------|--------|
| #1 | Phase 1: Parser Core | ✅ Closed |
| #2 | Phase 2: Kanban UI | ✅ Closed |
| #3 | Phase 3: Distribution | ✅ Closed |
| #4 | Phase 4: AI Agent API | ✅ Closed |

## Key Decisions Made

| Decision | Outcome |
|----------|---------|
| ESM module system | `.js` extension in imports for TypeScript |
| SHA-256 for task IDs | Deterministic content-based hashing |
| Atomic file writes | Write to temp file, rename for safety |
| CLI bin name | `flowscan` |
| Server binding | `127.0.0.1` only (security) |
| Monorepo structure | packages/core, web, cli, vscode |
| File watcher polling | Enabled on Windows for cross-platform |
| Git workflow | Feature branches → PRs → merge to main (no direct commits to main) |

## Quality Gates

- ✅ **Tests:** 65 passing across 11 test files
- ✅ **TypeScript:** Strict mode, zero errors
- ✅ **Build:** `vite build` succeeds for web, `tsc --noEmit` clean for all packages
- ✅ **CI/CD:** GitHub Actions configured (ubuntu, windows, macos × Node 20, 22)
- ✅ **Git:** No `--no-verify` commits, all work via PRs, all merged to main

---
*State initialized: 2026-04-13*
*Last updated: 2026-04-13 after all 4 PRs merged to main*
