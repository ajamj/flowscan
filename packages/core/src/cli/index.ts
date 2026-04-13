import { Command } from 'commander';
import { scan } from '../scan/scanner.js';
import { ConfigLoader } from '../config/loader.js';
import { FilePersister } from '../persist/persister.js';
import { resolve } from 'node:path';
import { cwd } from 'node:process';

export function createCLI(): Command {
  const program = new Command();

  program
    .name('flowscan')
    .description('Scan repository and visualize tasks as Kanban board')
    .version('0.1.0');

  program
    .command('scan')
    .description('Scan workspace and display task summary')
    .option('-p, --path <path>', 'Workspace root path', cwd())
    .action(async (opts) => {
      const workspaceRoot = resolve(opts.path);
      const loader = new ConfigLoader(workspaceRoot);
      const config = loader.loadConfig();

      console.log(`Scanning ${workspaceRoot}...`);
      const result = await scan(workspaceRoot, config);

      console.log(`\nFound ${result.tasks.length} tasks in ${result.filesScanned} files (${result.duration}ms)`);
      console.log(`\nBy status:`);

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
    });

  program
    .command('init')
    .description('Create default configuration file')
    .option('-p, --path <path>', 'Workspace root path', cwd())
    .action((opts) => {
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

  return program;
}
