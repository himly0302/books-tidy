import * as fs from 'fs';
import * as path from 'path';
import { loadDatabase, saveDatabase } from './database';
import { BooksDatabase } from './types';

interface CsvEntry {
  name: string;
  link: string;
}

function parseCsv(csvPath: string): CsvEntry[] {
  const content = fs.readFileSync(csvPath, 'utf-8').replace(/^﻿/, '');
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length <= 1) return [];

  const entries: CsvEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const link = parts[1].trim();
      if (name && link) {
        entries.push({ name, link });
      }
    }
  }
  return entries;
}

function loadCsvData(dir: string): Map<string, CsvEntry[]> {
  const csvMap = new Map<string, CsvEntry[]>();
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.csv'));

  for (const file of files) {
    const type = path.basename(file, '.csv');
    const entries = parseCsv(path.join(dir, file));
    csvMap.set(type, entries);
  }
  return csvMap;
}

function findLink(csvEntries: CsvEntry[], bookName: string): string | null {
  for (const entry of csvEntries) {
    if (entry.name.includes(bookName) || bookName.includes(entry.name)) {
      return entry.link;
    }
  }
  return null;
}

function saveResult(db: BooksDatabase, projectRoot: string): void {
  const resultDir = path.join(projectRoot, 'result');
  fs.mkdirSync(resultDir, { recursive: true });

  const today = new Date();
  const dateStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('');
  const fileName = `${dateStr}-${db.books.length}.json`;
  fs.writeFileSync(
    path.join(resultDir, fileName),
    JSON.stringify(db, null, 2),
    'utf-8',
  );
  console.log(`副本已保存: result/${fileName}`);
}

export function importLinksCommand(options: { dir: string }): void {
  const dir = path.resolve(options.dir);
  if (!fs.existsSync(dir)) {
    console.error(`目录不存在: ${dir}`);
    process.exit(1);
  }

  const dbPath = path.join(dir, 'books.json');
  if (!fs.existsSync(dbPath)) {
    console.error(`未找到 books.json: ${dbPath}`);
    process.exit(1);
  }

  const csvMap = loadCsvData(dir);
  if (csvMap.size === 0) {
    console.log('未找到 CSV 文件');
    process.exit(0);
  }

  console.log(`已加载 ${csvMap.size} 个 CSV 文件:`);
  for (const [type, entries] of csvMap) {
    console.log(`  ${type}.csv — ${entries.length} 条链接`);
  }

  const db = loadDatabase(dbPath);
  let matched = 0;
  let unmatched = 0;

  for (const book of db.books) {
    const csvEntries = csvMap.get(book.type);
    if (!csvEntries) continue;

    const link = findLink(csvEntries, book.name);
    if (link) {
      book.bd_link = link;
      matched++;
    } else {
      unmatched++;
    }
  }

  saveDatabase(dbPath, db);
  console.log(`\n匹配结果: ${matched} 条成功, ${unmatched} 条未匹配`);

  const projectRoot = path.resolve(__dirname, '..');
  saveResult(db, projectRoot);
}
