# Changelog

## [Unreleased]

### Added
- **百度网盘链接导入**：新增 `import-links` 命令，从 CSV 文件批量导入分享链接
  - 自动解析与 books.json 同级的 CSV 文件（文件名=类型）
  - 按 type+name 匹配书籍，新增 bd_link 字段
  - 生成 result/ 目录副本，文件名格式 YYYYMMDD-{数量}.json
  - 相关文件：`src/import-links.ts`、`src/types.ts`
- **Excel 导出**：新增 `export-excel` 命令，按类型分 sheet 生成 Excel 文件
  - 每个 sheet 包含：书名、作者、类型、百度云盘、添加时间
  - 输出到 result/YYYYMMDD-{数量}.xlsx
  - 相关文件：`src/export-excel.ts`

### Changed
- **AI 分析增强**：提取书名/作者时同步生成简介（brief），新增核查模式可修正作者信息
  - `AI_VERIFY` 环境变量控制核查模式（默认开启）
  - BookInfo 新增 `brief` 字段
  - 相关文件：`src/analyzer.ts`、`src/types.ts`、`src/database.ts`
- **配置集中管理**：新增 `src/config.ts` 统一管理环境变量，提取 6 个硬编码常量为可配置项
  - 新增环境变量：`AI_BATCH_SIZE`、`AI_TEMPERATURE`、`AI_MAX_RETRIES`、`AI_RETRY_DELAY`、`UPLOAD_MAX_WIDTH`、`UPLOAD_JPEG_QUALITY`
  - 所有默认值不变，向后兼容
  - 相关文件：`src/config.ts`、`src/analyzer.ts`、`src/uploader.ts`、`src/uploaders/qiniu.ts`、`src/qiniu/client.ts`

### Fixed
- **数据修正**：书籍文件夹无图片时，pic 字段置空而非生成不存在的路径
  - 相关文件：`src/database.ts`、`src/organizer.ts`、`src/upload-pics.ts`

### Added
- **去重**：整理时自动跳过已处理的书籍，避免重复记录
  - 本地去重：基于 output 目录 books.json 中的 sourceFolder 字段
  - 全局历史：`~/.books-tidy/history.json` 跨目录去重
  - 名称标准化兜底：处理 AI 返回名称不一致和旧格式记录
  - BookInfo 新增 sourceFolder 字段
  - 相关文件：`src/database.ts`、`src/history.ts`、`src/tidy.ts`
- **七牛云空间管理**：新增 `qiniu` 命令组，支持列出空间、列出文件、删除空间
  - `qiniu buckets` 列出所有存储空间
  - `qiniu files --bucket <name>` 列出空间内文件
  - `qiniu delete-bucket --bucket <name>` 清空文件并删除空间（含确认提示）
  - 提取共享客户端模块 `src/qiniu/client.ts`，供上传和空间管理复用
  - 相关文件：`src/qiniu/client.ts`、`src/qiniu/bucket-manager.ts`、`src/qiniu-manage.ts`
- **AI 分析分批处理**：大量书籍自动拆分为多个批次调用 AI API，避免 token 超限导致结果不完整
  - 每批最多处理 30 本书，多批次时显示进度
  - 相关文件：`src/analyzer.ts`
- **批量上传图片到七牛云图床**：新增 `upload-pics` 命令
  - 上传前自动压缩图片（sharp, JPEG quality 80, 最大宽度 1200px）
  - 已有 picUrl 的书籍自动跳过，支持断点续传（每 5 本自动保存）
  - 提供通用 ImageUploader 接口，首个实现为七牛云对象存储
  - 相关文件：`src/upload-pics.ts`、`src/uploader.ts`、`src/uploaders/qiniu.ts`

### Changed
- **AI 分析并行化**：多个批次并发调用 AI API，大幅缩短大量书籍的分析耗时
  - 默认并发数 3，可通过 `AI_CONCURRENCY` 环境变量调整
  - 相关文件：`src/analyzer.ts`
- **七牛云存储格式调整**：上传 key 从 `books/{type}/{name}/{hash}.jpg` 改为 `books-tidy/{id}.jpg`，使用 UUID 命名避免路径中的中文字符
  - URL 更短更简洁，无 URL 编码问题
  - 相关文件：`src/upload-pics.ts`
- **优化 AI 分析结果质量**：重写 Prompt 提示词，清洗书名营销前缀/套数标注，只保留主作者，综合判断分类
  - pic 文件名改为 hash(name).jpg 格式
  - 精简 BookInfo 数据结构，移除 originalFolder、typeFolder 冗余字段
  - 相关文件：`src/analyzer.ts`、`src/database.ts`、`src/organizer.ts`、`src/types.ts`

## [0.1.0] - 2026-04-29
### Added
- 项目初始化
- CLI 基础脚手架（Commander + TypeScript）
- 需求文档
