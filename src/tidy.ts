import * as path from 'path';
import * as fs from 'fs';
import { scanBooks } from './scanner';
import { analyzeBooks } from './analyzer';
import { organizeBooks } from './organizer';
import { loadDatabase, saveDatabase, addBooks, filterDuplicateBooks } from './database';
import { filterByGlobalHistory, recordProcessed } from './history';
import { filterCopyrightedBooks } from './copyright-filter';
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

  console.log('Filtering copyrighted resources...');
  books = await filterCopyrightedBooks(books);

  if (books.length === 0) {
    console.log('All resources are copyrighted or uncertain. Nothing to do.');
    return;
  }

  const dbPath = path.join(outputDir, 'books.json');
  const db = loadDatabase(dbPath);

  if (!options.force) {
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
  } else {
    console.log('Force mode: skipping dedup.');
  }

  if (books.length === 0) {
    console.log('All books are already processed. Nothing to do.');
    return;
  }
  console.log(`Processing ${books.length} new books.`);

  console.log('Analyzing with AI...');
  const analyses = await analyzeBooks(books);

  // addBooks 内部做名称级去重，返回实际入库的索引
  const { db: newDb, acceptedIndices } = addBooks(db, books, analyses);

  // 只整理实际入库的书（跳过名称去重的书）
  const acceptedBooks = acceptedIndices.map(i => books[i]);
  const acceptedAnalyses = acceptedIndices.map(i => analyses[i]);

  for (let i = 0; i < acceptedBooks.length; i++) {
    console.log(`  [${i + 1}] ${acceptedBooks[i].folderName} -> ${acceptedAnalyses[i].type}/${acceptedAnalyses[i].name} (${acceptedAnalyses[i].author})`);
  }

  if (acceptedIndices.length < books.length) {
    console.log(`Skipped ${books.length - acceptedIndices.length} duplicate books by name.`);
  }

  console.log('Organizing files...');
  organizeBooks(acceptedBooks, acceptedAnalyses, outputDir);

  saveDatabase(dbPath, newDb);

  // 记录到全局历史
  for (const i of acceptedIndices) {
    recordProcessed(inputDir, outputDir, books[i].folderName, analyses[i].name);
  }

  console.log(`Done! ${acceptedBooks.length} books organized. Database saved to ${dbPath}`);
}
