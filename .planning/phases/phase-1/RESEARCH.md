# Phase 1 Research: Parser Core Technical Details

## Regex Patterns for Code Comments

### Multi-language Comment Syntax

| Language | Single-line | Multi-line |
|----------|------------|------------|
| TypeScript/JavaScript | `// TODO: message` | `/* TODO: message */` |
| Python | `# TODO: message` | `"""TODO: message"""` |
| Go | `// TODO: message` | `/* TODO: message */` |
| Rust | `// TODO: message` | `/* TODO: message */` |
| Markdown | `- [ ] task` / `- [x] task` | N/A |

### Recommended Regex Patterns

```regex
# Code comment pattern (language-agnostic prefix)
^(?:\s*)(?://|#)\s*(TODO|FIXME|HACK|NOTE|BUG|XXX)\s*:?\s*(.+)$

# Block comment pattern
/\*\s*(TODO|FIXME|HACK|NOTE)\s*:?\s*(.+?)\s*\*/

# Markdown checkbox
^\s*-\s*\[([ xX-])\]\s+(.+)$

# Markdown section headers
^#{1,3}\s+(Backlog|To Do|In Progress|Review|Done|TODO)$
```

### File Extension Mapping

```typescript
const LANGUAGE_EXTENSIONS = {
  'ts': 'typescript', 'tsx': 'typescript',
  'js': 'javascript', 'jsx': 'javascript', 'mjs': 'javascript', 'cjs': 'javascript',
  'py': 'python', 'pyw': 'python',
  'go': 'go',
  'rs': 'rust',
  'md': 'markdown', 'mdx': 'markdown',
};
```

## Performance Benchmarks (Target)

- 500 files: < 5 seconds total scan
- 1000 files: < 10 seconds (linear scaling expected)
- Individual file parse: < 10ms average
- Incremental re-scan (1 changed file): < 100ms

## Config Schema (Definitive)

```yaml
# .flowscan/config.yaml
version: 1
columns:
  - name: "Backlog"
    patterns: ["NOTE", "N/A"]
  - name: "To Do"
    patterns: ["TODO", "- \\[ \\]"]
  - name: "In Progress"
    patterns: ["HACK", "WIP"]
  - name: "Review"
    patterns: ["FIXME", "BUG"]
  - name: "Done"
    patterns: ["DONE", "- \\[x\\]"]

filePatterns:
  include:
    - "**/*.{ts,tsx,js,jsx,mjs,cjs,py,pyw,go,rs,md,mdx}"
  exclude:
    - "node_modules/**"
    - "dist/**"
    - "build/**"
    - ".git/**"
    - "**/*.min.*"
    - "**/*.bundle.*"
    - "**/vendor/**"

ignorePatterns:
  - "**/test/fixtures/**"   # Optional: exclude test fixtures

statusMapping:
  "TODO": "todo"
  "FIXME": "review"
  "HACK": "in-progress"
  "NOTE": "backlog"
  "BUG": "review"
  "DONE": "done"
  "- [x]": "done"
  "- [ ]": "todo"
  "- [-]": "backlog"
```

## Key Libraries

| Library | Purpose | Version | Why |
|---------|---------|---------|-----|
| fast-glob | File discovery | ^4.0 | Fastest glob for Node.js |
| js-yaml | Config parsing | ^4.1 | Standard YAML parser |
| remark + remark-parse | Markdown AST | ^15.0 | Structured checkbox extraction |
| chokidar | File watching | ^4.0 | Cross-platform, industry standard |
| object-hash | Task ID generation | ^3.0 | Deterministic content hashing |
| pino | Structured logging | ^9.0 | Fast, JSON output |
| commander | CLI framework | ^12.0 | Standard CLI parser |
| vitest | Testing | ^2.0 | Fast, ESM-native test runner |

## Security Controls (Phase 1)

1. **Path validation**: `path.resolve()` + verify within workspace root
2. **Symlink safety**: `fs.realpathSync()` before any operation
3. **Binary detection**: Skip known binary extensions + magic byte check
4. **UTF-8 enforcement**: Explicit encoding on all reads
5. **Dependency pinning**: Exact versions in package.json
