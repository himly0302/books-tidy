import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { BookInfo, BooksDatabase, BookRaw, AIAnalysisResult } from './types';

export interface DedupResult {
  newBooks: BookRaw[];
  skipped: BookRaw[];
}

export function loadDatabase(dbPath: string): BooksDatabase {
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data) as BooksDatabase;
  }
  return { books: [] };
}

export function saveDatabase(dbPath: string, db: BooksDatabase): void {
  const dir = path.dirname(dbPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}

export function hashName(name: string): string {
  return crypto.createHash('md5').update(name).digest('hex').slice(0, 8);
}

export function normalizeBookName(name: string): string {
  return name
    .replace(/[《》「」""''\s]/g, '')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .trim();
}

export function filterDuplicateBooks(
  db: BooksDatabase,
  books: BookRaw[],
): DedupResult {
  const existingFolders = new Set(
    db.books.filter(b => b.sourceFolder).map(b => b.sourceFolder)
  );

  const newBooks: BookRaw[] = [];
  const skipped: BookRaw[] = [];

  for (const book of books) {
    if (existingFolders.has(book.folderName)) {
      skipped.push(book);
      continue;
    }
    newBooks.push(book);
  }

  return { newBooks, skipped };
}

export function addBooks(
  db: BooksDatabase,
  books: BookRaw[],
  analyses: AIAnalysisResult[],
): BooksDatabase {
  const newDb = { books: [...db.books] };

  const existingKeys = new Set(
    newDb.books.map(b => normalizeBookName(b.name) + ':' + b.author)
  );

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const analysis = analyses[i];
    const nameKey = normalizeBookName(analysis.name) + ':' + analysis.author;

    if (existingKeys.has(nameKey)) continue;
    existingKeys.add(nameKey);

    const hasPic = book.pics.length > 0;
    const ext = hasPic ? path.extname(book.pics[0]) : '';
    const picHash = hasPic ? hashName(analysis.name) + ext : '';

    const entry: BookInfo = {
      id: uuidv4(),
      name: analysis.name,
      author: analysis.author,
      type: analysis.type,
      pic: hasPic ? `${analysis.type}/${analysis.name}/${picHash}` : '',
      sourceFolder: book.folderName,
      addedAt: new Date().toISOString(),
    };
    newDb.books.push(entry);
  }

  return newDb;
}

export function updateBookPicUrl(
  db: BooksDatabase,
  bookId: string,
  picUrl: string,
): void {
  const book = db.books.find((b) => b.id === bookId);
  if (book) {
    book.picUrl = picUrl;
  }
}
