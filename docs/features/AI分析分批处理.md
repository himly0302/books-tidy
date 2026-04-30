# AI 分析分批处理 - 功能开发文档

> 生成时间：2026-04-30
> 基于项目：books-tidy

---

## 开发上下文

**相关技术栈**：TypeScript + 原生 fetch（OpenAI 兼容接口）
**关联模块**：`analyzer.ts`（`src/analyzer.ts`）— AI 分析的核心模块
**代码风格**：camelCase 命名 / 无注释 / 同步文件操作 + 异步 AI 调用

---

## 开发方案

### 要实现什么

- **分批发送**：将大量书籍拆分为多个批次，每批独立调用 AI API，避免超出 token 限制
- **批次进度提示**：处理多批次时在控制台显示当前进度（如 `分析中 (1/3)...`）
- **结果合并**：所有批次分析完成后，合并为完整结果数组返回，对调用方透明

### 与现有功能的关系

- 依赖现有模块：`analyzer.ts` — Prompt 构建 + 响应解析（保持不变）
- 集成位置：`src/analyzer.ts:6`（`analyzeBooks` 函数）
- **对调用方透明**：`tidy.ts` 和 `analyze.ts` 无需修改，`analyzeBooks` 签名不变

### 新增依赖

- 无

### 需要修改的文件

```
src/analyzer.ts  # 修改内容：analyzeBooks 函数增加分批逻辑，新增 BATCH_SIZE 常量
```

### 需要新增的文件

```
无
```

---

## 实施步骤

**步骤 1：核心实现**

- [ ] 在 `analyzer.ts` 顶部新增常量 `BATCH_SIZE = 30`（每批最大书籍数）
- [ ] 新增 `analyzeBatch` 函数：提取当前 `analyzeBooks` 的单次 API 调用 + 重试逻辑（即第 18-53 行的 for 循环体）
- [ ] 重写 `analyzeBooks`：
  1. 将 `books` 按 `BATCH_SIZE` 切分为多个批次
  2. 单批次时直接调用 `analyzeBatch`，不输出批次进度（保持现有行为）
  3. 多批次时依次调用 `analyzeBatch`，每批开始前输出进度 `console.log('分析中 (批次/总批次)...')`
  4. 合并所有批次结果为单一数组返回
- [ ] `buildPrompt` 和 `parseAIResponse` 不变

**步骤 2：测试**

- [ ] 用少量书籍（< 30 本）运行 `npm run dev -- analyze -i <目录>`，确认行为与修改前一致（单批次，无进度输出）
- [ ] 用较多书籍或手动构造超过 30 个文件夹名的场景，确认分批执行、进度显示、结果完整

**步骤 3：验收检查**

- [ ] 单批次场景：输出格式与修改前完全一致
- [ ] 多批次场景：返回结果数组长度与输入书籍数一致
- [ ] 多批次场景：控制台显示批次进度信息
- [ ] 单批次结果中 name/author/type 质量不低于修改前

**步骤 4：文档更新与提交**

| 文档 | 需要更新 | 不需要更新 |
|------|----------|-----------|
| **CHANGELOG.md** | ✅ | - |
| **README.md** | - | ✅（无用户可见的命令/参数变化） |
| **CLAUDE.md** | - | ✅（无新文件/新环境变量） |

**CHANGELOG.md 更新**（在 `## [Unreleased]` 下添加）：

```markdown
### Added
- **AI 分析分批处理**：大量书籍自动拆分为多个批次调用 AI API，避免 token 超限导致结果不完整
  - 每批最多处理 30 本书，多批次时显示进度
  - 相关文件：`src/analyzer.ts`
```

**提交代码**：

```bash
git add src/analyzer.ts CHANGELOG.md
git commit -m "feat: AI 分析分批处理，避免 token 超限"
```

---

## 约束与风险

- **新依赖**：无
- **兼容性**：`analyzeBooks` 函数签名不变，调用方无需修改，完全向后兼容
- **性能**：多批次会增加 API 调用次数，但每次调用的 token 消耗更可控；总耗时可能略增，但结果质量有保障
- **BATCH_SIZE**：初始设为 30，可根据实际模型 token 限制调整
