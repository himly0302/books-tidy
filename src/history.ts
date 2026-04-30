import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { BookRaw } from './types';

interface HistoryRecord {
  processedAt: string;
  bookName: string;
  outputDir: string;
}

interface HistoryDatabase {
  processed: {
    [inputDir: string]: {
      [folderName: string]: HistoryRecord;
    };
  };
}

function getHistoryDir(): string {
  return path.join(os.homedir(), '.books-tidy');
}

function getHistoryPath(): string {
  return path.join(getHistoryDir(), 'history.json');
}

function loadHistory(): HistoryDatabase {
  const histPath = getHistoryPath();
  if (fs.existsSync(histPath)) {
    const data = fs.readFileSync(histPath, 'utf-8');
    return JSON.parse(data) as HistoryDatabase;
  }
  return { processed: {} };
}

function saveHistory(history: HistoryDatabase): void {
  const histDir = getHistoryDir();
  fs.mkdirSync(histDir, { recursive: true });
  fs.writeFileSync(getHistoryPath(), JSON.stringify(history, null, 2), 'utf-8');
}

export function filterByGlobalHistory(
  books: BookRaw[],
  inputDir: string,
): { newBooks: BookRaw[]; skipped: BookRaw[] } {
  const history = loadHistory();
  const inputHistory = history.processed[inputDir];

  if (!inputHistory) {
    return { newBooks: books, skipped: [] };
  }

  const newBooks: BookRaw[] = [];
  const skipped: BookRaw[] = [];

  for (const book of books) {
    if (inputHistory[book.folderName]) {
      skipped.push(book);
      continue;
    }
    newBooks.push(book);
  }

  return { newBooks, skipped };
}

export function recordProcessed(
  inputDir: string,
  outputDir: string,
  folderName: string,
  bookName: string,
): void {
  const history = loadHistory();

  if (!history.processed[inputDir]) {
    history.processed[inputDir] = {};
  }

  history.processed[inputDir][folderName] = {
    processedAt: new Date().toISOString(),
    bookName,
    outputDir,
  };

  saveHistory(history);
}
