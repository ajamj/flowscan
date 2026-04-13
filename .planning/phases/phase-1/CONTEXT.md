# Phase 1: Parser Core — CONTEXT

## What We're Building

### Concrete Scope

Phase 1 delivers `@flowscan/core` — a task extraction engine that scans repository files and builds a structured task model. This is a pure data transformation library with no UI, no server, and no external dependencies beyond the parsing utilities.

**Core capabilities:**
- Scan code comments for task markers (TODO, FIXME, HACK, NOTE) across TypeScript, JavaScript, Python, Go, and Rust
- Parse Markdown task lists (checkboxes) in repository documentation
- Infer task status from comment syntax (e.g., `// TODO:` vs `// DONE:`)
- Scan 500 files in under 5 seconds
- Read configuration from `.flowscan/config.yaml`
- Create default configuration on first run

**Deliverables:**
- `ParserEngine` — regex-based comment extraction across supported languages
- `StatusMapper` — maps comment patterns to structured task statuses
- `FilePersister` — writes scan results to disk in a defined format
- `FileWatcher` (basic) — chokidar-based file watching with debounce
- `TaskModel` — TypeScript interfaces for parsed task data
- CLI entry point for running scans
- Default config generator

**Out of scope (deferred to later phases):**
- Tree-sitter parsing (Phase 2+)
- Kanban board UI
- Server/GQL API
- Multi-package monorepo complexity
- Advanced file watching (cross-platform edge cases deferred)

---

## Technical Approach

### Architecture

```
@flowscan/core
├── ParserEngine      — Regex-based extraction from file content
├── StatusMapper      — Comment pattern → task status mapping
├── FilePersister     — Write scan results to disk (JSON/SQLite TBD)
├── FileWatcher       — chokidar wrapper with debounce logic
├── TaskModel         — TypeScript interfaces (Task, ScanResult, etc.)
├── ConfigLoader      — .flowscan/config.yaml reader + default generator
└── CLI               — Entry point for `flowscan scan`
```

### Key Decisions

1. **Regex-first parsing**: Start with regex-based extraction for MVP. Tree-sitter is deferred to Phase 2+ when precision requirements outweigh complexity costs.

2. **Content-based task IDs**: Task IDs are generated as `hash(relativePath + contentHash)` to ensure deterministic, reproducible identification without external state.

3. **Turborepo monorepo**: TypeScript 5.x, Node.js 20+. Single-package start; split into multiple packages only when a clear need emerges (avoids premature monorepo complexity).

4. **Markdown parsing**: Use `remark`/`mdast` for structured Markdown task list extraction. Scan only specific directories (e.g., `docs/`, root `*.md`) to avoid noise from `node_modules/` and other irrelevant paths.

5. **File watching**: `chokidar` with debounce. Known cross-platform edge cases will be documented and tested on all target OSes before Phase 1 sign-off.

### Write-Back Format (TBD)

The FilePersister output format needs to be defined. Candidates:
- JSON files (simple, human-readable)
- SQLite database (queryable, scalable)
- Both (JSON for portability, SQLite for query performance)

This will be resolved during planning.

### Incremental Scan Design

To meet the SCAN-05 performance target (500 files < 5s), incremental scanning is required:
- Track file modification times or content hashes
- Only re-parse files that have changed since last scan
- Cache previous scan results for unchanged files

---

## Known Risks and Mitigations

### Risk 1: Over-parsing noise
**Problem:** Regex-based scanning will match non-task comments (e.g., `// TODO: refactor this mess` vs `// TODO: add error handling`).
**Mitigation:** Start regex-only, add `.flowscan/ignore` file for path exclusions. Implement noise filtering rules (minimum content length, keyword specificity).

### Risk 2: Cross-platform file watching
**Problem:** `chokidar` behaves differently on macOS (FSEvents), Linux (inotify), and Windows (ReadDirectoryChangesW).
**Mitigation:** Debounce all events. Test on all three OSes before Phase 1 sign-off. Document known limitations.

### Risk 3: Markdown ambiguity
**Problem:** Scanning all `.md` files will capture irrelevant content (CHANGELOG, LICENSE, etc.).
**Mitigation:** Scan only specific directories (`docs/`, project root). Add configurable path patterns in `config.yaml`.

### Risk 4: Monorepo complexity
**Problem:** Turborepo adds overhead if only one package exists.
**Mitigation:** Start as a single package. Extract to multi-package structure only when a second logical component emerges (e.g., `@flowscan/cli` or `@flowscan/web`).

### Risk 5: Path traversal vulnerability
**Problem:** Malicious or misconfigured paths could escape the repository boundary.
**Mitigation:** Validate all file paths against the repository root using `path.resolve()` and reject any paths outside the boundary. Implement symlink safety (do not follow symlinks outside repo).

### Risk 6: Binary file parsing
**Problem:** Attempting to parse binary files as text will produce garbage output or crash.
**Mitigation:** Skip files by extension (images, compiled binaries, etc.) and by magic byte detection for unknown types.

### Risk 7: Dependency pinning
**Problem:** Unpinned dependencies can introduce breaking changes or supply-chain risks.
**Mitigation:** Pin all dependencies to exact versions. Use `npm ci` in CI/CD. Audit dependencies regularly.

---

## Open Questions

1. **Write-back format**: JSON vs SQLite vs both? What is the structured output schema for persisted scan results?

2. **Error model**: How should parse errors, file access failures, and configuration errors be represented? Need a structured error type (e.g., `FlowScanError` with codes).

3. **Search/filter requirement**: Should the parser support filtering tasks by status, type, or path at scan time, or is this a downstream concern? (PM flagged this as a requirement.)

4. **Status inference rules**: What exact patterns map to which statuses? Need a definitive mapping table (e.g., `TODO` → `open`, `DONE` → `completed`, `WIP` → `in_progress`).

5. **Default config location**: Should `config.yaml` live at `.flowscan/config.yaml`, `flowscan.config.yaml`, or both? What is the precedence order?

6. **Phase collapse feasibility**: PM suggested collapsing CONFIG-01/CONFIG-02 into SCAN-01 since config loading is a prerequisite for scanning. Is this feasible without bloating the initial implementation?

7. **DnD error handling**: If the scan encounters a file it cannot read (permissions, lock), should it fail fast, skip silently, or collect errors for a post-scan report?

---

## Dependencies

- TypeScript 5.x
- Node.js 20+
- `chokidar` — file watching
- `remark` / `remark-parse` — Markdown AST parsing
- `js-yaml` — YAML config parsing
- `fast-glob` — efficient file globbing
- `object-hash` or equivalent — content-based task ID generation
