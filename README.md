# Books Tidy

AI 驱动的书籍文件夹自动整理工具——按类型归类、规范化命名、一键整理。

## 快速开始

```bash
npm install
npm run build
npm start -- tidy --input ./raw-books --output ./organized
```

开发模式：

```bash
npm run dev -- tidy --input ./raw-books --output ./organized
```

## 核心功能

- 扫描书籍文件夹，通过 AI 自动提取书名、作者、类型
- 按类型归类到新目录，重命名为规范书名
- 维护 JSON 数据文件，记录所有书籍信息
- 识别并记录每本书的封面图片
- 自动跳过已处理的书籍，避免重复整理（本地 + 全局历史两级去重）

## 命令

```bash
books-tidy tidy --input <目录> --output <目录>   # 整理书籍
books-tidy analyze --input <目录>                  # 预览分析结果
books-tidy upload-pics --db <json文件> --output <目录>  # 上传图片到图床
books-tidy import-links --dir <目录>                     # 从 CSV 导入百度网盘链接
books-tidy export-excel --db <json文件>                   # 导出 Excel 文件（按类型分 sheet）
books-tidy qiniu buckets                           # 列出所有七牛云空间
books-tidy qiniu files --bucket <name>             # 列出空间内文件
books-tidy qiniu delete-bucket --bucket <name>     # 删除空间（先清空文件）
```

## 环境变量

### AI 分析

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `AI_BASE_URL` | AI API 基础 URL（必填） | - |
| `AI_API_KEY` | API 密钥（必填） | - |
| `AI_MODEL` | 模型名称（必填） | - |
| `AI_CONCURRENCY` | 批次并发数 | 3 |
| `AI_VERIFY` | 核查模式（false 关闭） | true |
| `AI_BATCH_SIZE` | 每批处理数量 | 60 |
| `AI_TEMPERATURE` | 采样温度 | 0.1 |
| `AI_MAX_RETRIES` | 最大重试次数 | 3 |
| `AI_RETRY_DELAY` | 重试间隔（毫秒） | 2000 |

### 七牛云图床

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `QINIU_ACCESS_KEY` | Access Key（必填） | - |
| `QINIU_SECRET_KEY` | Secret Key（必填） | - |
| `QINIU_BUCKET` | 存储空间名称（必填） | - |
| `QINIU_DOMAIN` | CDN 加速域名（必填） | - |
| `QINIU_ZONE` | 存储区域 | z0 |

### 图片上传

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `UPLOAD_MAX_WIDTH` | 最大宽度（像素） | 1200 |
| `UPLOAD_JPEG_QUALITY` | JPEG 压缩质量 | 80 |

## 文档

- [需求文档](docs/requirements.md)
- [更新日志](CHANGELOG.md)
