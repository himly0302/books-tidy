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

### 操作流程

以下是一次完整数据整理的步骤：

**第 1 步：整理书籍** `自动`
```bash
npm run dev -- tidy --input D:\原始书籍 --output D:\图书合集_done
```
> ⚠️ 生成 `books.json` 数据库文件；已处理书籍自动跳过（本地 + 全局历史两级去重）

**第 2 步：上传封面图片** `自动`
```bash
npm run dev -- upload-pics --db D:\图书合集_done\books.json --output D:\图书合集_done
```
> ⚠️ 每 5 本自动保存，中断后重跑只处理剩余；已有 picUrl 的自动跳过

**第 3 步：上传百度云盘** `手动 ⚠️`
> 百度云盘 API 仅支持上传到固定路径，生成分享链接需付费，因此手动操作。

1. 将整理后的书籍文件夹（如 `D:\图书合集_done\传记\`）逐个上传到百度云盘
2. 在百度云盘客户端中按类型批量生成分享链接，导出 CSV 文件
3. 导出时文件名命名为类型名，如 `传记.csv`，保存到与 books.json 同级目录

CSV 格式：
```
文件名,链接,提取码,分享时间,分享状态
小文艺口袋文库·知人系列,https://pan.baidu.com/s/xxx?pwd=6yk7,6yk7,2026-04-30 18:14,生成成功
```

**第 4 步：导入分享链接** `自动`
```bash
npm run dev -- import-links --dir D:\图书合集_done
```
> ⚠️ 同时保存 JSON 副本到项目 `result/` 目录，如 `result/20260501-452.json`

**第 5 步：导出 Excel** `自动`
```bash
npm run dev -- export-excel --db D:\图书合集_done\books.json
```
> ⚠️ 按类型分 sheet，输出到 `result/` 目录，如 `result/20260501-452.xlsx`

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
books-tidy generate-data --db <json文件>                # 生成前端分类型 JSON 数据并上传七牛云
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
