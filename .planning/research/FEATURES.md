# Research: Features for Repository-Based Kanban Tools

## Table Stakes Features

These are expected by any project management tool. Users will be disappointed without them.

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Auto-scan code comments** | Detect TODO, FIXME, HACK, NOTE in source files | Medium |
| **Auto-scan Markdown** | Parse task lists from .md files (checklists, sections) | Low |
| **Status inference** | Map comment syntax to Kanban columns | Low |
| **Kanban board rendering** | Visual board with columns and cards | Medium |
| **Card details** | Title, file:line link, snippet, labels | Low |
| **Click to open file** | Navigate to source file at correct line | Low (VS Code) / Medium (CLI) |
| **Drag-and-drop** | Move cards between columns, update source | Medium |
| **File watching** | Auto-refresh when files change | Low |
| **Custom columns** | Configure columns via config file | Low |

## Differentiating Features

These set FlowScan apart from existing tools (Agent Kanban, TODO.md Kanban, etc.).

| Feature | Description | Why It Differentiates | Complexity |
|---------|-------------|----------------------|------------|
| **Auto-discovery** | No manual board creation; scan finds all tasks | Existing tools require manual setup | Medium |
| **Local web server** | Access Kanban from browser, share with team | VS Code extensions can't do this | Medium |
| **AI agent API** | REST/CLI API for AI coding tools | No existing tool has this | High |
| **Multi-language parsing** | tree-sitter for Python, Rust, Go, etc. | Most tools only support JS/TS comments | High |
| **Git-friendly** | All changes committed to repo | External tools (Jira, Trello) create sync problems | Low |
| **AI fallback** | Local LLM (Ollama) for ambiguous task inference | Unique capability | Medium |

## Anti-Features (Dont Build)

| Feature | Why Avoid |
|---------|-----------|
| **Cloud sync / multi-user real-time collab** | Breaks local-first promise, high complexity |
| **Jira/Trello full sync** | Massive integration surface, contradicts GitOps value |
| **Full issue tracker replacement** | Out of scope; FlowScan complements, not replaces |
| **Mobile app** | Not needed for target users (developers in IDEs) |
| **Rich text editing in cards** | Complexity vs value; cards are references, not editors |

## Feature Dependencies

```
Auto-scan (code + MD) → Status inference → Kanban rendering
Drag-and-drop → File watching → Re-render
AI agent API → Core parsing + Kanban state
Local web server → Kanban UI (reuse)
Multi-language parsing → Auto-scan (upgrade path)
```

## Phase Mapping Recommendations

- **MVP:** Table stakes (auto-scan, Kanban UI, drag-drop, file watching, custom columns)
- **Phase 2:** Differentiators (local web server, AI agent API, multi-language tree-sitter)
- **Phase 3:** Advanced differentiators (AI fallback inference, multi-repo)
