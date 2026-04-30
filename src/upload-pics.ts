import * as path from 'path';
import * as fs from 'fs';
import { UploadPicsOptions } from './types';
import { loadDatabase, saveDatabase, updateBookPicUrl } from './database';
import { compressImage, cleanupTemp } from './uploader';
import { QiniuUploader } from './uploaders/qiniu';

export async function uploadPicsCommand(options: UploadPicsOptions): Promise<void> {
  const dbPath = path.resolve(options.db);
  const outputDir = path.resolve(options.output);

  if (!fs.existsSync(dbPath)) {
    console.error(`数据库文件不存在: ${dbPath}`);
    process.exit(1);
  }

  const db = loadDatabase(dbPath);
  const uploader = new QiniuUploader();

  const pending = db.books.filter((b) => !b.picUrl && b.pic);
  const skipped = db.books.length - pending.length;

  console.log(`共 ${db.books.length} 本书籍，${skipped} 本已有 picUrl 跳过，${pending.length} 本待上传`);

  if (pending.length === 0) {
    console.log('没有需要上传的图片');
    return;
  }

  let successCount = 0;
  let failCount = 0;
  const failedBooks: string[] = [];

  for (let i = 0; i < pending.length; i++) {
    const book = pending[i];
    const localPicPath = path.join(outputDir, book.pic);

    console.log(`[${i + 1}/${pending.length}] ${book.name}`);

    if (!fs.existsSync(localPicPath)) {
      console.error(`  文件不存在: ${localPicPath}`);
      failCount++;
      failedBooks.push(book.name);
      continue;
    }

    let tmpFile: string | null = null;
    try {
      tmpFile = await compressImage(localPicPath);
      const remoteKey = `books-tidy/${book.id}.jpg`;
      const url = await uploader.upload(tmpFile, remoteKey);

      updateBookPicUrl(db, book.id, url);
      successCount++;
      console.log(`  ✓ ${url}`);

      if ((i + 1) % 5 === 0) {
        saveDatabase(dbPath, db);
        console.log('  (已自动保存)');
      }
    } catch (err) {
      failCount++;
      failedBooks.push(book.name);
      console.error(`  ✗ 上传失败: ${(err as Error).message}`);
    } finally {
      if (tmpFile) {
        cleanupTemp(tmpFile);
      }
    }
  }

  saveDatabase(dbPath, db);

  console.log('\n--- 上传完成 ---');
  console.log(`成功: ${successCount} | 失败: ${failCount} | 跳过: ${skipped}`);
  if (failedBooks.length > 0) {
    console.log(`失败列表: ${failedBooks.join(', ')}`);
  }
}
