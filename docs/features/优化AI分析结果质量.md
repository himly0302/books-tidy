# 优化 AI 分析结果质量 - 需求文档

> 生成时间：2026-04-29
> 基于项目：books-tidy
> 技术栈：TypeScript + Commander + OpenAI 兼容 API

---

## 项目概况

**技术栈**：TypeScript 5.x + Commander 11 + 原生 fetch（OpenAI 兼容接口）
**架构模式**：流水线式模块化（扫描 -> AI 分析 -> 整理 -> 存储）
**代码风格**：camelCase 命名 / 无注释 / 同步文件操作 + 异步 AI 调用

---

## 改动点

### 要实现什么
- 优化 Prompt 提示词，让 AI 输出更干净的书籍信息
- `name`：去除营销前缀、副标题、套数标注等噪音，只保留核心书名
- `author`：只保留主作者，去除"等""等著"等后缀
- `type`：综合 name + author 整体判断分类，减少"其他"的使用
- `pic` 字段命名优化：使用 hash(name) 作为文件名
- 数据库 `BookInfo` 精简：删除 `originalFolder`、`typeFolder` 等冗余字段

### 与现有功能的关系
- 依赖现有模块：`analyzer.ts`（Prompt 构建 + 响应解析）、`database.ts`（数据组装）、`organizer.ts`（文件复制与命名）、`types.ts`（类型定义）
- 核心修改点：`src/analyzer.ts:59-73`（buildPrompt 函数）、`src/database.ts:20-47`（addBooks 函数）

### 新增依赖
- 无（使用 Node.js 内置 `crypto` 模块生成 hash）

---

## 实现方案

### 需要修改的文件
```
src/types.ts           # 精简 BookInfo 接口，移除冗余字段
src/analyzer.ts        # 优化 buildPrompt，增强解析容错
src/database.ts        # 更新 addBooks，精简字段、使用 hash 命名 pic
src/organizer.ts       # 更新目标文件夹命名逻辑（如需要）
```

### 需要新增的文件
```
无
```

### 实施步骤

**步骤 1：精简 BookInfo 类型（src/types.ts）**
- [ ] 从 `BookInfo` 中移除 `originalFolder`、`typeFolder` 字段
- [ ] 保留：`id`、`name`、`author`、`type`、`pic`、`addedAt`

**步骤 2：优化 Prompt 提示词（src/analyzer.ts）**
- [ ] 重写 `buildPrompt` 函数，增加以下规则：
  - name：去除营销用语（如"2000万人都学过："）、副标题分隔符后的内容、套数标注（如"（套装共13册）"），只保留核心书名
  - author：只保留第一作者，去除"等""等著""等编著"等后缀
  - type：必须综合 name 和 author 内容判断，优先从分类中选择最贴切的，确实无法归类才用"其他"
- [ ] 分类参考列表扩展为：文学、历史、哲学、经济、管理、科技、教育、艺术、政治、社会、心理、传记、医学、法律、军事、其他

**步骤 3：优化 pic 命名和数据库组装（src/database.ts）**
- [ ] 引入 `crypto` 模块，用 `md5(name)` 生成 pic 文件名，如 `a1b2c3d4.jpg`
- [ ] pic 字段存储相对于输出目录的完整路径：`{type}/{name}/{hash}.jpg`
- [ ] 移除 `originalFolder`、`typeFolder` 字段的赋值

**步骤 4：更新文件复制逻辑（src/organizer.ts）**
- [ ] 复制时将图片重命名为 hash(name).jpg 格式

**步骤 5：更新调用方（src/tidy.ts、src/analyze.ts）**
- [ ] 适配 `addBooks` 签名变更（如需）
- [ ] 适配 `BookInfo` 字段变更

**步骤 6：测试**
- [ ] 使用实际书籍文件夹运行 `npm run dev -- analyze -i <测试目录>`，检查 name/author/type 输出
- [ ] 运行 `npm run dev -- tidy -i <测试目录> -o <输出目录>`，检查文件结构和 books.json

**步骤 7：文档更新与提交代码**
- [ ] 更新 CHANGELOG.md
- [ ] 提交代码

**步骤 8：自我检查**
- [ ] name 是否干净（无营销前缀、无套数标注）
- [ ] author 是否只含主作者
- [ ] type 是否合理分类
- [ ] pic 路径是否为 `{type}/{name}/{hash}.jpg` 格式
- [ ] books.json 是否不含 `originalFolder`、`typeFolder` 字段

---

## 优化前后对比

以原始文件夹 `2000万人都学过：世界经典学术集系列（套装共13册） - 列夫•马诺维奇 等` 为例：

| 字段 | 优化前 | 优化后 |
|------|--------|--------|
| name | `2000万人都学过：世界经典学术集系列（套装共13册）` | `世界经典学术集系列` |
| author | `列夫•马诺维奇 等` | `列夫•马诺维奇` |
| type | `其他` | `学术`（或综合判断后的类型） |
| pic | `原始文件夹名.jpg` | `学术/世界经典学术集系列/a1b2c3d4.jpg` |
| originalFolder | 存在 | 移除 |
| typeFolder | 存在 | 移除 |

---

## 注意事项

**技术风险**：无新依赖引入，风险极低。Prompt 调优效果取决于 AI 模型能力（当前使用 GLM-5.1），可能需要多次迭代测试。
**兼容性**：`BookInfo` 字段变更属于破坏性变更，已有的 `books.json` 数据不兼容，需清空重建。
