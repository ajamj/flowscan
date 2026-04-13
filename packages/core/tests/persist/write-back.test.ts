import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { updateTaskInFile, writeUpdatedFile } from '../../src/persist/file-writer';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('updateTaskInFile', () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = join(process.cwd(), 'tests', 'temp-writeback');
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    mkdirSync(tempDir, { recursive: true });

    // Create test files
    writeFileSync(join(tempDir, 'app.ts'), [
      '// TODO: add validation',
      '// FIXME: null check',
      'const x = 1;',
    ].join('\n'), 'utf-8');

    writeFileSync(join(tempDir, 'PLAN.md'), [
      '# Project Plan',
      '- [ ] Design database',
      '- [x] Initialize project',
    ].join('\n'), 'utf-8');
  });

  afterAll(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should update TODO to DONE in TypeScript file', () => {
    const result = updateTaskInFile('app.ts', tempDir, 1, 'done', 'typescript');
    expect(result).not.toBeNull();
    expect(result).toContain('DONE');
    expect(result).toContain('[status:done]');
    expect(result).toContain('add validation');
  });

  it('should update FIXME to TODO in TypeScript file', () => {
    const result = updateTaskInFile('app.ts', tempDir, 2, 'todo', 'typescript');
    expect(result).not.toBeNull();
    expect(result).toContain('TODO');
    expect(result).toContain('[status:todo]');
  });

  it('should update unchecked checkbox to checked in Markdown', () => {
    const result = updateTaskInFile('PLAN.md', tempDir, 2, 'done', 'markdown');
    expect(result).not.toBeNull();
    expect(result).toContain('- [x] Design database');
  });

  it('should return null for out-of-range line', () => {
    const result = updateTaskInFile('app.ts', tempDir, 100, 'done', 'typescript');
    expect(result).toBeNull();
  });
});

describe('writeUpdatedFile', () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = join(process.cwd(), 'tests', 'temp-writeback-write');
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    mkdirSync(tempDir, { recursive: true });
  });

  afterAll(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should write file successfully', () => {
    const content = '// DONE: completed task [status:done]';
    const result = writeUpdatedFile('test.ts', tempDir, content);

    expect(result.success).toBe(true);
    const filePath = join(tempDir, 'test.ts');
    expect(existsSync(filePath)).toBe(true);
    expect(readFileSync(filePath, 'utf-8')).toBe(content);
  });
});

describe('Full round-trip: update task in file', () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = join(process.cwd(), 'tests', 'temp-roundtrip');
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    mkdirSync(join(tempDir, 'src'), { recursive: true });

    writeFileSync(join(tempDir, 'src', 'main.ts'), '// TODO: implement feature\nconst x = 1;', 'utf-8');
  });

  afterAll(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should update and persist file', () => {
    // Read original
    const updated = updateTaskInFile('src/main.ts', tempDir, 1, 'done', 'typescript');
    expect(updated).not.toBeNull();
    expect(updated).toContain('DONE');

    // Write updated
    const writeResult = writeUpdatedFile('src/main.ts', tempDir, updated!);
    expect(writeResult.success).toBe(true);

    // Verify on disk
    const onDisk = readFileSync(join(tempDir, 'src', 'main.ts'), 'utf-8');
    expect(onDisk).toContain('DONE');
    expect(onDisk).toContain('[status:done]');
  });
});
