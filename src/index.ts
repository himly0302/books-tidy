#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('books-tidy')
  .description('CLI tool for tidying books')
  .version('1.0.0');

program.command('tidy')
  .description('Tidy the books')
  .action(() => {
    console.log('Tidying books...');
  });

program.parse();