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

## 命令

```bash
books-tidy tidy --input <目录> --output <目录>   # 整理书籍
books-tidy analyze --input <目录>                  # 预览分析结果
books-tidy upload-pics --db <json文件> --output <目录>  # 上传图片到图床
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `AI_BASE_URL` | AI API 基础 URL |
| `AI_API_KEY` | API 密钥 |
| `AI_MODEL` | 模型名称 |
| `QINIU_ACCESS_KEY` | 七牛云 Access Key |
| `QINIU_SECRET_KEY` | 七牛云 Secret Key |
| `QINIU_BUCKET` | 七牛云存储空间名称 |
| `QINIU_DOMAIN` | 七牛云 CDN 加速域名 |
| `QINIU_ZONE` | 存储区域（z0=华东 z1=华北 z2=华南 na0=北美 as0=东南亚） |

## 文档

- [需求文档](docs/requirements.md)
- [更新日志](CHANGELOG.md)
