# Phase 1 Plan: Parser Core

**Phase:** 1 — Parser Core
**Goal:** Build `@flowscan/core` — the task extraction engine that scans repository files and builds a structured task model.
**Requirements:** SCAN-01, SCAN-02, SCAN-03, SCAN-04, SCAN-05, CONFIG-01, CONFIG-02
**GitHub Issue:** #1

---

## Architecture

Phase 1 starts as a **single package** (`packages/core`). No Turborepo complexity yet.

```
packages/core/
├── src/
│   ├── index.ts              — Public API exports
│   ├── types.ts              — TaskModel interfaces (Task, ScanResult, Config, etc.)
│   ├── config/
│   │   ├── loader.ts         — ConfigLoader: read .flowscan/config.yaml
│   │   ├── defaults.ts       — Default config generator
│   │   └── schema.ts         — Config validation schema
│   ├── parser/
│   │   ├── engine.ts         — ParserEngine: regex-based comment extraction
│   │   ├── patterns.ts       — Language-specific regex patterns
│   │   ├── markdown.ts       — Markdown task list parser (remark-based)
│   │   └── languages.ts      — File extension → language mapping
│   ├── status/
│   │   └── mapper.ts         — StatusMapper: comment pattern → task status
│   ├── scan/
│   │   ├── scanner.ts        — Orchestrates file discovery + parsing
│   │   ├── incremental.ts    — Incremental scan (content hash caching)
│   │   └── filter.ts         — Binary detection, path validation
│   ├── persist/
│   │   └── persister.ts      — FilePersister: write scan results to disk
│   └── cli/
│       └── index.ts          — CLI entry point (commander)
├── tests/
│   ├── types.test.ts
│   ├── config/
│   │   ├── loader.test.ts
│   │   ├── defaults.test.ts
│   │   └── schema.test.ts
│   ├── parser/
│   │   ├── engine.test.ts
│   │   ├── patterns.test.ts
│   │   ├── markdown.test.ts
│   │   └── languages.test.ts
│   ├── status/
│   │   └── mapper.test.ts
│   ├── scan/
│   │   ├── scanner.test.ts
│   │   ├── incremental.test.ts
│   │   └── filter.test.ts
│   ├── persist/
│   │   └── persister.test.ts
│   └── fixtures/             — Test fixture files
│       ├── sample.ts
│       ├── sample.py
│       ├── sample.go
│       ├── sample.rs
│       ├── sample.js
│       ├── sample.md
│       └── binary.bin
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## Execution Order

Plans are grouped into **waves**. Plans within the same wave can execute in parallel.

```
Wave 0: Project Setup
    └── PLAN-01: Project scaffold

Wave 1: Foundation (parallel)
    ├── PLAN-02: Task model types
    ├── PLAN-03: Config system
    └── PLAN-04: Language mapping + regex patterns

Wave 2: Core Parsers (parallel)
    ├── PLAN-05: ParserEngine (code comments)
    ├── PLAN-06: Markdown parser
    └── PLAN-07: StatusMapper

Wave 3: Scan Orchestration (parallel)
    ├── PLAN-08: File discovery + filtering
    └── PLAN-09: Scanner orchestrator

Wave 4: Persistence + Performance
    ├── PLAN-10: FilePersister
    └── PLAN-11: Incremental scan

Wave 5: CLI + Integration
    └── PLAN-12: CLI entry point + integration tests
```

---

## PLAN-01: Project Scaffold

**Goal:** Set up the TypeScript project structure with tooling.

**Tasks:**

1. Create `packages/core/` directory structure
2. Initialize `package.json` with exact-pinned dependencies
3. Configure `tsconfig.json` (strict mode, ES2022 target, ESM modules)
4. Configure `vitest.config.ts`
5. Add `.gitignore` entries for `packages/core/dist/`, `packages/core/node_modules/`, `*.tsbuildinfo`
6. Verify: `npm install && npm test` runs (empty test suite passes)

**Files:**
- `packages/core/package.json` — create
- `packages/core/tsconfig.json` — create
- `packages/core/vitest.config.ts` — create
- `.gitignore` — modify (add packages/core/ entries)

**Tests:**
- `npm test` exits 0 with empty test suite

**Dependencies:** None

**Dependencies (packages):**
```json
{
  "dependencies": {
    "fast-glob": "4.0.2",
    "js-yaml": "4.1.0",
    "remark": "15.0.1",
    "remark-parse": "11.0.0",
    "unified": "11.0.5",
    "object-hash": "3.0.0",
    "pino": "9.6.0",
    "commander": "12.1.0",
    "chokidar": "4.0.3"
  },
  "devDependencies": {
    "typescript": "5.7.3",
    "vitest": "2.1.9",
    "@types/node": "22.10.5",
    "@types/js-yaml": "4.0.9",
    "@types/object-hash": "3.0.6"
  }
}
```

---

## PLAN-02: Task Model Types

**Goal:** Define TypeScript interfaces for all core data structures. This is the foundation every other module depends on.

**Tasks:**

1. [Test] Write test verifying `Task` type has required fields: `id`, `title`, `description`, `file`, `line`, `column`, `status`, `language`, `rawContent`, `metadata`
2. [Impl] Define `Task` interface
3. [Test] Write test verifying `ScanResult` type: `tasks: Task[]`, `duration: number`, `filesScanned: number`, `errors: ScanError[]`, `timestamp: string`
4. [Impl] Define `ScanResult` interface
5. [Test] Write test verifying `Config` type: `version`, `columns`, `filePatterns`, `statusMapping`, `ignorePatterns`
6. [Impl] Define `Config` interface
7. [Test] Write test verifying `ScanError` type: `code`, `message`, `file?`, `line?`
8. [Impl] Define `ScanError` type
9. [Test] Write test verifying `TaskStatus` enum: `backlog`, `todo`, `in-progress`, `review`, `done`
10. [Impl] Define `TaskStatus` enum
11. [Test] Write test verifying `taskId()` function produces deterministic IDs from `filePath + contentHash`
12. [Impl] Implement `taskId()` using object-hash

**Files:**
- `packages/core/src/types.ts` — create (all interfaces + enum + taskId function)
- `packages/core/tests/types.test.ts` — create

**Tests:**
- `Task` interface compiles and has all required fields
- `ScanResult` interface compiles with correct shape
- `Config` interface compiles with correct shape
- `taskId()` returns same hash for same inputs, different hash for different inputs
- `TaskStatus` enum has exactly 5 values

**Dependencies:** None (types only, no runtime deps)

---

## PLAN-03: Config System

**Goal:** Implement `ConfigLoader` that reads `.flowscan/config.yaml`, validates it, and generates a default config if missing.

**Covers:** CONFIG-01, CONFIG-02

**Tasks:**

### 3a: Config Schema & Validation

1. [Test] Write test: `validateConfig()` rejects config with missing `version` field
2. [Test] Write test: `validateConfig()` rejects config with invalid column pattern types
3. [Test] Write test: `validateConfig()` accepts valid minimal config `{ version: 1 }`
4. [Impl] Implement `validateConfig(config: unknown): Config` with runtime validation (no external schema library — use manual validation for minimal deps)
5. [Test] Write test: `validateConfig()` rejects `statusMapping` with non-TaskStatus values
6. [Impl] Add statusMapping validation

### 3b: Default Config Generator

1. [Test] Write test: `generateDefaultConfig()` returns config with 5 default columns (Backlog, To Do, In Progress, Review, Done)
2. [Test] Write test: `generateDefaultConfig()` returns config with default `filePatterns.include` covering TS/JS/Python/Go/Rust/MD
3. [Test] Write test: `generateDefaultConfig()` returns config with default `filePatterns.exclude` covering node_modules, dist, .git
4. [Impl] Implement `generateDefaultConfig(): Config`

### 3c: Config Loader

1. [Test] Write test: `loadConfig(workspaceRoot)` returns default config when `.flowscan/config.yaml` does not exist
2. [Test] Write test: `loadConfig(workspaceRoot)` reads and parses `.flowscan/config.yaml` when it exists
3. [Test] Write test: `loadConfig(workspaceRoot)` merges user config over defaults (user patterns appended, not replaced)
4. [Test] Write test: `loadConfig(workspaceRoot)` throws `FlowScanError` if config.yaml is invalid YAML
5. [Test] Write test: `loadConfig(workspaceRoot)` throws `FlowScanError` if config.yaml fails validation
6. [Test] Write test: `createDefaultConfig(workspaceRoot)` writes `.flowscan/config.yaml` to disk
7. [Test] Write test: `createDefaultConfig(workspaceRoot)` does not overwrite existing config
8. [Impl] Implement `ConfigLoader` class with `loadConfig()`, `createDefaultConfig()`, `getDefaultConfig()`

**Files:**
- `packages/core/src/config/schema.ts` — create (validateConfig)
- `packages/core/src/config/defaults.ts` — create (generateDefaultConfig)
- `packages/core/src/config/loader.ts` — create (ConfigLoader class)
- `packages/core/tests/config/schema.test.ts` — create
- `packages/core/tests/config/defaults.test.ts` — create
- `packages/core/tests/config/loader.test.ts` — create
- `packages/core/tests/fixtures/` — create directory for fixture configs

**Tests:**
- All validation tests pass (reject invalid, accept valid)
- Default config has correct structure with 5 columns
- Config loading merges correctly with defaults
- Config creation writes valid YAML to disk
- Invalid YAML produces structured errors

**Dependencies:** PLAN-02 (needs `Config`, `ScanError` types)

---

## PLAN-04: Language Mapping & Regex Patterns

**Goal:** Define language-specific regex patterns for comment extraction and file extension mapping.

**Tasks:**

### 4a: Language Mapping

1. [Test] Write test: `getLanguageByExtension('ts')` returns `'typescript'`
2. [Test] Write test: `getLanguageByExtension('tsx')` returns `'typescript'`
3. [Test] Write test: `getLanguageByExtension('py')` returns `'python'`
4. [Test] Write test: `getLanguageByExtension('go')` returns `'go'`
5. [Test] Write test: `getLanguageByExtension('rs')` returns `'rust'`
6. [Test] Write test: `getLanguageByExtension('md')` returns `'markdown'`
7. [Test] Write test: `getLanguageByExtension('unknown')` returns `null`
8. [Impl] Implement `getLanguageByExtension(ext: string): string | null` and `LANGUAGE_EXTENSIONS` map

### 4b: Regex Patterns

1. [Test] Write test: `getSingleLineCommentPattern('typescript')` matches `// TODO: fix this`
2. [Test] Write test: `getSingleLineCommentPattern('python')` matches `# TODO: fix this`
3. [Test] Write test: `getSingleLineCommentPattern('go')` matches `// TODO: fix this`
4. [Test] Write test: `getBlockCommentPattern('typescript')` matches `/* TODO: fix this */`
5. [Test] Write test: `getMarkdownCheckboxPattern()` matches `- [ ] task` and `- [x] task`
6. [Test] Write test: `getTaskMarkerRegex()` captures marker type (TODO, FIXME, HACK, NOTE, BUG, XXX) and message
7. [Impl] Implement pattern functions in `patterns.ts`

**Files:**
- `packages/core/src/parser/languages.ts` — create (extension mapping)
- `packages/core/src/parser/patterns.ts` — create (regex patterns)
- `packages/core/tests/parser/languages.test.ts` — create
- `packages/core/tests/parser/patterns.test.ts` — create

**Tests:**
- All extension lookups return correct language
- Unknown extensions return null
- All regex patterns match expected inputs and capture groups correctly
- Patterns do not match invalid inputs

**Dependencies:** None

---

## PLAN-05: ParserEngine (Code Comments)

**Goal:** Implement regex-based extraction of task markers from code files across all supported languages.

**Covers:** SCAN-01, SCAN-05

**Tasks:**

### 5a: Single File Parsing

1. [Test] Write test: `parseFileContent('ts', '// TODO: add validation\nconst x = 1;')` returns 1 task with marker='TODO', message='add validation', line=1
2. [Test] Write test: `parseFileContent('ts', '// FIXME: null check\n// NOTE: temporary workaround')` returns 2 tasks
3. [Test] Write test: `parseFileContent('py', '# TODO: refactor\n# This is just a comment')` returns 1 task (only TODO line)
4. [Test] Write test: `parseFileContent('go', '// HACK: bypass the check')` returns 1 task with marker='HACK'
5. [Test] Write test: `parseFileContent('rs', '/* BUG: memory leak */')` returns 1 task with marker='BUG'
6. [Test] Write test: `parseFileContent('js', '// not a task')` returns 0 tasks
7. [Test] Write test: `parseFileContent('ts', '  // TODO: indented task')` returns 1 task (handles indentation)
8. [Impl] Implement `ParserEngine.parseFileContent(content: string, language: string): RawTask[]`

### 5b: File Reading + Parsing

1. [Test] Write test: `ParserEngine.parseFile(filePath)` reads file and returns parsed tasks
2. [Test] Write test: `ParserEngine.parseFile()` skips binary files (by extension)
3. [Test] Write test: `ParserEngine.parseFile()` returns error for unreadable files (permissions)
4. [Test] Write test: `ParserEngine.parseFile()` validates path is within workspace root
5. [Test] Write test: `ParserEngine.parseFile()` resolves symlinks before parsing
6. [Impl] Implement `ParserEngine.parseFile(filePath: string, workspaceRoot: string): ParseResult`

### 5c: Multi-line / Block Comments

1. [Test] Write test: `parseFileContent('ts', '/* TODO: multi-line\ntask description\n*/')` returns 1 task with multi-line message
2. [Test] Write test: `parseFileContent('py', '"""TODO: docstring task"""')` returns 1 task
3. [Impl] Add block comment parsing to `ParserEngine`

**Files:**
- `packages/core/src/parser/engine.ts` — create (ParserEngine class)
- `packages/core/tests/parser/engine.test.ts` — create
- `packages/core/tests/fixtures/sample.ts` — create (sample file with various comments)
- `packages/core/tests/fixtures/sample.py` — create
- `packages/core/tests/fixtures/sample.go` — create
- `packages/core/tests/fixtures/sample.rs` — create
- `packages/core/tests/fixtures/sample.js` — create

**Tests:**
- Single-line comments parsed correctly for all 5 languages
- Block comments parsed correctly
- Non-task comments ignored
- Indentation handled correctly
- Binary files skipped
- Path traversal prevented
- Symlinks resolved
- Error handling for unreadable files

**Dependencies:** PLAN-02 (types), PLAN-04 (patterns + language mapping)

---

## PLAN-06: Markdown Parser

**Goal:** Implement Markdown task list extraction using remark/remark-parse for checkbox parsing and section-based task discovery.

**Covers:** SCAN-02

**Tasks:**

### 6a: Checkbox Extraction

1. [Test] Write test: `parseMarkdown('# Project\n- [ ] task one\n- [x] task two')` returns 2 tasks with correct checked status
2. [Test] Write test: `parseMarkdown('- [ ] nested\n  - [ ] subtask')` returns 2 tasks (flat list, parent info in description)
3. [Test] Write test: `parseMarkdown('- [-] cancelled')` returns 1 task with marker='-'
4. [Test] Write test: `parseMarkdown('no checkboxes here')` returns 0 tasks
5. [Impl] Implement `parseMarkdown(content: string): RawTask[]` using remark/remark-parse

### 6b: Section-Based Discovery

1. [Test] Write test: `parseMarkdown('## Backlog\n- item one\n- item two')` returns tasks under Backlog section
2. [Test] Write test: `parseMarkdown('## TODO\nsome text')` returns tasks under TODO section header
3. [Test] Write test: `parseMarkdown('# Regular doc\nno section markers')` returns 0 tasks
4. [Impl] Implement section-based task extraction: headings like `# Backlog`, `## TODO`, `### In Progress` define task groups

### 6c: File-Level Integration

1. [Test] Write test: `ParserEngine.parseFile('sample.md')` returns tasks from checkboxes
2. [Test] Write test: `ParserEngine.parseFile('sample.md')` returns tasks from section headers
3. [Impl] Integrate markdown parsing into `ParserEngine.parseFile()` (dispatch based on language === 'markdown')

**Files:**
- `packages/core/src/parser/markdown.ts` — create (Markdown parser)
- `packages/core/tests/parser/markdown.test.ts` — create
- `packages/core/tests/fixtures/sample.md` — create (sample Markdown with checkboxes and sections)

**Tests:**
- Checkbox extraction works for `[ ]`, `[x]`, `[-]`, `[X]`
- Section-based discovery works for Backlog/TODO/In Progress headings
- Nested checkboxes flattened correctly
- Non-task Markdown ignored
- Integration with ParserEngine works

**Dependencies:** PLAN-02 (types), PLAN-04 (patterns), PLAN-05 (ParserEngine integration point)

---

## PLAN-07: StatusMapper

**Goal:** Map raw task markers (TODO, FIXME, [x], etc.) to structured task statuses using the config's `statusMapping`.

**Covers:** SCAN-03

**Tasks:**

### 7a: Default Status Mapping

1. [Test] Write test: `mapStatus('TODO', defaultMapping)` returns `'todo'`
2. [Test] Write test: `mapStatus('FIXME', defaultMapping)` returns `'review'`
3. [Test] Write test: `mapStatus('HACK', defaultMapping)` returns `'in-progress'`
4. [Test] Write test: `mapStatus('NOTE', defaultMapping)` returns `'backlog'`
5. [Test] Write test: `mapStatus('BUG', defaultMapping)` returns `'review'`
6. [Test] Write test: `mapStatus('DONE', defaultMapping)` returns `'done'`
7. [Test] Write test: `mapStatus('- [x]', defaultMapping)` returns `'done'`
8. [Test] Write test: `mapStatus('- [ ]', defaultMapping)` returns `'todo'`
9. [Test] Write test: `mapStatus('- [-]', defaultMapping)` returns `'backlog'`
10. [Impl] Implement `StatusMapper.mapStatus(marker: string, mapping: StatusMapping): TaskStatus`

### 7b: Custom Config Mapping

1. [Test] Write test: `mapStatus('TODO', customMapping)` uses custom mapping from config (e.g., TODO → 'in-progress')
2. [Test] Write test: `mapStatus()` falls back to default for unmapped markers
3. [Impl] Implement custom mapping override logic

### 7c: Column Mapping

1. [Test] Write test: `mapToColumn('todo', config)` returns `'To Do'` (default column name)
2. [Test] Write test: `mapToColumn('review', config)` returns `'Review'`
3. [Test] Write test: `mapToColumn()` returns column name from custom config columns
4. [Impl] Implement `StatusMapper.mapToColumn(status: TaskStatus, config: Config): string`

**Files:**
- `packages/core/src/status/mapper.ts` — create (StatusMapper class)
- `packages/core/tests/status/mapper.test.ts` — create

**Tests:**
- All default marker→status mappings work correctly
- Custom config overrides work
- Unmapped markers fall back to default
- Status→column mapping works for default and custom configs

**Dependencies:** PLAN-02 (types), PLAN-03 (config for custom mappings)

---

## PLAN-08: File Discovery & Filtering

**Goal:** Implement efficient file discovery using fast-glob with include/exclude patterns, binary detection, and path validation.

**Tasks:**

### 8a: File Discovery

1. [Test] Write test: `discoverFiles(workspaceRoot, config)` returns all matching files for default include patterns
2. [Test] Write test: `discoverFiles()` excludes files matching exclude patterns (node_modules, dist, .git)
3. [Test] Write test: `discoverFiles()` respects custom include/exclude patterns from config
4. [Test] Write test: `discoverFiles()` does not return files outside workspace root (path traversal)
5. [Impl] Implement `discoverFiles(workspaceRoot: string, config: Config): string[]` using fast-glob

### 8b: Binary Detection

1. [Test] Write test: `isBinaryFile('image.png')` returns true
2. [Test] Write test: `isBinaryFile('compiled.exe')` returns true
3. [Test] Write test: `isBinaryFile('source.ts')` returns false
4. [Test] Write test: `isBinaryFile()` checks magic bytes for unknown extensions
5. [Impl] Implement `isBinaryFile(filePath: string): boolean` (extension-based + magic byte check)

### 8c: Path Validation

1. [Test] Write test: `validatePath('/workspace/src/file.ts', '/workspace')` returns true
2. [Test] Write test: `validatePath('/workspace/src/../../../etc/passwd', '/workspace')` returns false
3. [Test] Write test: `validatePath()` resolves symlinks before validation
4. [Impl] Implement `validatePath(filePath: string, workspaceRoot: string): boolean`

**Files:**
- `packages/core/src/scan/filter.ts` — create (file discovery, binary detection, path validation)
- `packages/core/tests/scan/filter.test.ts` — create
- `packages/core/tests/fixtures/binary.bin` — create (sample binary file for testing)

**Tests:**
- File discovery finds correct files and excludes noise
- Binary detection works by extension and magic bytes
- Path traversal is blocked
- Symlinks resolved correctly

**Dependencies:** PLAN-03 (config for include/exclude patterns), PLAN-04 (language extensions for binary whitelist)

---

## PLAN-09: Scanner Orchestrator

**Goal:** Implement the main `scan()` function that orchestrates file discovery, parsing, status mapping, and result assembly.

**Covers:** SCAN-04 (performance target)

**Tasks:**

### 9a: Core Scan Orchestration

1. [Test] Write test: `scan(workspaceRoot, config)` discovers files, parses them, maps statuses, returns `ScanResult`
2. [Test] Write test: `scan()` on workspace with mixed file types returns tasks from all languages
3. [Test] Write test: `scan()` collects and returns errors for unreadable files without failing the entire scan
4. [Test] Write test: `scan()` completes for 500 files in under 5 seconds (performance test with generated fixtures)
5. [Impl] Implement `scan(workspaceRoot: string, config: Config): Promise<ScanResult>`

### 9b: Error Model

1. [Test] Write test: `FlowScanError` has structured error codes: `CONFIG_ERROR`, `PARSE_ERROR`, `FILE_ERROR`, `PATH_ERROR`
2. [Test] Write test: `scan()` returns errors in `ScanResult.errors` array without throwing for individual file failures
3. [Impl] Implement `FlowScanError` class with error codes
4. [Impl] Update `scan()` to collect errors rather than fail fast

### 9c: Result Assembly

1. [Test] Write test: `ScanResult` contains correct `tasks` array with all fields populated
2. [Test] Write test: `ScanResult.duration` reflects actual scan time
3. [Test] Write test: `ScanResult.filesScanned` counts all attempted files (including failures)
4. [Test] Write test: `ScanResult.timestamp` is ISO 8601 format
5. [Impl] Implement result assembly logic in `scan()`

**Files:**
- `packages/core/src/scan/scanner.ts` — create (scan orchestrator)
- `packages/core/src/types.ts` — modify (add FlowScanError class)
- `packages/core/tests/scan/scanner.test.ts` — create
- `packages/core/tests/fixtures/large-workspace/` — create (500 generated files for performance test)

**Tests:**
- Full scan pipeline works end-to-end
- Error collection works (partial failures don't abort scan)
- Performance target met: 500 files < 5 seconds
- ScanResult has correct shape and values

**Dependencies:** PLAN-05 (ParserEngine), PLAN-06 (Markdown parser), PLAN-07 (StatusMapper), PLAN-08 (File discovery)

---

## PLAN-10: FilePersister

**Goal:** Implement writing scan results to disk in JSON format for caching and downstream consumption.

**Open Question Resolution:** JSON format chosen for Phase 1 (simple, human-readable). SQLite deferred to Phase 4 if query performance becomes a bottleneck.

**Tasks:**

### 10a: JSON Serialization

1. [Test] Write test: `FilePersister.write(scanResult, cachePath)` writes valid JSON to disk
2. [Test] Write test: Written JSON can be read back and deserialized to identical `ScanResult`
3. [Test] Write test: `FilePersister.read(cachePath)` returns `ScanResult` from disk
4. [Test] Write test: `FilePersister.read()` returns `null` when cache file does not exist
5. [Impl] Implement `FilePersister` class with `write()` and `read()` methods

### 10b: Directory Management

1. [Test] Write test: `FilePersister.write()` creates parent directories if they don't exist (`.flowscan/`)
2. [Test] Write test: `FilePersister.write()` uses atomic writes (write to temp, rename)
3. [Impl] Implement directory creation and atomic writes

### 10c: Default Cache Location

1. [Test] Write test: Default cache path is `.flowscan/cache.json` relative to workspace root
2. [Test] Write test: Custom cache path configurable via config
3. [Impl] Implement default and custom cache path resolution

**Files:**
- `packages/core/src/persist/persister.ts` — create (FilePersister class)
- `packages/core/tests/persist/persister.test.ts` — create

**Tests:**
- JSON write/read round-trips correctly
- Parent directories created automatically
- Atomic writes prevent corruption
- Default and custom cache paths work

**Dependencies:** PLAN-02 (types), PLAN-09 (ScanResult)

---

## PLAN-11: Incremental Scan

**Goal:** Implement content-hash-based incremental scanning to re-parse only changed files, meeting SCAN-04 performance target.

**Covers:** SCAN-04 (incremental performance)

**Tasks:**

### 11a: Content Hash Tracking

1. [Test] Write test: `computeFileHash(filePath)` returns deterministic hash for file content
2. [Test] Write test: `computeFileHash()` returns different hash after file content changes
3. [Test] Write test: `computeFileHash()` is fast (< 1ms for typical source files)
4. [Impl] Implement `computeFileHash(filePath: string): string` using object-hash or crypto.hash

### 11b: Cache Comparison

1. [Test] Write test: `getChangedFiles(currentHashes, cachedHashes)` returns only files with changed hashes
2. [Test] Write test: `getChangedFiles()` returns all files when no cache exists
3. [Test] Write test: `getChangedFiles()` returns empty array when no files changed
4. [Impl] Implement `getChangedFiles()` comparison logic

### 11c: Incremental Scan Integration

1. [Test] Write test: `scanIncremental(workspaceRoot, config)` skips unchanged files and uses cached results
2. [Test] Write test: `scanIncremental()` re-scans only changed files
3. [Test] Write test: `scanIncremental()` on 500 files with 1 change completes in under 100ms
4. [Test] Write test: `scanIncremental()` handles deleted files (remove from cache)
5. [Test] Write test: `scanIncremental()` handles new files (add to cache)
6. [Impl] Implement `scanIncremental(workspaceRoot: string, config: Config): Promise<ScanResult>`

**Files:**
- `packages/core/src/scan/incremental.ts` — create (incremental scan logic)
- `packages/core/tests/scan/incremental.test.ts` — create

**Tests:**
- Content hashing is deterministic and fast
- Changed file detection works correctly
- Incremental scan merges cached + new results correctly
- Performance target met: 1 changed file < 100ms on 500-file workspace
- Deleted and new files handled correctly

**Dependencies:** PLAN-09 (Scanner), PLAN-10 (FilePersister)

---

## PLAN-12: CLI Entry Point + Integration Tests

**Goal:** Implement the `flowscan` CLI entry point with `scan` and `init` commands, plus end-to-end integration tests.

**Covers:** Partial CLI-01 (scan command only — full CLI suite in Phase 3)

**Tasks:**

### 12a: CLI Commands

1. [Test] Write test: `flowscan --help` shows available commands
2. [Test] Write test: `flowscan scan` runs scan on current directory and prints task summary
3. [Test] Write test: `flowscan scan --config <path>` uses custom config path
4. [Test] Write test: `flowscan scan --json` outputs machine-readable JSON
5. [Test] Write test: `flowscan init` creates default `.flowscan/config.yaml` in current directory
6. [Test] Write test: `flowscan init` does not overwrite existing config
7. [Test] Write test: `flowscan scan --incremental` runs incremental scan
8. [Impl] Implement CLI with commander: `scan`, `init` commands

### 12b: Integration Tests

1. [Test] Write test: End-to-end scan of a fixture workspace produces correct tasks across all 5 languages + Markdown
2. [Test] Write test: End-to-end scan with custom config respects include/exclude patterns
3. [Test] Write test: End-to-end scan with incremental flag skips unchanged files
4. [Test] Write test: `flowscan init` + `flowscan scan` workflow works from empty directory
5. [Impl] Write integration tests using real fixture files

### 12c: Public API Exports

1. [Test] Write test: `import { scan, ConfigLoader, ParserEngine, StatusMapper, FilePersister } from '@flowscan/core'` works
2. [Test] Write test: `import type { Task, ScanResult, Config, TaskStatus } from '@flowscan/core'` works
3. [Impl] Implement `src/index.ts` with all public exports

**Files:**
- `packages/core/src/cli/index.ts` — create (CLI entry point)
- `packages/core/src/index.ts` — create (public API exports)
- `packages/core/tests/integration.test.ts` — create
- `packages/core/package.json` — modify (add `bin` field)

**Tests:**
- CLI commands work correctly with all flags
- End-to-end scan works across all supported file types
- Incremental scan works end-to-end
- Init + scan workflow works
- Public API exports are accessible

**Dependencies:** PLAN-03 (ConfigLoader), PLAN-09 (Scanner), PLAN-10 (FilePersister), PLAN-11 (Incremental scan)

---

## Parallelism Summary

| Wave | Plans | Parallel? | Blockers |
|------|-------|-----------|----------|
| 0 | PLAN-01 | — | None |
| 1 | PLAN-02, PLAN-03, PLAN-04 | **Yes** (all parallel) | PLAN-01 |
| 2 | PLAN-05, PLAN-06, PLAN-07 | **Yes** (all parallel) | PLAN-02, PLAN-03, PLAN-04 |
| 3 | PLAN-08, PLAN-09 | PLAN-08 first, then PLAN-09 | PLAN-03, PLAN-04, PLAN-05, PLAN-06, PLAN-07 |
| 4 | PLAN-10, PLAN-11 | PLAN-10 first, then PLAN-11 | PLAN-09 (PLAN-10), PLAN-10 + PLAN-09 (PLAN-11) |
| 5 | PLAN-12 | Sequential | All previous |

**Critical path:** PLAN-01 → PLAN-02 → PLAN-05 → PLAN-09 → PLAN-10 → PLAN-11 → PLAN-12

**Total estimated plans:** 12
**Maximum parallelism:** 3 plans at once (Wave 1 and Wave 2)

---

## Sign-Off Criteria

Phase 1 is complete when ALL of the following are true:

1. **SCAN-01:** `scan()` on a workspace with TODO/FIXME/HACK/NOTE comments in TS/JS/Python/Go/Rust returns structured `Task[]` objects
2. **SCAN-02:** `scan()` on Markdown files with task lists (`- [ ]`, `- [x]`) and section headers correctly extracts tasks
3. **SCAN-03:** Status inference correctly maps: TODO→todo, FIXME→review, HACK→in-progress, NOTE→backlog, BUG→review, DONE→done, `[x]`→done, `[ ]`→todo, `[-]`→backlog
4. **SCAN-04:** Scan completes for 500 files in under 5 seconds; incremental re-scan of 1 changed file completes in under 100ms
5. **SCAN-05:** At least 5 languages supported: TypeScript, JavaScript, Python, Go, Rust (+ Markdown)
6. **CONFIG-01:** `.flowscan/config.yaml` is read and merged with defaults for custom columns, file patterns, and status mappings
7. **CONFIG-02:** Default `.flowscan/config.yaml` is created on first run via `flowscan init`
8. **All tests pass:** `npm test` exits 0 with 100% pass rate
9. **TypeScript compiles:** `tsc --noEmit` exits 0
10. **CLI works:** `flowscan scan` and `flowscan init` commands work on a real directory

---

## Risk Mitigation Checklist

| Risk | Mitigation | Plan Reference |
|------|-----------|----------------|
| Over-parsing noise | Strict regex patterns, ignore patterns in config | PLAN-03, PLAN-05 |
| Binary file crashes | Extension + magic byte detection | PLAN-08 |
| Path traversal | `path.resolve()` + workspace root validation | PLAN-08 |
| Cross-platform file watching | Deferred to Phase 4 (FileWatcher is out of scope for Phase 1 per CONTEXT.md) | — |
| Performance miss | Incremental scan, content hash caching | PLAN-11 |
| Config complexity | Merge user config over defaults (not replace) | PLAN-03 |
| Dependency bloat | Exact version pinning, minimal dependency set | PLAN-01 |
| Monorepo complexity | Single package for Phase 1, no Turborepo yet | PLAN-01 |
