import * as fs from 'fs';
import * as path from 'path';
import { BookRaw, AIAnalysisResult } from './types';
import { hashName } from './database';

export function organizeBooks(
  books: BookRaw[],
  analyses: AIAnalysisResult[],
  outputDir: string
): void {
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const analysis = analyses[i];
    const typeDir = path.join(outputDir, analysis.type);
    const destDir = path.join(typeDir, analysis.name);

    fs.mkdirSync(destDir, { recursive: true });

    // Copy all files, rename first image to hash(name).ext
    const allFiles = collectFiles(book.folderPath);
    const firstPic = book.pics[0] || '';
    const firstPicExt = firstPic ? path.extname(firstPic) : '';
    const hashedName = firstPic ? hashName(analysis.name) + firstPicExt : '';

    for (const file of allFiles) {
      const relPath = path.relative(book.folderPath, file);
      const destFile = path.join(destDir, relPath);
      fs.mkdirSync(path.dirname(destFile), { recursive: true });

      if (relPath === firstPic) {
        fs.copyFileSync(file, path.join(destDir, hashedName));
      } else {
        fs.copyFileSync(file, destFile);
      }
    }
  }
}

function collectFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}
