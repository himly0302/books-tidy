# 无图片书籍 pic 字段置空 - 功能开发文档

> 生成时间：2026-04-30
> 基于项目：books-tidy

---

## 开发上下文

**相关技术栈**：TypeScript、Node.js fs 模块
**关联模块**：database.ts（`src/database.ts`）、organizer.ts（`src/organizer.ts`）、upload-pics.ts（`src/upload-pics.ts`）
**代码风格**：同步文件操作，最小改动原则

---

## 开发方案

### 要实现什么

- 当书籍文件夹内没有图片时，`BookInfo.pic` 字段应为空字符串 `""`，而非生成一个不存在的路径

### 与现有功能的关系

- 依赖现有模块：scanner.ts - 扫描书籍文件夹，`pics` 数组记录图片（无图片时为空数组 `[]`）
- 问题根源：database.ts:79 — 即使 `book.pics[0]` 不存在，也用 `.jpg` 默认扩展名拼出路径
- 影响下游：upload-pics.ts:36 使用 `book.pic` 拼接本地路径读取文件，无图片时路径指向不存在的文件

### 需要修改的文件

```
src/database.ts      # pic 字段生成逻辑：无图片时置空
src/organizer.ts     # 移除无图片时的 .jpg 默认扩展名逻辑（无实际影响但应保持一致）
src/upload-pics.ts   # 上传时跳过 pic 为空的书籍
```

---

## 实施步骤

**步骤 1：核心实现**

- [ ] 修改 `src/database.ts:79-87`：判断 `book.pics.length > 0`，无图片时 `pic` 设为 `""`

```typescript
// 修改前
const ext = book.pics[0] ? path.extname(book.pics[0]) : '.jpg';
const picHash = hashName(analysis.name) + ext;
// ...
pic: `${analysis.type}/${analysis.name}/${picHash}`,

// 修改后
const hasPic = book.pics.length > 0;
const ext = hasPic ? path.extname(book.pics[0]) : '';
const picHash = hasPic ? hashName(analysis.name) + ext : '';
// ...
pic: hasPic ? `${analysis.type}/${analysis.name}/${picHash}` : '',
```

- [ ] 修改 `src/organizer.ts:21-22`：移除无图片时的 `.jpg` 默认值（保持一致性）

```typescript
// 修改前
const firstPicExt = firstPic ? path.extname(firstPic) : '.jpg';
const hashedName = hashName(analysis.name) + firstPicExt;

// 修改后
const firstPicExt = firstPic ? path.extname(firstPic) : '';
const hashedName = firstPic ? hashName(analysis.name) + firstPicExt : '';
```

- [ ] 修改 `src/upload-pics.ts:20`：过滤时额外排除 `pic` 为空的书籍

```typescript
// 修改前
const pending = db.books.filter(b => !b.picUrl);

// 修改后
const pending = db.books.filter(b => !b.picUrl && b.pic);
```

**步骤 2：验收检查**

- [ ] 扫描一个包含无图片书籍的文件夹，确认 JSON 中 `pic` 为空字符串
- [ ] 扫描一个有图片的书籍，确认 `pic` 字段行为不变
- [ ] 运行 `upload-pics` 命令，确认跳过无 pic 的书籍且不报错
- [ ] 现有功能未被破坏

**步骤 3：文档更新与提交**

| 文档 | 需要更新 | 不需要更新 |
|------|----------|-----------|
| **CHANGELOG.md** | ✅ 行为变更：pic 字段空值处理 | - |
| **README.md** | - | ✅ 无用户可见行为变更 |
| **CLAUDE.md** | - | ✅ 无架构或模块变更 |

**CHANGELOG.md 更新**（在 `## [Unreleased]` 下添加）：

```markdown
### Fixed
- **数据修正**：书籍文件夹无图片时，pic 字段置空而非生成不存在的路径
  - 相关文件：`src/database.ts`、`src/organizer.ts`、`src/upload-pics.ts`
```

**提交代码**：

```bash
git add src/database.ts src/organizer.ts src/upload-pics.ts docs/features/ CHANGELOG.md
git commit -m "feat: 无图片书籍 pic 字段置空"
```

---

## 约束与风险

- **兼容性**：已有的 books.json 中可能存在 pic 指向不存在文件的旧记录，不影响功能（upload-pics 已有文件不存在的检查）
- **性能/安全**：无风险，仅修改条件判断逻辑
