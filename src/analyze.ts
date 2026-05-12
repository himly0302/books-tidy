import * as path from 'path';
import * as fs from 'fs';
import { scanBooks } from './scanner';
import { analyzeBooks } from './analyzer';
import { filterCopyrightedBooks } from './copyright-filter';
import { AnalyzeOptions } from './types';

export async function analyzeCommand(options: AnalyzeOptions) {
  const inputDir = path.resolve(options.input);

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

  console.log('Filtering copyrighted resources...');
  books = await filterCopyrightedBooks(books);

  if (books.length === 0) {
    console.log('All resources are copyrighted or uncertain. Nothing to do.');
    return;
  }

  console.log('Analyzing with AI...');
  const analyses = await analyzeBooks(books);

  console.log('\nAnalysis results:');
  for (let i = 0; i < books.length; i++) {
    const a = analyses[i];
    console.log(`  [${i + 1}] ${a.name} | ${a.author} | ${a.type}`);
    console.log(`      Original: ${books[i].folderName}`);
    if (books[i].pics.length > 0) {
      console.log(`      Images: ${books[i].pics.join(', ')}`);
    }
  }
}
