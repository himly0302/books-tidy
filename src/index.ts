#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import { tidyCommand } from './tidy';
import { analyzeCommand } from './analyze';
import { uploadPicsCommand } from './upload-pics';

const program = new Command();

program
  .name('books-tidy')
  .description('AI 驱动的书籍文件夹自动整理工具')
  .version('1.0.0');

program.command('tidy')
  .description('扫描并整理书籍文件夹')
  .requiredOption('-i, --input <dir>', '输入目录（原始书籍文件夹）')
  .requiredOption('-o, --output <dir>', '输出目录（整理后的目录）')
  .action(tidyCommand);

program.command('analyze')
  .description('仅分析不移动文件（预览模式）')
  .requiredOption('-i, --input <dir>', '输入目录（原始书籍文件夹）')
  .action(analyzeCommand);

program.command('upload-pics')
  .description('上传图片到七牛云图床')
  .requiredOption('--db <file>', 'books.json 数据库文件路径')
  .requiredOption('-o, --output <dir>', '输出目录（pic 路径的基准目录）')
  .action(uploadPicsCommand);

program.parse();
