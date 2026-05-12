# generate-data 输出到 assets 目录 - 功能开发文档

> 生成时间：2026-05-07
> 基于项目：resource-tidy
> 优先级：P1

---

## 1. 开发上下文

**技术栈**：TypeScript (ES2020, CommonJS) + Node.js
**关联模块**：generate-data（`src/generate-data.ts`）、CLI 入口（`src/index.ts`）

**背景**：`generate-data` 命令当前将分类型 JSON 数据输出到项目内 `result/configs/`（gitignored）。需要改为输出到 `{dir}/assets/resource-shop/`，与封面图片副本同目录，供 ECS 服务器统一提供静态文件访问。

**现有流程**：
- `generate-data --db <books.json路径>` → 硬编码输出到 `result/configs/`
- 输出文件：`{type}.json`（分类型书籍数据）和 `index.json`（类型统计）

---

## 2. 验收标准

- [ ] `generate-data --dir <目录>` 命令正常执行（`--db` 选项已替换为 `--dir`）
- [ ] 分类型 JSON 和 `index.json` 输出到 `{dir}/assets/resource-shop/` 目录
- [ ] 不再输出到 `result/configs/`
- [ ] 现有整理、导出、导入等功能未被破坏

---

## 3. 开发方案

### 3.1 要实现什么

- `generate-data` 的 CLI 选项从 `--db` 改为 `--dir`，与 `import-links` 保持一致
- 输出目录从硬编码 `result/configs/` 改为 `{dir}/assets/resource-shop/`
- 自动从 `{dir}/books.json` 读取数据库

### 3.2 与现有功能的关系

- 依赖现有模块：`database.loadDatabase` — 加载数据库
- 集成位置：`src/index.ts:46-49`（CLI 定义）、`src/generate-data.ts:7`（输出目录）

### 3.3 文件清单

- 修改：`src/generate-data.ts` — 改为接受 `{ dir: string }`，输出到 `assets/resource-shop/`
- 修改：`src/index.ts` — `--db` 改为 `--dir`

### 3.4 新增依赖

无

---

## 4. 实施步骤

**步骤 1：修改 index.ts**

- [ ] `generate-data` 命令的 `--db` 改为 `--dir`，描述改为"包含 books.json 的目录"

改动点：
```
src/index.ts:48 — requiredOption('--db', ...) 改为 requiredOption('--dir', ...)
```

**步骤 2：修改 generate-data.ts**

- [ ] 函数签名从 `options: { db: string }` 改为 `options: { dir: string }`
- [ ] 从 `{dir}/books.json` 加载数据库
- [ ] 输出目录从 `result/configs/` 改为 `{dir}/assets/resource-shop/`

改动点：
```
src/generate-data.ts:6   — options 类型改为 { dir: string }
src/generate-data.ts:7   — dbPath 改为从 dir 推导
src/generate-data.ts:8   — outputDir 改为 assets/resource-shop/
```

**步骤 3：验收检查**

- [ ] 运行 `npm run build` 确认编译通过
- [ ] 执行 `generate-data --dir D:\测试图书_done`，检查 `assets/resource-shop/` 下生成 JSON 文件
- [ ] 确认 `result/configs/` 下不再生成新文件

---

## 5. 文档更新清单

> 功能实现完成后，逐条对照执行

**CHANGELOG.md**（在 `## [Unreleased]` 下添加）：

```markdown
### Changed
- **generate-data 输出目录调整**：输出从 `result/configs/` 改为 `{dir}/assets/resource-shop/`，与封面图片同目录
  - CLI 选项从 `--db` 改为 `--dir`（与 import-links 一致）
  - 相关文件：`src/generate-data.ts`、`src/index.ts`
```

**README.md 更新清单**

| section | 更新内容 |
|---------|---------|
| 命令 | `generate-data` 命令示例改为 `--dir` 参数 |

**CLAUDE.md 更新清单**

| section | 更新内容 |
|---------|---------|
| 命令 | `generate-data` 描述更新 |
| 架构 - generate-data.ts | 更新描述 |

---

## 6. 约束与风险

- **破坏性变更**：`--db` 改为 `--dir` 是 CLI 接口变更，需注意使用习惯调整
- **兼容性**：已有 `result/configs/` 目录中的旧数据不受影响，但不再自动更新
