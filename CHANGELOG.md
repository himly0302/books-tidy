# Changelog

## [Unreleased]

### Added
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
