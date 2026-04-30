# Changelog

## [Unreleased]

### Added
- **AI 分析分批处理**：大量书籍自动拆分为多个批次调用 AI API，避免 token 超限导致结果不完整
  - 每批最多处理 30 本书，多批次时显示进度
  - 相关文件：`src/analyzer.ts`
- **批量上传图片到七牛云图床**：新增 `upload-pics` 命令
  - 上传前自动压缩图片（sharp, JPEG quality 80, 最大宽度 1200px）
  - 已有 picUrl 的书籍自动跳过，支持断点续传（每 5 本自动保存）
  - 提供通用 ImageUploader 接口，首个实现为七牛云对象存储
  - 相关文件：`src/upload-pics.ts`、`src/uploader.ts`、`src/uploaders/qiniu.ts`

### Changed
- **优化 AI 分析结果质量**：重写 Prompt 提示词，清洗书名营销前缀/套数标注，只保留主作者，综合判断分类
  - pic 文件名改为 hash(name).jpg 格式
  - 精简 BookInfo 数据结构，移除 originalFolder、typeFolder 冗余字段
  - 相关文件：`src/analyzer.ts`、`src/database.ts`、`src/organizer.ts`、`src/types.ts`

## [0.1.0] - 2026-04-29
### Added
- 项目初始化
- CLI 基础脚手架（Commander + TypeScript）
- 需求文档
