# Changelog

## [Unreleased]

### Added
- **图片资源本地化**：整理时自动将封面图片副本保存到 assets/books-shop/ 目录
  - 复用 BookInfo.picUrl 字段记录 assets 相对路径
  - 供阿里云 ECS 服务器直接提供图片访问
  - 相关文件：`src/organizer.ts`、`src/database.ts`
- **百度网盘链接导入**：新增 `import-links` 命令，从 CSV 文件批量导入分享链接
  - 自动解析与 books.json 同级的 CSV 文件（文件名=类型）
  - 按 type+name 匹配书籍，新增 bd_link 字段
  - 生成 result/ 目录副本，文件名格式 YYYYMMDD-{数量}.json
  - 相关文件：`src/import-links.ts`、`src/types.ts`
- **Excel 导出**：新增 `export-excel` 命令，按类型分 sheet 生成 Excel 文件
  - 每个 sheet 包含：书名、作者、类型、简介、百度云盘、添加时间
  - 输出到 result/YYYYMMDD-{数量}.xlsx
  - 相关文件：`src/export-excel.ts`
- **数据合并**：新增 `merge` 命令，按 sourceFolder 匹配将新数据的 brief 字段合并到旧数据
  - 旧数据保持为基准，仅追加 brief
  - 相关文件：`src/merge.ts`
- **生成前端数据**：新增 `generate-data` 命令，按类型拆分 JSON 数据
  - 输出 index.json（类型统计）和分类型 JSON 文件
  - 相关文件：`src/generate-data.ts`
- **侵权资源过滤**：扫描后自动过滤非公有领域资源，仅整理非侵权内容
  - AI 批量判断版权状态（public_domain / copyrighted / uncertain）
  - 无法确认的资源自动跳过（保守策略）
  - `AI_COPYRIGHT_FILTER` 环境变量控制开关（默认开启）
  - 同时影响 tidy 和 analyze 命令
  - 相关文件：`src/copyright-filter.ts`

### Changed
- **generate-data 输出目录调整**：输出从 `result/configs/` 改为 `{dir}/assets/books-shop/configs/`，与封面图片分开存放
  - CLI 选项从 `--db` 改为 `--dir`（与 import-links 一致）
  - 相关文件：`src/generate-data.ts`、`src/index.ts`
- **AI 分析增强**：提取书名/作者时同步生成简介（brief），新增核查模式可修正作者信息
  - `AI_VERIFY` 环境变量控制核查模式（默认开启）
  - BookInfo 新增 `brief` 字段
  - 相关文件：`src/analyzer.ts`、`src/types.ts`、`src/database.ts`
- **配置集中管理**：新增 `src/config.ts` 统一管理环境变量，提取 6 个硬编码常量为可配置项
  - 新增环境变量：`AI_BATCH_SIZE`、`AI_TEMPERATURE`、`AI_MAX_RETRIES`、`AI_RETRY_DELAY`、`UPLOAD_MAX_WIDTH`、`UPLOAD_JPEG_QUALITY`
  - 所有默认值不变，向后兼容
  - 相关文件：`src/config.ts`、`src/analyzer.ts`

### Fixed
- **整理数量与数据库记录不一致**：organizer 和 addBooks 去重逻辑对齐，名称级去重的书不再复制文件和封面
  - `addBooks` 返回 `acceptedIndices` 标识实际入库的书
  - `tidy.ts` 只整理和记录入库的书，避免 assets 图片多于 books.json 记录
  - AI 返回数量不匹配时自动重试
  - 相关文件：`src/database.ts`、`src/tidy.ts`、`src/analyzer.ts`
- **数据修正**：书籍文件夹无图片时，pic 字段置空而非生成不存在的路径
  - 相关文件：`src/database.ts`、`src/organizer.ts`

### Added
- **去重**：整理时自动跳过已处理的书籍，避免重复记录
  - 本地去重：基于 output 目录 books.json 中的 sourceFolder 字段
  - 全局历史：`~/.resource-tidy/history.json` 跨目录去重
  - 名称标准化兜底：处理 AI 返回名称不一致和旧格式记录
  - BookInfo 新增 sourceFolder 字段
  - 相关文件：`src/database.ts`、`src/history.ts`、`src/tidy.ts`
- **AI 分析分批处理**：大量书籍自动拆分为多个批次调用 AI API，避免 token 超限导致结果不完整
  - 每批最多处理 30 本书，多批次时显示进度
  - 相关文件：`src/analyzer.ts`

### Changed
- **AI 分析并行化**：多个批次并发调用 AI API，大幅缩短大量书籍的分析耗时
  - 默认并发数 3，可通过 `AI_CONCURRENCY` 环境变量调整
  - 相关文件：`src/analyzer.ts`
- **优化 AI 分析结果质量**：重写 Prompt 提示词，清洗书名营销前缀/套数标注，只保留主作者，综合判断分类
  - pic 文件名改为 hash(name).jpg 格式
  - 精简 BookInfo 数据结构，移除 originalFolder、typeFolder 冗余字段
  - 相关文件：`src/analyzer.ts`、`src/database.ts`、`src/organizer.ts`、`src/types.ts`

## [0.1.0] - 2026-04-29
### Added
- 项目初始化
- CLI 基础脚手架（Commander + TypeScript）
- 需求文档
