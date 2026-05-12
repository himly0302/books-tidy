import * as path from 'path';
import * as fs from 'fs';
import { scanBooks } from './scanner';
import { checkCopyright } from './copyright-filter';
import { AnalyzeOptions } from './types';

export async function copyrightCommand(options: AnalyzeOptions) {
  const inputDir = path.resolve(options.input);

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

  console.log('Checking copyright status...');
  const results = await checkCopyright(books);

  const statusLabel: Record<string, string> = {
    public_domain: '非侵权',
    copyrighted: '侵权',
    uncertain: '不确定',
  };

  const grouped = {
    public_domain: results.filter(r => r.status === 'public_domain'),
    copyrighted: results.filter(r => r.status === 'copyrighted'),
    uncertain: results.filter(r => r.status === 'uncertain'),
  };

  for (const [status, items] of Object.entries(grouped)) {
    if (items.length === 0) continue;
    console.log(`\n--- ${statusLabel[status]} (${items.length}) ---`);
    for (const item of items) {
      console.log(`  ${item.folderName}`);
      console.log(`    ${item.reason}`);
    }
  }

  console.log(`\n总计: 非侵权 ${grouped.public_domain.length}, 侵权 ${grouped.copyrighted.length}, 不确定 ${grouped.uncertain.length}`);
}
