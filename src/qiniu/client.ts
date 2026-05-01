import * as qiniu from 'qiniu';
import { qiniu as qiniuConfig } from '../config';

const ZONE_MAP: Record<string, qiniu.conf.Zone> = {
  z0: qiniu.zone.Zone_z0,
  z1: qiniu.zone.Zone_z1,
  z2: qiniu.zone.Zone_z2,
  na0: qiniu.zone.Zone_na0,
  as0: qiniu.zone.Zone_as0,
};

let macInstance: qiniu.auth.digest.Mac | null = null;
let configInstance: qiniu.conf.Config | null = null;

export function getMac(): qiniu.auth.digest.Mac {
  if (!macInstance) {
    const accessKey = qiniuConfig.accessKey;
    const secretKey = qiniuConfig.secretKey;
    if (!accessKey || !secretKey) {
      throw new Error('缺少环境变量: QINIU_ACCESS_KEY, QINIU_SECRET_KEY');
    }
    macInstance = new qiniu.auth.digest.Mac(accessKey, secretKey);
  }
  return macInstance;
}

export function getConfig(): qiniu.conf.Config {
  if (!configInstance) {
    configInstance = new qiniu.conf.Config();
    configInstance.zone = ZONE_MAP[qiniuConfig.zone] || qiniu.zone.Zone_z0;
  }
  return configInstance;
}

export function getBucketManager(): qiniu.rs.BucketManager {
  return new qiniu.rs.BucketManager(getMac(), getConfig());
}
