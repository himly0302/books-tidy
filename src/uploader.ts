import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import sharp from 'sharp';
import { upload } from './config';

export async function compressImage(filePath: string): Promise<string> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'books-tidy-'));
  const tmpFile = path.join(tmpDir, `compressed-${Date.now()}.jpg`);

  await sharp(filePath, { failOn: 'none' })
    .rotate()
    .resize({ width: upload.maxWidth, withoutEnlargement: true })
    .jpeg({ quality: upload.jpegQuality, mozjpeg: true })
    .toFile(tmpFile);

  return tmpFile;
}

export function cleanupTemp(filePath: string): void {
  const dir = path.dirname(filePath);
  if (dir.startsWith(os.tmpdir())) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
