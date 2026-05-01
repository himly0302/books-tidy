# AI 分析增强（核查+简介） - 功能开发文档

> 生成时间：2026-05-01
> 基于项目：books-tidy

---

## 开发上下文

**相关技术栈**：TypeScript、AI API（OpenAI 兼容格式）
**关联模块**：analyzer.ts（`src/analyzer.ts`）、types.ts（`src/types.ts`）、database.ts（`src/database.ts`）
**代码风格**：同步为主，AI 调用异步，中文提示词

---

## 开发方案

### 要实现什么

1. **核查模式**：AI 分析时额外要求核实书名/作者准确性，有误则修正（通过环境变量 `AI_VERIFY` 控制，默认开启）
2. **书籍简介**：AI 分析时同步生成 `brief` 字段，保存到 BookInfo

### 与现有功能的关系

- 核查和简介均通过增强现有 AI Prompt 实现，**不增加额外 API 调用**，零成本
- 集成位置：`src/analyzer.ts` 的 `buildPrompt` 函数
- 数据流：AIAnalysisResult 新增 `brief` → database.ts 的 `addBooks` 写入 BookInfo

### 新增依赖

无。

### 需要修改的文件

```
src/types.ts       # AIAnalysisResult 新增 brief 字段；BookInfo 新增 brief 字段
src/analyzer.ts    # Prompt 增加核查指令和简介要求；解析新增 brief；环境变量控制核查
src/database.ts    # addBooks 写入 brief 到 BookInfo
```

---

## 实施步骤

**步骤 1：类型扩展**

- [ ] 修改 `src/types.ts`：AIAnalysisResult 新增 `brief: string`；BookInfo 新增 `brief: string`

```typescript
export interface AIAnalysisResult {
  name: string;
  author: string;
  type: string;
  brief: string;
}

export interface BookInfo {
  // ...existing fields
  brief: string;
}
```

**步骤 2：增强 AI Prompt**

- [ ] 修改 `src/analyzer.ts:buildPrompt`：

在现有提取规则之后追加：

```
4. brief（简介）：
   - 用一句话概括这本书的核心内容或主题，20-50字
   - 不要使用"本书""这本书"等指代词
```

当 `AI_VERIFY=true`（默认）时，额外追加核查指令：

```
5. 核查要求（如文件夹名中的作者信息与分析结果不一致，以文件夹名中的信息为准修正作者）：
   - 仔细核对文件夹名中的作者姓名与分析结果是否一致
   - 如果文件夹名包含明确的作者信息但分析结果有误，修正为正确值
```

- [ ] 更新响应格式示例：

```
[{"name": "书名", "author": "作者", "type": "分类", "brief": "简介"}, ...]
```

**步骤 3：更新解析逻辑**

- [ ] 修改 `src/analyzer.ts:parseAIResponse`：新增 brief 兜底

```typescript
return parsed.map((item, i) => ({
  name: item.name || folderNames[i],
  author: item.author || '未知',
  type: item.type || '其他',
  brief: item.brief || '',
}));
```

**步骤 4：写入数据库**

- [ ] 修改 `src/database.ts:addBooks`：BookInfo 构造新增 `brief: analysis.brief`

**步骤 5：验收检查**

- [ ] 运行 `npm run dev -- analyze --input <目录>`，验证 AI 返回 brief 字段
- [ ] 设置 `AI_VERIFY=false`，验证核查指令不包含在 Prompt 中
- [ ] 运行 `npm run dev -- tidy`，验证 books.json 中包含 brief 字段
- [ ] 现有功能未被破坏

**步骤 6：文档更新与提交**

| 文档 | 需要更新 | 不需要更新 |
|------|----------|-----------|
| **CHANGELOG.md** | ✅ AI 分析增强 | - |
| **README.md** | - | ✅ 无新命令，用户无感 |
| **CLAUDE.md** | ✅ 新增环境变量、字段说明 | - |

**CLAUDE.md 更新清单**：

| CLAUDE.md section | 更新内容 |
|-------------------|---------|
| 环境变量 | 新增 `AI_VERIFY` 说明 |
| 关键模式 | AI 提示词说明新增 brief 和核查 |

**CHANGELOG.md 更新**（在 `## [Unreleased]` 下添加）：

```markdown
### Changed
- **AI 分析增强**：提取书名/作者时同步生成简介（brief），新增核查模式可修正作者信息
  - `AI_VERIFY` 环境变量控制核查模式（默认开启）
  - BookInfo 新增 `brief` 字段
  - 相关文件：`src/analyzer.ts`、`src/types.ts`、`src/database.ts`
```

**提交代码**：

```bash
git add src/types.ts src/analyzer.ts src/database.ts docs/features/ CHANGELOG.md CLAUDE.md
git commit -m "feat: AI 分析增强（核查+简介）"
```

**步骤 7：自检**

- [ ] 验收条件是否全部通过
- [ ] CHANGELOG.md 是否已更新
- [ ] CLAUDE.md 更新清单中的每一项是否都已执行
- [ ] "实施步骤"与"文件清单"是否一致
- [ ] 所有相关文件是否已提交

---

## 约束与风险

- **API 成本**：brief 和核查通过增强现有 Prompt 实现，不额外增加 API 调用次数。但 Prompt 变长会略微增加 token 消耗
- **兼容性**：`brief` 为必填字段（兜底为空字符串），`AI_VERIFY` 默认开启，对现有流程无破坏
- **简介质量**：取决于 AI 模型能力，一句话简介 20-50 字为合理范围
