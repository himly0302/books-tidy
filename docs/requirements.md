# Books Tidy 需求文档

> 📅 **生成时间**：2026-04-29
> 🎯 **核心目标**：AI 驱动的书籍文件夹自动整理工具，按类型归类并规范化命名
> ⏱️ **开发时间**：MVP 1-2天，V1.0 1周
> 🔧 **技术栈**：Node.js + TypeScript 5.x + Commander 11

## 1. 工具概述

- **解决的问题**：书籍文件夹命名混乱、缺乏分类，手动整理耗时费力
- **使用场景**：整理本地藏书文件夹，每次新增一批书籍后执行一次
- **核心价值**：将数十本书的整理工作从手动数小时缩短到自动几分钟
- **成功标准**：给定书籍文件夹目录，自动完成分类归档和 JSON 记录，准确率 > 90%

## 2. 功能与使用

### 功能列表

**P0 必须**：
- 扫描指定目录下所有子文件夹，提取文件夹名作为原始信息
- 调用 AI 接口（ModelScope / GLM-5.1）分析原始信息，返回结构化数据：`{ name, author, type }`
- 按书籍类型创建分类文件夹，将子文件夹复制到对应类型目录下，并重命名为书籍名
- 识别每个子文件夹内的图片文件，记录相对路径
- 维护 JSON 数据文件，记录所有书籍的完整信息（名称、作者、类型、原始文件夹、图片路径等）
- 支持 CLI 指定输入目录和输出目录

**P1 可选**：
- 批量上传图片到图床，返回 URL 并更新 JSON
- 根据书籍名查询百度云盘分享链接

**P2 未来**：
- 增量处理（仅处理新增书籍，跳过已处理的）
- 处理进度显示与断点续传

### 使用方式

```bash
# 基本用法：扫描并整理书籍
books-tidy tidy --input ./raw-books --output ./organized

# 仅分析不移动文件（预览模式）
books-tidy analyze --input ./raw-books

# 上传图片到图床
books-tidy upload-pics --db ./books.json
```

### 环境变量

在项目根目录创建 `.env` 文件（已加入 `.gitignore`，不会上传到远程仓库）：

```bash
AI_BASE_URL=https://api-inference.modelscope.cn
AI_API_KEY=your-api-key-here
AI_MODEL=ZhipuAI/GLM-5.1
```

代码中通过 `process.env` 读取，不硬编码任何密钥。

### JSON 数据格式

```json
{
  "books": [
    {
      "id": "uuid",
      "name": "十四五新发展格局",
      "author": "刘世锦",
      "type": "经济",
      "originalFolder": "\"十四五\"新发展格局-中国经济行稳致远（套装共10册） - 刘世锦",
      "typeFolder": "经济",
      "pic": "封面.jpg",
      "addedAt": "2026-04-29T12:00:00Z"
    }
  ]
}
```

## 3. 技术实现

### 技术栈

- **语言**：TypeScript 5.x（严格模式）
- **CLI 框架**：Commander 11
- **AI 接口**：ModelScope API（OpenAI 兼容格式），使用 `fetch` 原生调用
- **数据存储**：JSON 文件（books.json）
- **构建**：tsc 编译到 dist/

### 关键依赖

| 包名 | 用途 |
|------|------|
| commander | CLI 命令解析 |
| uuid | 生成书籍唯一 ID |

### 项目结构

```
books-tidy/
├── README.md
├── CHANGELOG.md
├── package.json
├── tsconfig.json
├── .env.example        # 环境变量模板（不含密钥）
├── src/
│   ├── index.ts          # CLI 入口
│   ├── scanner.ts        # 文件夹扫描
│   ├── analyzer.ts       # AI 分析（调用 ModelScope）
│   ├── organizer.ts      # 文件移动与重命名
│   ├── database.ts       # JSON 数据读写
│   └── types.ts          # 类型定义
├── tests/
└── docs/
    └── requirements.md
```

### 测试规范

- 所有测试文件统一在 `tests/` 目录
- 使用 Node.js 内置 `node:test` + `node:assert`
- 测试覆盖：AI 响应解析、文件扫描逻辑、JSON 读写

## 4. 开发计划

### MVP（1-2 天）- 能用

- [ ] 类型定义与 CLI 命令搭建（1小时）
- [ ] 文件夹扫描模块（1小时）
- [ ] AI 分析模块（调用 ModelScope API）（2-3小时）
- [ ] 文件整理模块（复制+重命名）（2小时）
- [ ] JSON 数据记录模块（1小时）
- [ ] 端到端测试（1小时）

### V1.0（1 周）- 好用

- [ ] 预览模式（analyze 命令）（半天）
- [ ] 配置文件支持（半天）
- [ ] 错误处理与日志优化（半天）
- [ ] 图片上传到图床（P1）（1天）
- [ ] 百度云盘分享链接查询（P1）（1天）
- [ ] 完善文档（半天）

### 后续优化（按需）

- 增量处理模式
- 处理进度条
- AI 分析结果人工确认/修正
- 打包为全局 CLI 工具发布
