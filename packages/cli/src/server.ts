import express from 'express';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { scan, ConfigLoader, generateDefaultConfig, updateTaskInFile, writeUpdatedFile } from '@flowscan/core';
import type { TaskStatus } from '@flowscan/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createServer(workspaceRoot: string, port: number) {
  const app = express();

  app.use(express.json());

  // API endpoint for AI agents - returns full Kanban state
  app.get('/api/v1/kanban', async (_req, res) => {
    try {
      const loader = new ConfigLoader(workspaceRoot);
      const config = loader.loadConfig();
      const result = await scan(workspaceRoot, config);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  // Update task status endpoint - writes back to source file
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

      res.json({ success: true, taskId: id, newStatus: status });
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  // Health check
  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', workspace: workspaceRoot });
  });

  // Serve the web UI (built from @flowscan/web)
  const webDist = join(__dirname, '..', '..', 'web', 'dist');
  const webDistAbsolute = resolve(webDist);

  if (existsSync(join(webDistAbsolute, 'index.html'))) {
    app.use(express.static(webDistAbsolute));

    // SPA fallback - serve index.html for all non-API routes
    app.get('*', (_req, res) => {
      res.sendFile(join(webDistAbsolute, 'index.html'));
    });
  } else {
    // Web UI not built - serve a simple status page
    app.get('*', (_req, res) => {
      res.send(`
        <html><body>
          <h1>FlowScan Server</h1>
          <p>Web UI not built yet. Run \`cd packages/web && npm run build\` in the flowscan repository.</p>
          <h2>API Endpoints</h2>
          <ul>
            <li><a href="/api/v1/health">GET /api/v1/health</a> - Health check</li>
            <li><a href="/api/v1/kanban">GET /api/v1/kanban</a> - Full Kanban board state</li>
            <li>POST /api/v1/tasks/:id/status - Update task status</li>
          </ul>
        </body></html>
      `);
    });
  }

  // Bind to 127.0.0.1 only for security
  const server = app.listen(port, '127.0.0.1', () => {
    console.log(`FlowScan listening on http://127.0.0.1:${port}`);
    console.log(`Workspace: ${workspaceRoot}`);
    if (!existsSync(join(webDistAbsolute, 'index.html'))) {
      console.log('Note: Web UI not built. Run `cd packages/web && npm run build`');
    }
  });

  return server;
}
