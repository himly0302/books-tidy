import * as qiniu from 'qiniu';
import { getBucketManager } from './client';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function listPrefixAll(bucket: string, prefix?: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const manager = getBucketManager();
    const allKeys: string[] = [];

    function fetchPage(marker?: string) {
      const options: Record<string, unknown> = { limit: 1000 };
      if (prefix) options.prefix = prefix;
      if (marker) options.marker = marker;

      manager.listPrefix(bucket, options, (err, respBody, respInfo) => {
        if (err) {
          reject(err);
          return;
        }
        if (respInfo.statusCode !== 200) {
          reject(new Error(`列出文件失败: ${respInfo.statusCode} ${JSON.stringify(respBody)}`));
          return;
        }
        const items: Array<{ key: string }> = respBody.items || [];
        for (const item of items) {
          allKeys.push(item.key);
        }
        if (respBody.marker) {
          fetchPage(respBody.marker);
        } else {
          resolve(allKeys);
        }
      });
    }

    fetchPage();
  });
}

export async function listBuckets(): Promise<string[]> {
  const manager = getBucketManager();
  const result = await manager.listBucket();
  return result.data as unknown as string[];
}

export async function listFiles(bucket: string, prefix?: string): Promise<string[]> {
  return listPrefixAll(bucket, prefix);
}

export async function batchDeleteFiles(bucket: string, keys: string[]): Promise<void> {
  if (keys.length === 0) return;

  const manager = getBucketManager();
  const batchSize = 1000;

  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    const operations = batch.map((key) => qiniu.rs.deleteOp(bucket, key));

    await new Promise<void>((resolve, reject) => {
      manager.batch(operations, (err, respBody, respInfo) => {
        if (err) {
          reject(err);
          return;
        }
        if (respInfo.statusCode !== 200) {
          reject(new Error(`批量删除失败: ${respInfo.statusCode} ${JSON.stringify(respBody)}`));
          return;
        }
        resolve();
      });
    });

    console.log(`  已删除 ${Math.min(i + batchSize, keys.length)}/${keys.length} 个文件`);
    if (i + batchSize < keys.length) {
      await sleep(500);
    }
  }
}

export async function deleteBucket(bucket: string): Promise<void> {
  const manager = getBucketManager();
  await manager.deleteBucket(bucket);
}
