# Excel 新增简介列 - 功能开发文档

> 生成时间：2026-05-01
> 基于项目：books-tidy

---

## 开发上下文

**相关技术栈**：TypeScript、exceljs
**关联模块**：export-excel.ts（`src/export-excel.ts`）
**代码风格**：最小改动

---

## 开发方案

### 要实现什么

- Excel 新增「简介」列，写入 BookInfo.brief 字段
- 调整列顺序：书名、作者、类型、简介、百度云盘、添加时间

### 列顺序设计

| 顺序 | 列名 | 理由 |
|------|------|------|
| 1 | 书名 | 核心标识，最先看到 |
| 2 | 作者 | 紧跟书名，自然关联 |
| 3 | 类型 | 简短分类信息 |
| 4 | 简介 | 补充说明书籍内容 |
| 5 | 百度云盘 | 功能性链接，靠后 |
| 6 | 添加时间 | 管理信息，最后 |

### 需要修改的文件

```
src/export-excel.ts  # COLUMNS 新增简介列 + 调整顺序，addRow 写入 brief
```

---

## 实施步骤

**步骤 1：修改 export-excel.ts**

- [ ] COLUMNS 新增简介列，调整顺序

```typescript
const COLUMNS = [
  { header: '书名', key: 'name', width: 30 },
  { header: '作者', key: 'author', width: 20 },
  { header: '类型', key: 'type', width: 8 },
  { header: '简介', key: 'brief', width: 40 },
  { header: '百度云盘', key: 'bd_link', width: 50 },
  { header: '添加时间', key: 'addedAt', width: 12 },
];
```

- [ ] addRow 中写入 brief

```typescript
brief: book.brief || '',
```

**步骤 2：验收检查**

- [ ] 运行 export-excel，验证 Excel 包含简介列且顺序正确
- [ ] 无 brief 的书籍简介列为空

**步骤 3：文档更新与提交**

| 文档 | 需要更新 | 不需要更新 |
|------|----------|-----------|
| **CHANGELOG.md** | ✅ 功能调整 | - |
| **README.md** | - | ✅ 命令无变化 |
| **CLAUDE.md** | - | ✅ 无架构变更 |

**CHANGELOG.md 更新**（在 `## [Unreleased]` 下添加）：

```markdown
### Changed
- **Excel 导出调整**：新增简介列，列顺序调整为书名、作者、类型、简介、百度云盘、添加时间
  - 相关文件：`src/export-excel.ts`
```

**提交代码**：

```bash
git add src/export-excel.ts docs/features/ docs/ideas/ CHANGELOG.md
git commit -m "feat: Excel 新增简介列"
```

**步骤 4：自检**

- [ ] 验收条件是否全部通过
- [ ] CHANGELOG.md 是否已更新
- [ ] 所有相关文件是否已提交

---

## 约束与风险

- 无风险，纯输出格式调整
