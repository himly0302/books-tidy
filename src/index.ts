#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import { tidyCommand } from './tidy';
import { analyzeCommand } from './analyze';
import { uploadPicsCommand } from './upload-pics';
import { listBucketsCommand, listFilesCommand, deleteBucketCommand } from './qiniu-manage';

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

const qiniuCmd = program.command('qiniu').description('七牛云空间管理');

qiniuCmd
  .command('buckets')
  .description('列出所有存储空间')
  .action(listBucketsCommand);

qiniuCmd
  .command('files')
  .description('列出空间内文件')
  .requiredOption('--bucket <name>', '空间名称')
  .option('--prefix <prefix>', '文件前缀过滤')
  .action(listFilesCommand);

qiniuCmd
  .command('delete-bucket')
  .description('删除存储空间（先清空文件再删除空间）')
  .requiredOption('--bucket <name>', '空间名称')
  .action(deleteBucketCommand);

program.parse();
