import * as path from 'path';
import * as fs from 'fs';
import { loadDatabase } from './database';
import { QiniuUploader } from './uploaders/qiniu';

export async function generateDataCommand(options: { db: string }): Promise<void> {
  const dbPath = path.resolve(options.db);
  const outputDir = path.resolve(__dirname, '..', 'result', 'configs');

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

  // 上传到七牛云
  console.log('\n--- 上传到七牛云 ---');
  const uploader = new QiniuUploader();
  const files = fs.readdirSync(outputDir).filter((f) => f.endsWith('.json'));

  let successCount = 0;
  let failCount = 0;
  const urlMap: Record<string, string> = {};

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    const localPath = path.join(outputDir, fileName);
    const remoteKey = `books-tidy/configs/${fileName}`;
    const keyName = fileName.replace('.json', '');

    try {
      const url = await uploader.upload(localPath, remoteKey);
      urlMap[keyName] = url;
      successCount++;
      console.log(`  [${i + 1}/${files.length}] ${fileName} -> ${url}`);
    } catch (err) {
      failCount++;
      console.error(`  [${i + 1}/${files.length}] ${fileName} 上传失败: ${(err as Error).message}`);
    }
  }

  // 保存 URL 映射到 result/configs.json
  const resultDir = path.resolve(__dirname, '..', 'result');
  fs.writeFileSync(
    path.join(resultDir, 'configs.json'),
    JSON.stringify(urlMap, null, 2),
    'utf-8',
  );

  console.log(`\n上传完成: 成功 ${successCount} | 失败 ${failCount}`);
  console.log(`URL 映射已保存到: ${path.join(resultDir, 'configs.json')}`);
}
