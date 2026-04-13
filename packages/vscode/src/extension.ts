import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('FlowScan extension is now active');

  const disposable = vscode.commands.registerCommand('flowscan.openBoard', async () => {
    const panel = vscode.window.createWebviewPanel(
      'flowscanBoard',
      'FlowScan',
      vscode.ViewColumn.One,
      { enableScripts: true },
    );

    panel.webview.html = getWebviewContent();
  });

  context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
  <title>FlowScan</title>
</head>
<body>
  <h1>FlowScan</h1>
  <p>Kanban board will be rendered here.</p>
  <p>Run <code>flowscan scan</code> in terminal to scan your workspace.</p>
</body>
</html>`;
}

export function deactivate() {}
