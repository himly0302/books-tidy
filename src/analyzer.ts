import { BookRaw, AIAnalysisResult } from './types';
import { ai } from './config';

export async function analyzeBooks(books: BookRaw[]): Promise<AIAnalysisResult[]> {
  if (!ai.baseUrl || !ai.apiKey || !ai.model) {
    throw new Error('Missing AI configuration. Set AI_BASE_URL, AI_API_KEY, AI_MODEL in .env');
  }

  const batches: BookRaw[][] = [];
  for (let i = 0; i < books.length; i += ai.batchSize) {
    batches.push(books.slice(i, i + ai.batchSize));
  }

  if (batches.length <= 1) {
    return analyzeBatch(batches[0], ai.baseUrl, ai.apiKey, ai.model);
  }

  const concurrency = ai.concurrency;
  console.log(`分析中 (共 ${batches.length} 批，并发 ${concurrency})...`);

  const allResults: AIAnalysisResult[][] = new Array(batches.length);
  let nextIndex = 0;

  const worker = async (): Promise<void> => {
    while (nextIndex < batches.length) {
      const idx = nextIndex++;
      const results = await analyzeBatch(batches[idx], ai.baseUrl!, ai.apiKey!, ai.model!);
      allResults[idx] = results;
      console.log(`  分析完成 (${idx + 1}/${batches.length})`);
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, batches.length) }, () => worker());
  await Promise.all(workers);

  return allResults.flat();
}

async function analyzeBatch(
  books: BookRaw[],
  baseUrl: string,
  apiKey: string,
  model: string,
): Promise<AIAnalysisResult[]> {
  const folderNames = books.map(b => b.folderName);
  const prompt = buildPrompt(folderNames);

  for (let attempt = 1; attempt <= ai.maxRetries; attempt++) {
    const url = baseUrl.replace(/\/+$/, '');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: ai.temperature,
      }),
    });

    if (!response.ok) {
      if (response.status === 429 && attempt < ai.maxRetries) {
        const delay = ai.retryDelay * attempt;
        console.log(`  API 速率限制，${delay / 1000}s 后重试 (${attempt}/${ai.maxRetries})...`);
        await sleep(delay);
        continue;
      }
      const text = await response.text();
      throw new Error(`AI API error ${response.status}: ${text}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content ?? '';

    if (!content) {
      if (attempt < ai.maxRetries) {
        console.log(`  AI returned empty response, retrying (${attempt}/${ai.maxRetries})...`);
        await sleep(ai.retryDelay);
        continue;
      }
      throw new Error(`Empty AI response after ${ai.maxRetries} retries.`);
    }

    return parseAIResponse(content, folderNames);
  }

  throw new Error('Unexpected: exhausted retries without returning or throwing');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildPrompt(folderNames: string[]): string {
  const list = folderNames.map((n, i) => `${i + 1}. ${n}`).join('\n');
  const verifyEnabled = ai.verify;

  let rules = `你是一个专业的书籍信息提取助手。从以下书籍文件夹名称中提取每本书的书名、作者、分类和简介。

文件夹列表：
${list}

提取规则：
1. name（书名）：
   - 去除营销用语前缀（如"2000万人都学过："、"畅销XXX万册："等）
   - 去除套数标注（如"（套装共13册）"、"(全X册)"等）
   - 去除副标题中多余的分隔内容，只保留核心书名
   - 保留系列名称中的关键部分
2. author（作者）：
   - 只保留第一（主）作者姓名
   - 去除"等""等著""等编著""主编""编"等后缀
3. type（分类）：
   - 必须综合 name 和 author 内容整体判断
   - 优先选择最贴切的分类，确实无法归类才用"其他"
   - 分类参考：文学、历史、哲学、经济、管理、科技、教育、艺术、政治、社会、心理、传记、医学、法律、军事、学术、其他
4. brief（简介）：
   - 用一句话概括这本书的核心内容或主题，20-50字
   - 不要使用"本书""这本书"等指代词`;

  if (verifyEnabled) {
    rules += `

5. 核查要求：
   - 仔细核对文件夹名中的作者姓名与分析结果是否一致
   - 如果文件夹名包含明确的作者信息但分析结果有误，修正为正确值`;
  }

  rules += `

请严格按以下 JSON 数组格式返回，不要包含其他文字：
[
  {"name": "书名", "author": "作者", "type": "分类", "brief": "简介"},
  ...
]`;

  return rules;
}

function parseAIResponse(content: string, folderNames: string[]): AIAnalysisResult[] {
  // Extract JSON from markdown code blocks if present
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();

  let parsed: AIAnalysisResult[];
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse AI response as JSON:\n${content}`);
  }

  if (!Array.isArray(parsed) || parsed.length !== folderNames.length) {
    throw new Error(
      `AI returned ${Array.isArray(parsed) ? parsed.length : 0} results, expected ${folderNames.length}`
    );
  }

  return parsed.map((item, i) => ({
    name: item.name || folderNames[i],
    author: item.author || '未知',
    type: item.type || '其他',
    brief: item.brief || '',
  }));
}
