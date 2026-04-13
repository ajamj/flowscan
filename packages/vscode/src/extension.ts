import * as vscode from 'vscode';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function activate(context: vscode.ExtensionContext) {
  console.log('FlowScan extension is now active');

  const disposable = vscode.commands.registerCommand('flowscan.openBoard', async () => {
    const panel = vscode.window.createWebviewPanel(
      'flowscanBoard',
      'FlowScan',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, 'webview'),
        ],
      },
    );

    panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);

    // Listen for messages from the webview
    panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'updateTaskStatus':
            console.log(`Update task ${message.taskId} to ${message.newStatus}`);
            // TODO: Integrate with @flowscan/core updateTaskInFile
            panel.webview.postMessage({ command: 'taskUpdated', success: true });
            break;
          case 'openFile':
            try {
              const doc = await vscode.workspace.openTextDocument(message.filePath);
              const editor = await vscode.window.showTextDocument(doc);
              const line = message.lineNumber - 1;
              editor.selection = new vscode.Selection(line, 0, line, 0);
              editor.revealRange(new vscode.Range(line, 0, line, 0));
            } catch (e) {
              vscode.window.showErrorMessage(`Cannot open file: ${message.filePath}`);
            }
            break;
        }
      },
      undefined,
      context.subscriptions,
    );
  });

  context.subscriptions.push(disposable);
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  // Try to load the built index.html from the webview directory
  const webviewDir = join(__dirname, '..', 'webview');
  const indexPath = join(webviewDir, 'index.html');

  if (existsSync(indexPath)) {
    const html = readFileSync(indexPath, 'utf-8');
    // Replace asset paths with webview URIs
    return html;
  }

  // Fallback: simple placeholder
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FlowScan</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; }
    h1 { color: #333; }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>FlowScan</h1>
  <p>Kanban board will be rendered here once the web app is built.</p>
  <p>Run <code>flowscan scan</code> in terminal to scan your workspace.</p>
</body>
</html>`;
}

export function deactivate() {}
