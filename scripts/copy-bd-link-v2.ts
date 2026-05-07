import * as path from 'path';
import * as fs from 'fs';
import { loadDatabase, saveDatabase } from '../src/database';

const SOURCE_DB = path.resolve('E:/ItWorks/books-tidy/docs/books.json');
const TARGET_DB = path.resolve('D:/BaiduNetdiskDownload/图书合集_done/books.json');

const sourceDb = loadDatabase(SOURCE_DB);

const bdLinkMap = new Map<string, string>();
for (const book of sourceDb.books) {
  if (book.sourceFolder && book.bd_link) {
    bdLinkMap.set(book.sourceFolder, book.bd_link);
  }
}

console.log(`来源中共 ${bdLinkMap.size} 条 bd_link 记录`);

const targetDb = loadDatabase(TARGET_DB);

let matched = 0;
let unmatched = 0;

for (const book of targetDb.books) {
  const bdLink = bdLinkMap.get(book.sourceFolder);
  if (bdLink) {
    book.bd_link = bdLink;
    matched++;
  } else {
    unmatched++;
  }
}

saveDatabase(TARGET_DB, targetDb);

console.log(`匹配完成: ${matched} 条成功, ${unmatched} 条未匹配 (共 ${targetDb.books.length} 条)`);
console.log(`已保存到: ${TARGET_DB}`);
