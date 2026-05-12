# generate-data 输出到 configs 子目录 - 功能开发文档

> 生成时间：2026-05-07
> 基于项目：resource-tidy
> 优先级：P2

---

## 1. 开发上下文

**技术栈**：TypeScript (ES2020, CommonJS) + Node.js
**关联模块**：generate-data（`src/generate-data.ts`）

**背景**：`generate-data` 已改为输出到 `{dir}/assets/books-shop/`，但 JSON 数据与封面图片混在同一目录。需将 JSON 数据输出到 `configs` 子目录，与图片文件分开存放。

**目录结构预期**：
```
assets/books-shop/
  ├── 20c446b4.jpg          # 封面图片
  ├── 458543ae.jpg
  ├── configs/              # JSON 数据
  │   ├── index.json
  │   ├── 学术.json
  │   └── 文学.json
```

---

## 2. 验收标准

- [ ] `generate-data` 输出的 JSON 文件位于 `{dir}/assets/books-shop/configs/` 子目录
- [ ] 封面图片仍在 `assets/books-shop/` 目录下，不受影响

---

## 3. 开发方案

### 3.1 文件清单

- 修改：`src/generate-data.ts` — 第 8 行 outputDir 路径追加 `configs`

### 3.2 新增依赖

无

---

## 4. 实施步骤

**步骤 1：修改 generate-data.ts**

- [ ] `outputDir` 从 `assets/books-shop` 改为 `assets/books-shop/configs`

改动点：
```
src/generate-data.ts:8 — outputDir 追加 'configs' 段
```

**步骤 2：验收检查**

- [ ] 运行 `npm run build` 确认编译通过
- [ ] 执行 `generate-data --dir <目录>`，检查 JSON 文件输出到 `configs/` 子目录

---

## 5. 文档更新清单

**CHANGELOG.md**：

```markdown
### Changed
- **generate-data 输出子目录调整**：JSON 数据输出到 `assets/books-shop/configs/`，与封面图片分开存放
  - 相关文件：`src/generate-data.ts`
```

**README.md 更新清单**

| section | 更新内容 |
|---------|---------|
| 命令 | 不需要更新 |

**CLAUDE.md 更新清单**

| section | 更新内容 |
|---------|---------|
| 架构 - generate-data.ts | 更新路径描述 |

---

## 6. 约束与风险

无
