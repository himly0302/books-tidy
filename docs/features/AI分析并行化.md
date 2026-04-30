# AI 分析并行化 - 功能开发文档

> 生成时间：2026-04-30
> 基于项目：books-tidy

---

## 开发上下文

**相关技术栈**：TypeScript、原生 fetch API、Promise.all 并发控制
**关联模块**：analyzer（`src/analyzer.ts`）— AI 批量分析模块
**代码风格**：同步为主、async/await、console.log 输出、无第三方异步库

---

## 开发方案

### 要实现什么

- 核心功能 1：将 AI 分析的多个批次从串行改为并发执行，大幅缩短总耗时
- 核心功能 2：支持并发数配置（通过环境变量 `AI_CONCURRENCY`），默认 3

### 与现有功能的关系

- 依赖现有模块：analyzer — `analyzeBatch` 函数本身不变，仅改变调用方式
- 集成位置：`src/analyzer.ts:22-28`（`analyzeBooks` 函数中的批次循环）

### 新增依赖

无。使用原生 `Promise.all` + 手写并发控制。

### 需要修改的文件

```
src/analyzer.ts  # 修改内容：analyzeBooks 函数的批次调度逻辑，从串行 for 循环改为并发执行
```

### 需要新增的文件

无

---

## 实施步骤

**步骤 1：核心实现**

- [ ] 在 `analyzeBooks` 中实现并发控制函数 `runConcurrent`
- [ ] 将串行 `for` 循环替换为并发调度，保持结果顺序
- [ ] 更新进度日志，显示并发执行状态
- [ ] 支持通过 `AI_CONCURRENCY` 环境变量配置并发数，默认 3

**步骤 2：集成到现有系统**

- [ ] 修改 `src/analyzer.ts`：替换 `analyzeBooks` 中的批次循环

**步骤 3：验收检查**

- [ ] 单批次（≤60 本书）时行为与修改前一致
- [ ] 多批次时并发执行，总耗时接近 `单批次耗时 × ceil(总批次数 / 并发数)`
- [ ] 进度日志正确显示已完成/总数
- [ ] 某批次失败时正确抛出错误，不静默吞掉
- [ ] 结果顺序与输入顺序一致

**步骤 4：文档更新与提交**

| 文档 | 需要更新 | 不需要更新 |
|------|----------|-----------|
| **CHANGELOG.md** | ✅ 每次功能完成必须更新 | - |
| **README.md** | - | ✅ 内部优化，无用户可见行为变更 |
| **CLAUDE.md** | ✅ 新增环境变量说明 | - |

**CLAUDE.md 更新清单**（逐条列出需要更新的 section 和具体内容）：

| CLAUDE.md section | 更新内容 |
|-------------------|---------|
| 环境变量 | 新增 `AI_CONCURRENCY` 环境变量说明 |

**CHANGELOG.md 更新**（在 `## [Unreleased]` 下添加）：

```markdown
### Changed
- **AI 分析并行化**：多个批次并发调用 AI API，大幅缩短大量书籍的分析耗时
  - 默认并发数 3，可通过 `AI_CONCURRENCY` 环境变量调整
  - 相关文件：`src/analyzer.ts`
```

**提交代码**：

```bash
git add src/analyzer.ts CHANGELOG.md CLAUDE.md
git commit -m "feat: AI 分析批次并行执行"
```

**步骤 5：自检**

- [ ] 验收条件是否全部通过
- [ ] CHANGELOG.md 是否已更新
- [ ] CLAUDE.md 更新清单中的每一项是否都已执行
- [ ] 所有相关文件是否已提交

---

## 约束与风险

- **API 限流**：并发数过高可能触发 API 速率限制，默认值 3 保守安全，用户可按需调整
- **结果顺序**：并发执行但必须保持结果与输入的顺序对应
- **错误处理**：任一批次失败应立即中断，`Promise.all` 天然满足此行为
- **兼容性**：纯内部优化，对外接口 `analyzeBooks` 签名和返回值不变
