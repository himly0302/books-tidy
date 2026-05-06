import 'dotenv/config';

function intEnv(key: string, fallback: number): number {
  const val = parseInt(process.env[key] || '', 10);
  return isNaN(val) ? fallback : val;
}

function floatEnv(key: string, fallback: number): number {
  return parseFloat(process.env[key] || '') || fallback;
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
