import * as path from 'path';
import * as fs from 'fs';
import { scanBooks } from './scanner';
import { analyzeBooks } from './analyzer';
import { organizeBooks } from './organizer';
import { loadDatabase, saveDatabase, addBooks, filterDuplicateBooks } from './database';
import { filterByGlobalHistory, recordProcessed } from './history';
import { TidyOptions } from './types';

export async function tidyCommand(options: TidyOptions) {
  const inputDir = path.resolve(options.input);
  const outputDir = path.resolve(options.output);

  if (!fs.existsSync(inputDir)) {
    console.error(`Error: input directory not found: ${inputDir}`);
    process.exit(1);
  }

  console.log('Scanning books...');
  let books = scanBooks(inputDir);
  if (books.length === 0) {
    console.log('No book folders found.');
    return;
  }
  console.log(`Found ${books.length} book folders.`);

  // 本地去重（基于 output 目录的 books.json）
  const dbPath = path.join(outputDir, 'books.json');
  const db = loadDatabase(dbPath);
  const localResult = filterDuplicateBooks(db, books);
  if (localResult.skipped.length > 0) {
    console.log(`Skipped ${localResult.skipped.length} already processed books (local).`);
  }

  // 全局历史去重
  const globalResult = filterByGlobalHistory(localResult.newBooks, inputDir);
  if (globalResult.skipped.length > 0) {
    console.log(`Skipped ${globalResult.skipped.length} already processed books (global history).`);
  }

  books = globalResult.newBooks;
  if (books.length === 0) {
    console.log('All books are already processed. Nothing to do.');
    return;
  }
  console.log(`Processing ${books.length} new books.`);

  console.log('Analyzing with AI...');
  const analyses = await analyzeBooks(books);

  for (let i = 0; i < books.length; i++) {
    console.log(`  [${i + 1}] ${books[i].folderName} -> ${analyses[i].type}/${analyses[i].name} (${analyses[i].author})`);
  }

  console.log('Organizing files...');
  organizeBooks(books, analyses, outputDir);

  // addBooks 内部做名称级去重
  const newDb = addBooks(db, books, analyses);
  saveDatabase(dbPath, newDb);

  // 记录到全局历史
  for (let i = 0; i < books.length; i++) {
    recordProcessed(inputDir, outputDir, books[i].folderName, analyses[i].name);
  }

  console.log(`Done! ${books.length} books organized. Database saved to ${dbPath}`);
}
