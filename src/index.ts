#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import { tidyCommand } from './tidy';
import { analyzeCommand } from './analyze';
import { importLinksCommand } from './import-links';
import { exportExcelCommand } from './export-excel';
import { mergeCommand } from './merge';
import { generateDataCommand } from './generate-data';

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

program.command('import-links')
  .description('从 CSV 文件导入百度网盘分享链接到数据库')
  .requiredOption('--dir <directory>', '包含 books.json 和 CSV 文件的目录')
  .action(importLinksCommand);

program.command('export-excel')
  .description('按类型分 sheet 导出 Excel 文件')
  .requiredOption('--db <file>', 'books.json 数据库文件路径')
  .action(exportExcelCommand);

program.command('merge')
  .description('将新数据中的 brief 字段合并到旧数据')
  .requiredOption('--old <file>', '旧数据 JSON 文件（基准）')
  .requiredOption('--new <file>', '新数据 JSON 文件（来源 brief）')
  .action(mergeCommand);

program.command('generate-data')
  .description('生成前端所需的分类型 JSON 数据')
  .requiredOption('--db <file>', 'books.json 数据库文件路径')
  .action(generateDataCommand);

program.parse();
