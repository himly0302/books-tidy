import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { BookInfo, BooksDatabase, BookRaw, AIAnalysisResult } from './types';

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

export function addBooks(
  db: BooksDatabase,
  books: BookRaw[],
  analyses: AIAnalysisResult[],
): BooksDatabase {
  const newDb = { books: [...db.books] };

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const analysis = analyses[i];
    const ext = book.pics[0] ? path.extname(book.pics[0]) : '.jpg';
    const picHash = hashName(analysis.name) + ext;

    const entry: BookInfo = {
      id: uuidv4(),
      name: analysis.name,
      author: analysis.author,
      type: analysis.type,
      pic: `${analysis.type}/${analysis.name}/${picHash}`,
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
