import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { scan, ConfigLoader, generateDefaultConfig, updateTaskInFile, writeUpdatedFile, FileWatcher, FileChange } from '@flowscan/core';
import type { TaskStatus, ScanResult } from '@flowscan/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface FlowScanServer {
  app: express.Express;
  server: ReturnType<typeof express['prototype']['listen']>;
  wss: WebSocketServer;
}

export async function createServer(workspaceRoot: string, port: number): Promise<FlowScanServer> {
  const app = express();
  app.use(express.json());

  const loader = new ConfigLoader(workspaceRoot);
  const config = loader.loadConfig();

  // WebSocket server for real-time updates
  const server = app.listen(port, '127.0.0.1') as ReturnType<typeof express['prototype']['listen']>;
  const wss = new WebSocketServer({ server, path: '/ws' });

  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));

    // Send current board state on connect
    scan(workspaceRoot, config).then((result) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'board', data: result }));
      }
    });
  });

  function broadcast(data: unknown) {
    const message = JSON.stringify(data);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  // File watcher for real-time updates
  const watcher = new FileWatcher(workspaceRoot, config);
  watcher.on('change', async (change: FileChange) => {
    try {
      const result = await scan(workspaceRoot, config);
      broadcast({ type: 'board', data: result });
    } catch {
      // Ignore scan errors during file watching
    }
  });
  watcher.start();

  // === API Endpoints ===

  // GET /api/v1/kanban - Full board state
  app.get('/api/v1/kanban', async (_req, res) => {
    try {
      const result = await scan(workspaceRoot, config);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  // POST /api/v1/tasks/:id/status - Update task with write-back
  app.post('/api/v1/tasks/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, file, line, language } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    if (!file || !line) {
      return res.status(400).json({ error: 'file and line are required' });
    }

    try {
      const updatedContent = updateTaskInFile(file, workspaceRoot, line, status as TaskStatus, language ?? 'typescript');

      if (!updatedContent) {
        return res.status(404).json({ error: 'Task not found in file' });
      }

      const writeResult = writeUpdatedFile(file, workspaceRoot, updatedContent);

      if (!writeResult.success) {
        return res.status(500).json({ error: writeResult.error });
      }

      // Broadcast update to all connected clients
      const result = await scan(workspaceRoot, config);
      broadcast({ type: 'board', data: result });

      res.json({ success: true, taskId: id, newStatus: status });
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  // GET /api/v1/health - Health check
  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', workspace: workspaceRoot, clients: clients.size });
  });

  // === Serve Web UI ===
  const webDist = join(__dirname, '..', '..', 'web', 'dist');
  const webDistAbsolute = resolve(webDist);

  if (existsSync(join(webDistAbsolute, 'index.html'))) {
    app.use(express.static(webDistAbsolute));
    app.get('*', (_req, res) => {
      res.sendFile(join(webDistAbsolute, 'index.html'));
    });
  } else {
    app.get('*', (_req, res) => {
      res.send(`
        <html><body>
          <h1>FlowScan Server</h1>
          <p>Web UI not built. Run \`cd packages/web && npm run build\`</p>
          <h2>API Endpoints</h2>
          <ul>
            <li><a href="/api/v1/health">GET /api/v1/health</a></li>
            <li><a href="/api/v1/kanban">GET /api/v1/kanban</a></li>
            <li>POST /api/v1/tasks/:id/status</li>
          </ul>
          <h2>WebSocket</h2>
          <p>Connect to <code>ws://localhost:${port}/ws</code> for real-time board updates</p>
        </body></html>
      `);
    });
  }

  console.log(`FlowScan listening on http://127.0.0.1:${port}`);
  console.log(`WebSocket: ws://127.0.0.1:${port}/ws`);
  console.log(`Workspace: ${workspaceRoot}`);

  return { app, server, wss };
}
