import 'dotenv/config';

function intEnv(key: string, fallback: number): number {
  const val = parseInt(process.env[key] || '', 10);
  return isNaN(val) ? fallback : val;
}

function floatEnv(key: string, fallback: number): number {
  const val = parseFloat(process.env[key] || '');
  return isNaN(val) ? fallback : val;
}

// AI 分析配置
export const ai = {
  get baseUrl() { return process.env.AI_BASE_URL; },
  get apiKey() { return process.env.AI_API_KEY; },
  get model() { return process.env.AI_MODEL; },
  get concurrency() { return Math.max(1, intEnv('AI_CONCURRENCY', 3)); },
  get verify() { return process.env.AI_VERIFY !== 'false'; },
  get batchSize() { return intEnv('AI_BATCH_SIZE', 60); },
  get temperature() { return floatEnv('AI_TEMPERATURE', 0.1); },
  get maxRetries() { return intEnv('AI_MAX_RETRIES', 3); },
  get retryDelay() { return intEnv('AI_RETRY_DELAY', 2000); },
};

// 图片上传配置
export const upload = {
  get maxWidth() { return intEnv('UPLOAD_MAX_WIDTH', 1200); },
  get jpegQuality() { return intEnv('UPLOAD_JPEG_QUALITY', 80); },
};

// 七牛云配置
export const qiniu = {
  get accessKey() { return process.env.QINIU_ACCESS_KEY; },
  get secretKey() { return process.env.QINIU_SECRET_KEY; },
  get bucket() { return process.env.QINIU_BUCKET; },
  get domain() { return process.env.QINIU_DOMAIN; },
  get zone() { return process.env.QINIU_ZONE || 'z0'; },
};
