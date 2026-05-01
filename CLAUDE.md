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

- `src/index.ts` — CLI 入口（使用 Commander，包含 `tidy`、`analyze`、`upload-pics`、`import-links`、`export-excel`、`merge`、`qiniu` 子命令）
- `src/scanner.ts` — 同步文件系统扫描器；读取子目录，递归查找图片文件
- `src/config.ts` — 集中管理所有环境变量配置（AI、七牛云、图片上传），提供默认值
- `src/analyzer.ts` — 将文件夹名分批发送给 AI API，多批次并发执行；包含重试逻辑和 JSON 响应解析（支持 markdown 代码块提取）
- `src/organizer.ts` — 将文件复制到 `{output}/{类型}/{书名}/` 结构；将首张图片重命名为 `{md5(书名)[:8]}.ext`
- `src/database.ts` — JSON 持久化（`books.json`）；将新条目合并到已有数据库；本地去重（`filterDuplicateBooks`）和名称标准化（`normalizeBookName`）
- `src/tidy.ts` — 编排完整 tidy 流程（扫描 → 去重过滤 → 分析 → 整理 → 保存 → 记录全局历史）
- `src/history.ts` — 全局历史记录管理（`~/.books-tidy/history.json`）；跨目录去重
- `src/analyze.ts` — 编排预览流程（仅扫描 → 分析）
- `src/import-links.ts` — `import-links` 命令编排器；从 CSV 文件导入百度网盘分享链接，按 type+name 匹配并更新 bd_link 字段；生成 result/ 目录副本
- `src/export-excel.ts` — `export-excel` 命令编排器；按类型分 sheet 生成 Excel 文件（exceljs），输出到 result/ 目录
- `src/merge.ts` — `merge` 命令编排器；按 sourceFolder 匹配将新数据的 brief 字段合并到旧数据
- `src/types.ts` — 接口定义：`BookRaw`、`BookInfo`（含 bd_link、brief）、`BooksDatabase`、`AIAnalysisResult`（含 brief）及选项类型
- `src/qiniu/client.ts` — 七牛云共享客户端（认证 + 配置，单例模式）
- `src/qiniu/bucket-manager.ts` — 七牛云空间管理操作（列空间、列文件、批量删除、删空间）
- `src/qiniu-manage.ts` — `qiniu` 命令编排器（buckets / files / delete-bucket 子命令）

## 关键模式

- 除 AI API 异步调用外，所有文件系统操作均为同步
- AI 调用采用批量方式：分批发送文件夹名，多批次并发执行（默认并发数 3）
- 文件为复制（非移动）到输出目录
- 图片命名使用 MD5 哈希截取前 8 位十六进制字符
- AI 提示词为中文，指导模型清洗书名（去除营销前缀、卷册标注）、仅保留主要作者、分类到 17 种类型、生成一句话简介（brief 20-50 字）
- 核查模式（`AI_VERIFY`，默认开启）：Prompt 中追加作者信息核查指令，可设为 `false` 关闭
- 两级去重策略：本地去重（`books.json` 中 `sourceFolder` 精确匹配）→ 全局历史去重（`~/.books-tidy/history.json`）→ 名称级去重（`normalizeBookName` 标准化后匹配，兜底旧记录和 AI 名称不一致）

## 环境变量

所有配置通过 `src/config.ts` 统一管理，在 `.env` 中设置（参考 `.env.example`）：

- **AI 分析**（必填：`AI_BASE_URL`、`AI_API_KEY`、`AI_MODEL`）
  - `AI_CONCURRENCY` — 并发数（默认 3）
  - `AI_VERIFY` — 核查模式（默认开启，设 `false` 关闭）
  - `AI_BATCH_SIZE` — 每批处理数量（默认 60）
  - `AI_TEMPERATURE` — 采样温度（默认 0.1）
  - `AI_MAX_RETRIES` — 最大重试次数（默认 3）
  - `AI_RETRY_DELAY` — 重试间隔毫秒（默认 2000）
- **图片上传**
  - `UPLOAD_MAX_WIDTH` — 最大宽度像素（默认 1200）
  - `UPLOAD_JPEG_QUALITY` — JPEG 压缩质量（默认 80）
- **七牛云**（必填：`QINIU_ACCESS_KEY`、`QINIU_SECRET_KEY`、`QINIU_BUCKET`、`QINIU_DOMAIN`）
  - `QINIU_ZONE` — 存储区域（默认 z0）

## 备注

- TypeScript 严格模式，ES2020 目标，CommonJS 模块
- 尚未配置测试框架和代码检查工具
- `upload-pics` 命令用于批量上传书籍封面到七牛云图床
- `qiniu` 命令组用于七牛云空间管理（列出空间、列出文件、删除空间）
- `output/` 目录已加入 gitignore（存放生成的结果）
- `result/` 目录已加入 gitignore（存放数据库副本）
