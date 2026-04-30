import * as qiniu from 'qiniu';

const ZONE_MAP: Record<string, qiniu.conf.Zone> = {
  z0: qiniu.zone.Zone_z0,
  z1: qiniu.zone.Zone_z1,
  z2: qiniu.zone.Zone_z2,
  na0: qiniu.zone.Zone_na0,
  as0: qiniu.zone.Zone_as0,
};

let macInstance: qiniu.auth.digest.Mac | null = null;
let configInstance: qiniu.conf.Config | null = null;

function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`缺少环境变量: ${name}`);
  }
  return value;
}

export function getMac(): qiniu.auth.digest.Mac {
  if (!macInstance) {
    const accessKey = getEnvOrThrow('QINIU_ACCESS_KEY');
    const secretKey = getEnvOrThrow('QINIU_SECRET_KEY');
    macInstance = new qiniu.auth.digest.Mac(accessKey, secretKey);
  }
  return macInstance;
}

export function getConfig(): qiniu.conf.Config {
  if (!configInstance) {
    const zone = process.env.QINIU_ZONE || 'z0';
    configInstance = new qiniu.conf.Config();
    configInstance.zone = ZONE_MAP[zone] || qiniu.zone.Zone_z0;
  }
  return configInstance;
}

export function getBucketManager(): qiniu.rs.BucketManager {
  return new qiniu.rs.BucketManager(getMac(), getConfig());
}
