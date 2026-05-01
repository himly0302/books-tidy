import * as path from 'path';
import * as fs from 'fs';
import ExcelJS from 'exceljs';
import { loadDatabase } from './database';

const COLUMNS = [
  { header: '书名', key: 'name', width: 30 },
  { header: '作者', key: 'author', width: 20 },
  { header: '类型', key: 'type', width: 8 },
  { header: '百度云盘', key: 'bd_link', width: 50 },
  { header: '添加时间', key: 'addedAt', width: 12 },
];

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

export async function exportExcelCommand(options: { db: string }): Promise<void> {
  const dbPath = path.resolve(options.db);
  if (!fs.existsSync(dbPath)) {
    console.error(`数据库文件不存在: ${dbPath}`);
    process.exit(1);
  }

  const db = loadDatabase(dbPath);

  const typeMap = new Map<string, typeof db.books>();
  for (const book of db.books) {
    const list = typeMap.get(book.type) || [];
    list.push(book);
    typeMap.set(book.type, list);
  }

  const workbook = new ExcelJS.Workbook();

  for (const [type, books] of typeMap) {
    const sheet = workbook.addWorksheet(type);
    sheet.columns = COLUMNS;

    for (const book of books) {
      sheet.addRow({
        name: book.name,
        author: book.author,
        type: book.type,
        bd_link: book.bd_link || '',
        addedAt: formatDate(book.addedAt),
      });
    }
  }

  const resultDir = path.resolve(__dirname, '..', 'result');
  fs.mkdirSync(resultDir, { recursive: true });

  const today = new Date();
  const dateStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('');
  const fileName = `${dateStr}-${db.books.length}.xlsx`;
  const filePath = path.join(resultDir, fileName);

  await workbook.xlsx.writeFile(filePath);

  console.log(`已生成: result/${fileName}`);
  console.log(`共 ${db.books.length} 条，${typeMap.size} 个类型:`);
  for (const [type, books] of typeMap) {
    console.log(`  ${type}: ${books.length} 条`);
  }
}
