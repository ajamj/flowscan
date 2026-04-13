import { watch } from 'chokidar';
import { EventEmitter } from 'node:events';
import type { Config } from '../types.js';

export interface FileChange {
  path: string;
  event: 'add' | 'change' | 'unlink';
}

export class FileWatcher extends EventEmitter {
  private watcher: ReturnType<typeof watch> | null = null;
  private config: Config;
  private workspaceRoot: string;

  constructor(workspaceRoot: string, config: Config) {
    super();
    this.workspaceRoot = workspaceRoot;
    this.config = config;
  }

  /** Start watching files for changes */
  start(): Promise<void> {
    if (this.watcher) {
      return this.stop().then(() => this.start());
    }

    const includePatterns = this.config.filePatterns.include;

    this.watcher = watch(includePatterns, {
      cwd: this.workspaceRoot,
      ignoreInitial: true,
      ignored: this.config.filePatterns.exclude,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
      usePolling: true,
      interval: 250,
    });

    this.watcher
      .on('add', (path) => this.emit('change', { path, event: 'add' } as FileChange))
      .on('change', (path) => this.emit('change', { path, event: 'change' } as FileChange))
      .on('unlink', (path) => this.emit('change', { path, event: 'unlink' } as FileChange))
      .on('error', (error) => this.emit('error', error));

    // Return a promise that resolves once the watcher is ready
    return new Promise((resolve) => {
      this.watcher!.once('ready', () => resolve());
      // Fallback: resolve immediately since 'ready' may not always fire
      setTimeout(resolve, 100);
    });
  }

  /** Stop watching files */
  stop(): Promise<void> {
    if (this.watcher) {
      return this.watcher.close().then(() => {
        this.watcher = null;
      });
    }
    return Promise.resolve();
  }
}
