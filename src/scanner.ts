import * as fs from 'fs';
import * as path from 'path';
import { BookRaw } from './types';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']);

export function scanBooks(inputDir: string): BookRaw[] {
  const entries = fs.readdirSync(inputDir, { withFileTypes: true });
  const books: BookRaw[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const folderPath = path.join(inputDir, entry.name);
    const pics = findImages(folderPath);
    books.push({
      folderName: entry.name,
      folderPath,
      pics,
    });
  }

  return books;
}

function findImages(dir: string): string[] {
  const pics: string[] = [];

  function walk(current: string) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        pics.push(path.relative(dir, fullPath));
      }
    }
  }

  walk(dir);
  return pics;
}
