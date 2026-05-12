import { BookRaw, CopyrightCheckResult } from './types';
import { ai } from './config';

export async function filterCopyrightedBooks(books: BookRaw[]): Promise<BookRaw[]> {
  if (!ai.copyrightFilter) {
    console.log('Copyright filter disabled.');
    return books;
  }

  if (!ai.baseUrl || !ai.apiKey || !ai.model) {
    throw new Error('Missing AI configuration. Set AI_BASE_URL, AI_API_KEY, AI_MODEL in .env');
  }

  const batchSize = ai.batchSize;
  const batches: BookRaw[][] = [];
  for (let i = 0; i < books.length; i += batchSize) {
    batches.push(books.slice(i, i + batchSize));
  }

  const allResults: CopyrightCheckResult[][] = new Array(batches.length);

  if (batches.length === 1) {
    allResults[0] = await checkBatch(batches[0]);
  } else {
    const concurrency = ai.concurrency;
    console.log(`版权过滤中 (共 ${batches.length} 批，并发 ${concurrency})...`);
    let nextIndex = 0;
    const worker = async () => {
      while (nextIndex < batches.length) {
        const idx = nextIndex++;
        allResults[idx] = await checkBatch(batches[idx]);
        console.log(`  版权过滤完成 (${idx + 1}/${batches.length})`);
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(concurrency, batches.length) }, () => worker())
    );
  }

  const results = allResults.flat();
  const publicDomain = results.filter(r => r.status === 'public_domain');
  const copyrighted = results.filter(r => r.status === 'copyrighted');
  const uncertain = results.filter(r => r.status === 'uncertain');

  console.log(`版权过滤结果: 非侵权 ${publicDomain.length}, 侵权 ${copyrighted.length}, 不确定 ${uncertain.length}`);

  const publicDomainNames = new Set(publicDomain.map(r => r.folderName));
  return books.filter(b => publicDomainNames.has(b.folderName));
}

async function checkBatch(books: BookRaw[]): Promise<CopyrightCheckResult[]> {
  const folderNames = books.map(b => b.folderName);
  const prompt = buildCopyrightPrompt(folderNames);

  for (let attempt = 1; attempt <= ai.maxRetries; attempt++) {
    const url = ai.baseUrl!.replace(/\/+$/, '');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ai.apiKey!}`,
      },
      body: JSON.stringify({
        model: ai.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      if (response.status === 429 && attempt < ai.maxRetries) {
        const delay = ai.retryDelay * attempt;
        console.log(`  版权过滤 API 速率限制，${delay / 1000}s 后重试 (${attempt}/${ai.maxRetries})...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      const text = await response.text();
      throw new Error(`Copyright filter API error ${response.status}: ${text}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content ?? '';

    if (!content) {
      if (attempt < ai.maxRetries) {
        console.log(`  版权过滤 AI 返回空响应，重试 (${attempt}/${ai.maxRetries})...`);
        await new Promise(r => setTimeout(r, ai.retryDelay));
        continue;
      }
      throw new Error(`Empty copyright filter response after ${ai.maxRetries} retries.`);
    }

    try {
      return parseCopyrightResponse(content, folderNames);
    } catch (e: any) {
      if (e.message?.startsWith('AI_COUNT_MISMATCH:') && attempt < ai.maxRetries) {
        const [, got, expected] = e.message.split(':');
        console.log(`  版权过滤 AI 返回 ${got} 条，期望 ${expected} 条，重试 (${attempt}/${ai.maxRetries})...`);
        await new Promise(r => setTimeout(r, ai.retryDelay));
        continue;
      }
      throw e;
    }
  }

  throw new Error('Unexpected: copyright filter exhausted retries');
}

function buildCopyrightPrompt(folderNames: string[]): string {
  const list = folderNames.map((n, i) => `${i + 1}. ${n}`).join('\n');
  return `你是一个版权判断助手。根据以下书籍文件夹名称，判断每本书是否属于公有领域（即版权已过期、可自由使用的资源）。

文件夹列表：
${list}

判断规则：
1. status（状态）：
   - "public_domain"：明确属于公有领域（如古籍、经典名著、作者去世超过50年的作品、开源/免费资源）
   - "copyrighted"：明确属于受版权保护的作品（如近年出版物、在世作者作品、商业出版物）
   - "uncertain"：无法确认是否属于公有领域
2. reason（原因）：简要说明判断依据，10-30字

注意：
- 中国法律规定作者去世后50年、合作作品最后去世作者后50年进入公有领域
- 当代出版物、翻译作品通常受版权保护
- 无法确认时，status 必须为 "uncertain"

请严格按以下 JSON 数组格式返回，不要包含其他文字：
[
  {"status": "public_domain/copyrighted/uncertain", "reason": "原因"},
  ...
]`;
}

function parseCopyrightResponse(content: string, folderNames: string[]): CopyrightCheckResult[] {
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();

  let parsed: any[];
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse copyright filter response as JSON:\n${content}`);
  }

  if (!Array.isArray(parsed) || parsed.length !== folderNames.length) {
    const count = Array.isArray(parsed) ? parsed.length : 0;
    throw new Error(`AI_COUNT_MISMATCH:${count}:${folderNames.length}`);
  }

  return parsed.map((item, i) => ({
    folderName: folderNames[i],
    status: ['public_domain', 'copyrighted', 'uncertain'].includes(item.status)
      ? item.status
      : 'uncertain',
    reason: item.reason || '',
  }));
}
