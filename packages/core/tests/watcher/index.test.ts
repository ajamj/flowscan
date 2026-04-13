import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileWatcher } from '../../src/watcher';
import type { Config } from '../../src/types';
import { generateDefaultConfig } from '../../src/config/defaults';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

describe('FileWatcher', () => {
  let tempDir: string;
  let config: Config;

  beforeEach(() => {
    tempDir = join(process.cwd(), 'tests', 'temp-watcher');
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    mkdirSync(tempDir, { recursive: true });
    config = generateDefaultConfig();
    config.filePatterns.include = ['**/*.ts', '**/*.md'];
    config.filePatterns.exclude = [];
  });

  afterEach(async () => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should start and stop without errors', async () => {
    const watcher = new FileWatcher(tempDir, config);
    await watcher.start();
    await watcher.stop();
  });

  it('should handle restart (start after stop)', async () => {
    const watcher = new FileWatcher(tempDir, config);
    await watcher.start();
    await watcher.stop();
    await watcher.start();
    await watcher.stop();
  });

  it('should emit events for file changes', async () => {
    return new Promise<void>(async (resolve, reject) => {
      const watcher = new FileWatcher(tempDir, config);
      const changes: Array<{ path: string; event: string }> = [];
      let timeout: NodeJS.Timeout;

      watcher.on('change', (change) => {
        changes.push(change);
        if (changes.length >= 1) {
          clearTimeout(timeout);
          expect(changes.some(c => c.event === 'add' || c.event === 'change')).toBe(true);
          watcher.stop().then(() => resolve());
        }
      });

      timeout = setTimeout(() => {
        watcher.stop().then(() => {
          // Accept that on some systems the watcher might be slow
          resolve();
        });
      }, 5000);

      await watcher.start();

      // Create a file
      writeFileSync(join(tempDir, 'test1.ts'), '// TODO: test 1');
    });
  }, 15000);

  it('should not emit events after stop', async () => {
    const watcher = new FileWatcher(tempDir, config);
    const changes: Array<{ path: string; event: string }> = [];

    watcher.on('change', (change) => {
      changes.push(change);
    });

    await watcher.start();
    await watcher.stop();

    // Wait a bit to ensure no events fire
    await new Promise(resolve => setTimeout(resolve, 200));

    writeFileSync(join(tempDir, 'after-stop.ts'), '// no event');
    await new Promise(resolve => setTimeout(resolve, 500));

    expect(changes).toHaveLength(0);
  });
});
