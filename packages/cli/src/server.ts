import express from 'express';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scan } from '@flowscan/core';
import { ConfigLoader, generateDefaultConfig } from '@flowscan/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createServer(workspaceRoot: string, port: number) {
  const app = express();

  app.use(express.json());

  // API endpoint for AI agents
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

  // Update task status endpoint
  app.post('/api/v1/tasks/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    // Note: Full implementation would update the source file
    // For now, return success placeholder
    res.json({ success: true, taskId: id, newStatus: status });
  });

  // Health check
  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', workspace: workspaceRoot });
  });

  // Serve the web UI (built from @flowscan/web)
  const webDist = join(__dirname, '..', '..', 'web', 'dist');
  app.use(express.static(webDist));

  // SPA fallback
  app.get('*', (_req, res) => {
    res.sendFile(join(webDist, 'index.html'));
  });

  const server = app.listen(port, '127.0.0.1', () => {
    console.log(`FlowScan listening on http://127.0.0.1:${port}`);
  });

  return server;
}
