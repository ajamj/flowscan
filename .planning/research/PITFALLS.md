# Research: Pitfalls for Repository-Based Kanban Tools

## Pitfall 1: Over-Parsing — Trying to Parse Every Comment as a Task

**Warning Signs:**
- False positives from casual comments ("TODO: refactor this someday" from 2019)
- Users overwhelmed with noise on first scan

**Prevention Strategy:**
- Start with regex-only parsing for MVP (TODO, FIXME, HACK, NOTE patterns)
- Add tree-sitter only for complex cases (nested structures, multi-line comments)
- Provide `.flowscan/ignore` file to exclude paths/patterns
- Confidence scoring: only show low-confidence tasks in "Review" column

**Phase:** MVP (regex) → Phase 2 (tree-sitter)

---

## Pitfall 2: VS Code WebView Bundle Size Limits

**Warning Signs:**
- Extension bundle exceeds 50MB (VS Code Marketplace limit)
- Slow WebView load times (>3 seconds)

**Prevention Strategy:**
- Tree-sitter WASM binaries are large — lazy-load only for active languages
- Use esbuild for tree-shaking; don't bundle dev dependencies
- Test WebView performance with large repos (1000+ files)
- Consider pre-computed cache for large workspaces

**Phase:** MVP (be aware from start)

---

## Pitfall 3: File Conflict on Drag-and-Drop

**Warning Signs:**
- User drags card while file is being edited → merge conflict
- Multiple instances running → conflicting writes

**Prevention Strategy:**
- Before writing, check if file is dirty (VS Code API) or modified since last read
- Use atomic writes (write to temp file, then rename)
- Log all file mutations for debugging
- Add `.flowscan/lock` file to prevent concurrent writes

**Phase:** MVP (basic conflict detection)

---

## Pitfall 4: Cross-Platform File Watching Issues

**Warning Signs:**
- Windows: file watcher fires multiple times for single save
- Mac: FSEvents delays or misses events
- Network drives: chokidar doesn't work reliably

**Prevention Strategy:**
- Debounce file watcher events (300ms minimum)
- Test on all three OSes early
- Fallback to polling mode for network drives
- Use chokidar's built-in atomic option for editors that use atomic writes

**Phase:** MVP

---

## Pitfall 5: Markdown Task List Ambiguity

**Warning Signs:**
- `- [ ] Buy milk` is a personal todo, not a dev task
- Nested checklists: which level is the "task"?
- `[x]` means done, but what about `[-]` (cancelled)?

**Prevention Strategy:**
- Only scan Markdown files in specific directories (.planning/, docs/, root)
- Provide config to include/exclude file patterns
- Map `[x]` → Done, `- [ ]` → To Do by default
- Allow custom status mapping in config.yaml

**Phase:** MVP

---

## Pitfall 6: API Design Lock-In for AI Agents

**Warning Signs:**
- API designed without LLM tool calling patterns in mind
- Missing pagination for large boards
- No way to filter by status/label via API

**Prevention Strategy:**
- Design API around LLM tool schemas from day 1:
  - `get_kanban_status({filter?: string})` → returns filtered board
  - `update_task({id: string, status: string})` → returns updated task
  - `add_task({title: string, file: string, status: string})` → returns created task
- Version the API from the start (`/api/v1/...`)
- Return task IDs that are stable across scans (file:line based)

**Phase:** MVP (design) → Phase 2 (implement)

---

## Pitfall 7: Monorepo Complexity Too Early

**Warning Signs:**
- Setting up Turborepo, workspaces, cross-package imports before core works
- Debugging workspace links instead of building features

**Prevention Strategy:**
- Start as single package, split into monorepo when you have 2+ consumers of core
- Phase 1: single `flowscan/` with core + web + CLI co-located
- Phase 2: split into `packages/core`, `packages/web`, `packages/cli`, `packages/vscode`
- OR: keep monorepo from start but use it ONLY for code organization, not separate publishing

**Phase:** Decision for MVP

---

## Pitfall 8: Ignoring Existing Tools' Lessons

**Warning Signs:**
- Rebuilding Agent Kanban's mistakes
- Not studying TODO.md Kanban, GitHub Projects, Linear

**Prevention Strategy:**
- Study existing tools' GitHub issues for common user complaints
- Key differentiator: auto-discovery + local server + AI agent API
- Don't compete on features; compete on workflow (zero setup, repo-first)

**Phase:** Pre-MVP (research phase)

---

## Pitfall Summary Table

| # | Pitfall | Severity | Phase to Address |
|---|---------|----------|-----------------|
| 1 | Over-parsing noise | High | MVP |
| 2 | WebView bundle size | Medium | MVP |
| 3 | File conflict on DnD | High | MVP |
| 4 | Cross-platform file watching | Medium | MVP |
| 5 | Markdown ambiguity | Medium | MVP |
| 6 | API design lock-in | High | MVP (design) |
| 7 | Monorepo complexity | Medium | Phase 1 decision |
| 8 | Ignoring existing tools | High | Pre-MVP |
