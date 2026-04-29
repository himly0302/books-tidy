# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指引。

## 项目概述

Books Tidy 是一个 AI 驱动的 CLI 工具，用于扫描书籍文件夹目录，通过 AI 模型（ModelScope API，OpenAI 兼容的 chat completions 格式）提取元数据（书名、作者、类型），然后将文件复制并整理到按类型分类的目录中，同时规范化命名。工具维护一个 JSON 数据库记录所有已处理的书籍。

## 命令

```bash
npm run dev -- tidy --input <目录> --output <目录>    # 完整流程：扫描 + AI 分析 + 整理 + 保存数据库
npm run dev -- analyze --input <目录>                  # 预览模式：仅扫描 + 分析
npm run build                                         # 编译 TypeScript 到 dist/
npm start -- tidy --input <目录> --output <目录>      # 运行编译后的 JS
```

## 架构

线性流水线：**扫描 → AI 分析 → 整理 → 存储**

- `src/index.ts` — CLI 入口（使用 Commander，包含 `tidy` 和 `analyze` 子命令）
- `src/scanner.ts` — 同步文件系统扫描器；读取子目录，递归查找图片文件
- `src/analyzer.ts` — 将所有文件夹名一次性批量发送给 AI API；包含重试逻辑（3 次尝试）和 JSON 响应解析（支持 markdown 代码块提取）
- `src/organizer.ts` — 将文件复制到 `{output}/{类型}/{书名}/` 结构；将首张图片重命名为 `{md5(书名)[:8]}.ext`
- `src/database.ts` — JSON 持久化（`books.json`）；将新条目合并到已有数据库
- `src/tidy.ts` — 编排完整 tidy 流程（扫描 → 分析 → 整理 → 保存）
- `src/analyze.ts` — 编排预览流程（仅扫描 → 分析）
- `src/types.ts` — 接口定义：`BookRaw`、`BookInfo`、`BooksDatabase`、`AIAnalysisResult` 及选项类型

## 关键模式

- 除 AI API 异步调用外，所有文件系统操作均为同步
- AI 调用采用批量方式：一次性发送所有文件夹名（非逐本调用）
- 文件为复制（非移动）到输出目录
- 图片命名使用 MD5 哈希截取前 8 位十六进制字符
- AI 提示词为中文，指导模型清洗书名（去除营销前缀、卷册标注）、仅保留主要作者、分类到 17 种类型

## 环境变量

需在 `.env` 中配置（参考 `.env.example`）：
- `AI_BASE_URL` — AI API 基础 URL
- `AI_API_KEY` — API 密钥
- `AI_MODEL` — 模型名称（如 `ZhipuAI/GLM-5.1`）

## 备注

- TypeScript 严格模式，ES2020 目标，CommonJS 模块
- 尚未配置测试框架和代码检查工具
- `upload-pics` 命令已规划但未实现
- `output/` 目录已加入 gitignore（存放生成的结果）
