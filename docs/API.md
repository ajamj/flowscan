# FlowScan API Documentation

## Overview

FlowScan exposes a REST API and WebSocket interface for AI agent integration. This allows tools like Claude Code, Gemini CLI, Qwen Code, and other AI agents to interact with the Kanban board programmatically.

## Base URL

```
http://127.0.0.1:5173
```

> **Security:** The server binds to `127.0.0.1` only. It is not accessible from external networks.

## Authentication

No authentication is required. The API is designed for local-only use.

---

## REST API

### GET /api/v1/kanban

Returns the full Kanban board state including all tasks.

**Response:**
```json
{
  "tasks": [
    {
      "id": "a1b2c3d4e5f6",
      "title": "Add input validation",
      "description": "// TODO: add input validation",
      "file": "src/auth.ts",
      "line": 42,
      "column": 3,
      "status": "todo",
      "language": "typescript",
      "rawContent": "// TODO: add input validation [status:todo]",
      "metadata": { "priority": "high" }
    }
  ],
  "duration": 234,
  "filesScanned": 150,
  "errors": [],
  "timestamp": "2026-04-13T12:00:00.000Z"
}
```

**Status values:** `backlog`, `todo`, `in-progress`, `review`, `done`

---

### POST /api/v1/tasks/:id/status

Update a task's status. This writes back to the source file.

**Request Body:**
```json
{
  "status": "in-progress",
  "file": "src/auth.ts",
  "line": 42,
  "language": "typescript"
}
```

**Response (success):**
```json
{
  "success": true,
  "taskId": "a1b2c3d4e5f6",
  "newStatus": "in-progress"
}
```

**Response (error):**
```json
{
  "error": "Task not found in file"
}
```

---

### GET /api/v1/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "workspace": "/path/to/workspace",
  "clients": 2
}
```

---

## WebSocket API

Connect to `ws://127.0.0.1:5173/ws` for real-time board updates.

### Server → Client Messages

**Board update (sent on connect and after any file change):**
```json
{
  "type": "board",
  "data": {
    "tasks": [...],
    "duration": 123,
    "filesScanned": 150,
    "errors": [],
    "timestamp": "..."
  }
}
```

### Example (Node.js)

```javascript
const ws = new WebSocket('ws://127.0.0.1:5173/ws');

ws.on('open', () => {
  console.log('Connected to FlowScan');
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  if (message.type === 'board') {
    console.log(`Found ${message.data.tasks.length} tasks`);
  }
});
```

---

## CLI Commands (for AI Agents)

### `flowscan status`

Get Kanban board state as JSON.

```bash
flowscan status --path /path/to/workspace
```

**Output:** JSON ScanResult object

### `flowscan status --format table`

Get human-readable task summary.

```bash
flowscan status --format table
```

**Output:**
```
Tasks: 15 | Files: 150 | Duration: 234ms
  [todo] Add input validation (src/auth.ts:42)
  [review] Handle null case (src/utils.ts:15)
  [done] Initialize project (PLAN.md:10)
```

### `flowscan update-task`

Update a task's status from the command line.

```bash
flowscan update-task \
  --id abc123 \
  --status in-progress \
  --file src/auth.ts \
  --line 42
```

**Output:**
```json
{ "success": true, "taskId": "abc123", "newStatus": "in-progress" }
```

---

## AI Agent Integration Examples

### Claude Code / Cursor / Continue.dev

AI agents can call the API directly:

```python
import requests

# Get current board
response = requests.get('http://127.0.0.1:5173/api/v1/kanban')
board = response.json()

# Update a task
response = requests.post(
    'http://127.0.0.1:5173/api/v1/tasks/abc123/status',
    json={
        'status': 'done',
        'file': 'src/auth.ts',
        'line': 42,
        'language': 'typescript'
    }
)
```

### OpenAI Function Calling Schema

```json
{
  "name": "get_kanban_status",
  "description": "Get the current Kanban board state from FlowScan",
  "parameters": { "type": "object", "properties": {} }
}

{
  "name": "update_task_status",
  "description": "Update a task's status in FlowScan",
  "parameters": {
    "type": "object",
    "properties": {
      "taskId": { "type": "string", "description": "The task ID" },
      "status": {
        "type": "string",
        "enum": ["backlog", "todo", "in-progress", "review", "done"]
      },
      "file": { "type": "string", "description": "Source file path relative to workspace" },
      "line": { "type": "integer", "description": "Line number (1-indexed)" },
      "language": { "type": "string", "description": "Programming language" }
    },
    "required": ["taskId", "status", "file", "line"]
  }
}
```

---

## Supported Languages

| Language | Extensions | Comment Style |
|----------|-----------|---------------|
| TypeScript | `.ts`, `.tsx` | `// TODO:` |
| JavaScript | `.js`, `.jsx`, `.mjs`, `.cjs` | `// TODO:` |
| Python | `.py`, `.pyw` | `# TODO:` |
| Go | `.go` | `// TODO:` |
| Rust | `.rs` | `// TODO:` |
| Markdown | `.md`, `.mdx` | `- [ ] task` |

---

## File Format

Tasks are stored in source code comments. The supported markers are:

| Marker | Default Status |
|--------|---------------|
| `TODO` | todo |
| `FIXME` | review |
| `HACK` | in-progress |
| `NOTE` | backlog |
| `DONE` | done |
| `BUG` | review |

Tasks can include optional annotations:
```
// TODO: add validation [status:todo] [priority:high]
```

---

*API Version: v1*
*Last Updated: 2026-04-13*
