# 生成 Excel 文件 - 功能开发文档

> 生成时间：2026-05-01
> 基于项目：books-tidy

---

## 开发上下文

**相关技术栈**：TypeScript、Node.js fs 模块、exceljs
**关联模块**：database.ts（`src/database.ts`）、types.ts（`src/types.ts`）、index.ts（`src/index.ts`）
**代码风格**：同步文件操作（写入部分异步），最小改动原则，中文用户提示

---

## 开发方案

### 要实现什么

- 读取 books.json 数据库，按类型分 sheet 生成 Excel 文件
- 每个 sheet 列：书名、作者、类型、百度云盘、添加时间
- 输出到 `result/YYYYMMDD-{数量}.xlsx`

### Excel 输出格式

| 书名 | 作者 | 类型 | 百度云盘 | 添加时间 |
|------|------|------|---------|---------|
| 黎东方讲史 | 黎东方 | 历史 | https://pan.baidu.com/s/... | 2026-04-30 |

### 与现有功能的关系

- 依赖现有模块：database.ts - loadDatabase 读取 JSON 数据库
- 输出模式：与 `import-links.ts` 的 `saveResult` 一致，输出到 `result/` 目录
- 集成位置：index.ts - 新增 `export-excel` CLI 子命令

### 新增依赖

- `exceljs@^4.4` — Excel 文件生成（支持多 sheet、列宽设置）

### 需要修改的文件

```
src/index.ts       # 新增 export-excel 命令注册
```

### 需要新增的文件

```
src/export-excel.ts  # export-excel 命令编排器：按类型分 sheet 生成 Excel
```

---

## 实施步骤

**步骤 1：环境准备**

- [ ] 安装 exceljs：`npm install exceljs`

**步骤 2：核心实现**

- [ ] 创建 `src/export-excel.ts`，实现以下功能：

```
export-excel --db <json文件>
```

处理流程：
1. 加载 books.json 数据库
2. 按 type 字段分组
3. 每个类型创建一个 worksheet，列：书名、作者、类型、百度云盘、添加时间
4. addedAt 格式化为 `YYYY-MM-DD`
5. 写入 `result/YYYYMMDD-{books.length}.xlsx`

- [ ] 列宽设置：书名 30、作者 20、类型 8、百度云盘 50、添加时间 12
- [ ] 统计输出：总条目数、各类型条目数

**步骤 3：集成到 CLI**

- [ ] 修改 `src/index.ts`：新增 `export-excel` 命令注册

```typescript
program.command('export-excel')
  .description('按类型分 sheet 导出 Excel 文件')
  .requiredOption('--db <file>', 'books.json 数据库文件路径')
  .action(exportExcelCommand);
```

**步骤 4：验收检查**

- [ ] 运行 `npm run dev -- export-excel --db <测试数据>`
- [ ] 验证生成的 xlsx 文件可正常打开
- [ ] 验证 sheet 数量与类型数量一致
- [ ] 验证每条数据列内容正确（bd_link、picUrl 可选字段正确处理）
- [ ] 验证 addedAt 日期格式为 YYYY-MM-DD
- [ ] 现有功能未被破坏

**步骤 5：文档更新与提交**

| 文档 | 需要更新 | 不需要更新 |
|------|----------|-----------|
| **CHANGELOG.md** | ✅ 新功能 | - |
| **README.md** | ✅ 新命令 | - |
| **CLAUDE.md** | ✅ 新模块、新依赖 | - |

**README.md 更新清单**：

| README.md section | 更新内容 |
|-------------------|---------|
| 命令 | 新增 `export-excel` 命令说明 |

**CLAUDE.md 更新清单**：

| CLAUDE.md section | 更新内容 |
|-------------------|---------|
| 架构 | 新增 `src/export-excel.ts` 模块说明 |
| index.ts 说明 | 新增 `export-excel` 子命令 |

**CHANGELOG.md 更新**（在 `## [Unreleased]` 下添加）：

```markdown
### Added
- **Excel 导出**：新增 `export-excel` 命令，按类型分 sheet 生成 Excel 文件
  - 每个 sheet 包含：书名、作者、类型、百度云盘、添加时间
  - 输出到 result/YYYYMMDD-{数量}.xlsx
  - 相关文件：`src/export-excel.ts`
```

**提交代码**：

```bash
git add src/export-excel.ts src/index.ts package.json package-lock.json docs/features/ CHANGELOG.md README.md CLAUDE.md
git commit -m "docs: 新增生成 Excel 文件功能开发文档"
```

> 注意：使用 `git add` 明确指定文件，避免 `git add .`

**步骤 6：自检**

- [ ] 验收条件是否全部通过
- [ ] CHANGELOG.md 是否已更新
- [ ] README.md 更新清单中的每一项是否都已执行
- [ ] CLAUDE.md 更新清单中的每一项是否都已执行
- [ ] "实施步骤"与"文件清单"是否一致
- [ ] 所有相关文件是否已提交

---

## 约束与风险

- **新依赖**：引入 exceljs（~2MB），纯 JS 无原生依赖，安装无风险
- **兼容性**：纯输出功能，不修改任何现有数据，零风险
- **性能/安全**：本地文件操作，无外部 API 调用
