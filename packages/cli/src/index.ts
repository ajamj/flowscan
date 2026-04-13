#!/usr/bin/env node

import { Command } from 'commander';
import { createServer } from './server.js';
import { scan, ConfigLoader, generateDefaultConfig, updateTaskInFile, writeUpdatedFile, FileWatcher } from '@flowscan/core';
import type { TaskStatus, FileChange } from '@flowscan/core';
import { resolve, cwd } from 'node:path';

const program = new Command();

program
  .name('flowscan')
  .description('Scan repository and visualize tasks as Kanban board')
  .version('0.1.0');

// === SCAN COMMAND ===
program
  .command('scan')
  .description('Scan workspace and display task summary')
  .option('-p, --path <path>', 'Workspace root path', cwd())
  .option('--watch', 'Watch for file changes and re-scan automatically', false)
  .action(async (opts) => {
    const workspaceRoot = resolve(opts.path);
    const loader = new ConfigLoader(workspaceRoot);
    const config = loader.loadConfig();

    async function runScan() {
      console.log(`\nScanning ${workspaceRoot}...`);
      const result = await scan(workspaceRoot, config);

      console.log(`Found ${result.tasks.length} tasks in ${result.filesScanned} files (${result.duration}ms)`);
      console.log('\nBy status:');

      const byStatus = new Map<string, number>();
      for (const task of result.tasks) {
        byStatus.set(task.status, (byStatus.get(task.status) ?? 0) + 1);
      }
      for (const [status, count] of byStatus) {
        console.log(`  ${status}: ${count}`);
      }

      if (result.errors.length > 0) {
        console.log(`\n${result.errors.length} error(s):`);
        for (const err of result.errors) {
          console.log(`  [${err.code}] ${err.file ?? ''}: ${err.message}`);
        }
      }
    }

    await runScan();

    if (opts.watch) {
      const watcher = new FileWatcher(workspaceRoot, config);
      watcher.on('change', async (change: FileChange) => {
        console.log(`\n[${change.event}] ${change.path} — re-scanning...`);
        await runScan();
      });
      await watcher.start();
      console.log('Watching for changes... (Ctrl+C to exit)');

      // Keep process alive
      process.on('SIGINT', async () => {
        await watcher.stop();
        process.exit(0);
      });
    }
  });

// === SERVE COMMAND ===
program
  .command('serve')
  .description('Start local web server with Kanban board')
  .option('-p, --path <path>', 'Workspace root path', cwd())
  .option('--port <port>', 'Server port', '5173')
  .action(async (opts) => {
    const workspaceRoot = resolve(opts.path);
    const port = parseInt(opts.port, 10);

    await createServer(workspaceRoot, port);
  });

// === INIT COMMAND ===
program
  .command('init')
  .description('Create default configuration file')
  .option('-p, --path <path>', 'Workspace root path', cwd())
  .action(async (opts) => {
    const workspaceRoot = resolve(opts.path);
    const loader = new ConfigLoader(workspaceRoot);

    try {
      const path = loader.createDefaultConfig();
      console.log(`Created config at ${path}`);
    } catch (e) {
      console.error(`Error: ${(e as Error).message}`);
      process.exit(1);
    }
  });

// === STATUS COMMAND (AI Agent API) ===
program
  .command('status')
  .description('Get Kanban board state as JSON (for AI agents)')
  .option('-p, --path <path>', 'Workspace root path', cwd())
  .option('--format <format>', 'Output format: json or table', 'json')
  .action(async (opts) => {
    const workspaceRoot = resolve(opts.path);
    const loader = new ConfigLoader(workspaceRoot);
    const config = loader.loadConfig();
    const result = await scan(workspaceRoot, config);

    if (opts.format === 'json') {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Tasks: ${result.tasks.length} | Files: ${result.filesScanned} | Duration: ${result.duration}ms`);
      for (const task of result.tasks) {
        console.log(`  [${task.status}] ${task.title} (${task.file}:${task.line})`);
      }
    }
  });

// === UPDATE-TASK COMMAND (AI Agent API) ===
program
  .command('update-task')
  .description('Update task status (for AI agents)')
  .requiredOption('--id <id>', 'Task ID')
  .requiredOption('--status <status>', 'New status: backlog|todo|in-progress|review|done')
  .option('--file <file>', 'Source file path')
  .option('--line <line>', 'Line number in file')
  .option('-p, --path <path>', 'Workspace root path', cwd())
  .action(async (opts) => {
    const workspaceRoot = resolve(opts.path);
    const { id, status, file, line } = opts;

    if (!file || !line) {
      console.error('Error: --file and --line are required for file write-back');
      process.exit(1);
    }

    const validStatuses = ['backlog', 'todo', 'in-progress', 'review', 'done'];
    if (!validStatuses.includes(status)) {
      console.error(`Error: status must be one of: ${validStatuses.join(', ')}`);
      process.exit(1);
    }

    const result = updateTaskInFile(file, workspaceRoot, parseInt(line, 10), status as TaskStatus, 'typescript');

    if (!result) {
      console.error('Error: Task not found in file');
      process.exit(1);
    }

    const writeResult = writeUpdatedFile(file, workspaceRoot, result);
    if (!writeResult.success) {
      console.error(`Error: ${writeResult.error}`);
      process.exit(1);
    }

    console.log(JSON.stringify({ success: true, taskId: id, newStatus: status }));
  });

program.parse();
