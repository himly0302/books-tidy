import * as path from 'path';
import * as fs from 'fs';
import { scanBooks } from './scanner';
import { analyzeBooks } from './analyzer';
import { organizeBooks } from './organizer';
import { loadDatabase, saveDatabase, addBooks } from './database';
import { TidyOptions } from './types';

export async function tidyCommand(options: TidyOptions) {
  const inputDir = path.resolve(options.input);
  const outputDir = path.resolve(options.output);

  if (!fs.existsSync(inputDir)) {
    console.error(`Error: input directory not found: ${inputDir}`);
    process.exit(1);
  }

  console.log('Scanning books...');
  const books = scanBooks(inputDir);
  if (books.length === 0) {
    console.log('No book folders found.');
    return;
  }
  console.log(`Found ${books.length} book folders.`);

  console.log('Analyzing with AI...');
  const analyses = await analyzeBooks(books);

  for (let i = 0; i < books.length; i++) {
    console.log(`  [${i + 1}] ${books[i].folderName} -> ${analyses[i].type}/${analyses[i].name} (${analyses[i].author})`);
  }

  console.log('Organizing files...');
  organizeBooks(books, analyses, outputDir);

  const dbPath = path.join(outputDir, 'books.json');
  const db = loadDatabase(dbPath);
  const newDb = addBooks(db, books, analyses);
  saveDatabase(dbPath, newDb);

  console.log(`Done! ${books.length} books organized. Database saved to ${dbPath}`);
}
