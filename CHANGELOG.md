# Changelog

## [Unreleased]

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
