import * as path from 'path';
import * as fs from 'fs';
import { loadDatabase, saveDatabase } from './database';

export function mergeCommand(options: { old: string; new: string }): void {
  const oldPath = path.resolve(options.old);
  const newPath = path.resolve(options.new);

  if (!fs.existsSync(oldPath)) {
    console.error(`旧数据文件不存在: ${oldPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(newPath)) {
    console.error(`新数据文件不存在: ${newPath}`);
    process.exit(1);
  }

  const oldDb = loadDatabase(oldPath);
  const newDb = loadDatabase(newPath);

  const newMap = new Map<string, string>();
  for (const book of newDb.books) {
    if (book.brief && book.sourceFolder) {
      newMap.set(book.sourceFolder, book.brief);
    }
  }

  let matched = 0;
  let skipped = 0;

  for (const book of oldDb.books) {
    const brief = newMap.get(book.sourceFolder);
    if (brief) {
      book.brief = brief;
      matched++;
    } else {
      skipped++;
    }
  }

  saveDatabase(oldPath, oldDb);

  console.log(`合并完成: ${matched} 条匹配, ${skipped} 条未匹配`);
  console.log(`已保存到: ${oldPath}`);
}
