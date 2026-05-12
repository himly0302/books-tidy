import * as path from 'path';
import * as fs from 'fs';
import { loadDatabase } from './database';

export async function generateDataCommand(options: { dir: string }): Promise<void> {
  const dir = path.resolve(options.dir);
  const dbPath = path.join(dir, 'books.json');
  const outputDir = path.join(dir, 'assets', 'resource-shop', 'configs');

  if (!fs.existsSync(dbPath)) {
    console.error(`数据库文件不存在: ${dbPath}`);
    process.exit(1);
  }

  const db = loadDatabase(dbPath);
  if (db.books.length === 0) {
    console.log('数据库为空，无数据可生成');
    return;
  }

  // 按 type 分组
  const typeMap = new Map<string, typeof db.books>();
  for (const book of db.books) {
    const books = typeMap.get(book.type) || [];
    books.push(book);
    typeMap.set(book.type, books);
  }

  // 创建输出目录
  fs.mkdirSync(outputDir, { recursive: true });

  // 生成分类型 JSON 文件
  for (const [type, books] of typeMap) {
    const filePath = path.join(outputDir, `${type}.json`);
    fs.writeFileSync(filePath, JSON.stringify(books, null, 2), 'utf-8');
    console.log(`  ${type}: ${books.length} 本`);
  }

  // 生成 index.json（按 count 降序）
  const index = Array.from(typeMap.entries())
    .map(([type, books]) => ({ type, count: books.length }))
    .sort((a, b) => b.count - a.count);
  fs.writeFileSync(
    path.join(outputDir, 'index.json'),
    JSON.stringify(index, null, 2),
    'utf-8',
  );

  console.log(`\n共 ${typeMap.size} 个类型，${db.books.length} 本书`);
  console.log(`数据已生成到: ${outputDir}`);
}
