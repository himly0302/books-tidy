import * as qiniu from 'qiniu';
import { ImageUploader } from '../types';
import { qiniu as qiniuConfig } from '../config';

const ZONE_MAP: Record<string, qiniu.conf.Zone> = {
  z0: qiniu.zone.Zone_z0,
  z1: qiniu.zone.Zone_z1,
  z2: qiniu.zone.Zone_z2,
  na0: qiniu.zone.Zone_na0,
  as0: qiniu.zone.Zone_as0,
};

export class QiniuUploader implements ImageUploader {
  private mac: qiniu.auth.digest.Mac;
  private bucket: string;
  private domain: string;
  private config: qiniu.conf.Config;

  constructor() {
    const accessKey = qiniuConfig.accessKey;
    const secretKey = qiniuConfig.secretKey;
    const bucket = qiniuConfig.bucket;
    const domain = qiniuConfig.domain;
    const zone = qiniuConfig.zone;

    if (!accessKey || !secretKey || !bucket || !domain) {
      throw new Error(
        '缺少七牛云配置，请设置环境变量：QINIU_ACCESS_KEY, QINIU_SECRET_KEY, QINIU_BUCKET, QINIU_DOMAIN',
      );
    }

    this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    this.bucket = bucket;
    this.domain = domain.replace(/\/+$/, '');
    this.config = new qiniu.conf.Config();
    this.config.zone = ZONE_MAP[zone] || qiniu.zone.Zone_z0;
  }

  async upload(localFilePath: string, remoteKey: string): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const url = await this.doUpload(localFilePath, remoteKey);
        return url;
      } catch (err) {
        lastError = err as Error;
        console.error(`  上传失败（第 ${attempt}/${maxRetries} 次）: ${lastError.message}`);
        if (attempt < maxRetries) {
          await this.sleep(2000);
        }
      }
    }

    throw lastError!;
  }

  private doUpload(localFilePath: string, remoteKey: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const putPolicy = new qiniu.rs.PutPolicy({ scope: `${this.bucket}:${remoteKey}` });
      const uploadToken = putPolicy.uploadToken(this.mac);
      const formUploader = new qiniu.form_up.FormUploader(this.config);
      const putExtra = new qiniu.form_up.PutExtra();

      formUploader.putFile(
        uploadToken,
        remoteKey,
        localFilePath,
        putExtra,
        (respErr, respBody, respInfo) => {
          if (respErr) {
            reject(respErr);
            return;
          }
          if (respInfo.statusCode === 200) {
            resolve(`${this.domain}/${remoteKey}`);
          } else {
            reject(new Error(`上传失败: ${respInfo.statusCode} ${JSON.stringify(respBody)}`));
          }
        },
      );
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
