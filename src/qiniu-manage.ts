import * as readline from 'readline';
import { listBuckets, listFiles, batchDeleteFiles, deleteBucket } from './qiniu/bucket-manager';

function askConfirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

export async function listBucketsCommand() {
  try {
    const buckets = await listBuckets();
    if (buckets.length === 0) {
      console.log('没有找到任何存储空间');
      return;
    }
    console.log(`共 ${buckets.length} 个存储空间：`);
    for (const name of buckets) {
      console.log(`  - ${name}`);
    }
  } catch (err) {
    console.error(`列出空间失败: ${(err as Error).message}`);
    process.exit(1);
  }
}

export async function listFilesCommand(options: { bucket: string; prefix?: string }) {
  try {
    console.log(`正在列出空间 "${options.bucket}" 的文件...`);
    const files = await listFiles(options.bucket, options.prefix);
    if (files.length === 0) {
      console.log('空间内没有文件');
      return;
    }
    console.log(`共 ${files.length} 个文件：`);
    for (const key of files) {
      console.log(`  ${key}`);
    }
  } catch (err) {
    console.error(`列出文件失败: ${(err as Error).message}`);
    process.exit(1);
  }
}

export async function deleteBucketCommand(options: { bucket: string }) {
  try {
    console.log(`正在获取空间 "${options.bucket}" 的文件列表...`);
    const files = await listFiles(options.bucket);
    console.log(`空间内共 ${files.length} 个文件`);

    const confirmed = await askConfirm(
      `确认删除空间 "${options.bucket}" 及其全部 ${files.length} 个文件？此操作不可恢复 (y/N): `,
    );
    if (!confirmed) {
      console.log('已取消');
      return;
    }

    if (files.length > 0) {
      console.log('正在批量删除文件...');
      await batchDeleteFiles(options.bucket, files);
    }

    console.log('正在删除空间...');
    await deleteBucket(options.bucket);
    console.log(`空间 "${options.bucket}" 已删除`);
  } catch (err) {
    console.error(`删除空间失败: ${(err as Error).message}`);
    process.exit(1);
  }
}
