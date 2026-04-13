import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Root } from 'mdast';
import type { RawTask } from '../types.js';

/** Parse Markdown content and extract tasks */
export function parseMarkdown(content: string): RawTask[] {
  const tree = unified()
    .use(remarkParse)
    .parse(content) as Root;

  const tasks: RawTask[] = [];

  function walkNode(node: unknown) {
    if (!node || typeof node !== 'object') return;
    const n = node as Record<string, unknown>;

    if (n.type === 'list' && Array.isArray(n.children)) {
      for (const item of n.children as unknown[]) {
        const li = item as Record<string, unknown>;
        if (li.type !== 'listItem') continue;

        const checked = li.checked as boolean | null | undefined;
        if (checked === null || checked === undefined) continue;

        const text = extractTextFromNode(li);
        const marker = checked ? '- [x]' : '- [ ]';
        const lineNum = (li.position as { start?: { line?: number } })?.start?.line ?? 1;

        tasks.push({
          marker,
          message: text,
          file: '',
          line: lineNum,
          column: 1,
          language: 'markdown',
          rawContent: `${marker} ${text}`,
        });
      }
    }

    if (Array.isArray(n.children)) {
      for (const child of n.children) {
        walkNode(child);
      }
    }
  }

  function extractTextFromNode(node: Record<string, unknown>): string {
    const texts: string[] = [];
    function collect(n: unknown) {
      if (!n || typeof n !== 'object') return;
      const obj = n as Record<string, unknown>;
      if (obj.type === 'text' && typeof obj.value === 'string') {
        texts.push(obj.value);
      }
      if (Array.isArray(obj.children)) {
        for (const child of obj.children) {
          collect(child);
        }
      }
    }
    collect(node);
    return texts.join(' ').trim();
  }

  walkNode(tree);
  return tasks;
}
