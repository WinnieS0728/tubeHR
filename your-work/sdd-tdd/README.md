# SDD + TDD 工作流

本資料夾說明 TubeHR onboarding 四張工單的 **Specification-Driven Development (SDD)** 與 **Test-Driven Development (TDD)** 協作方式。

## 名詞

| 名詞 | 意義 | 位置 |
|------|------|------|
| **PWD** | Project Working Document — 實作前的行為規格 | `your-work/backlog-XXX/pwd/` |
| **Task** | 可執行的任務切片 + TDD seam 定義 | `your-work/backlog-XXX/task/` |
| **Subagent** | Cursor 專用 subagent，分工撰規格 / 實作 / 協調 | `.cursor/agents/` |

## 標準流程

```
backlog/BACKLOG-XXX.md          ← 原始需求
        ↓
ticket-coordinator              ← 判斷工單與階段
        ↓
sdd-spec-writer → pwd/SPEC.md   ← SDD：寫規格
                → pwd/ACCEPTANCE.md
        ↓
task/TASK.md + task/SEAMS.md    ← 拆切片、定測試邊界
        ↓
tdd-implementer                 ← TDD：red → green（001/002）
        ↓
your-work/ 交付物 + codebase/ 修改
```

## 四張工單速查

| 工單 | 類型 | SDD | TDD code |
|------|------|-----|----------|
| [001](../backlog-001/pwd/SPEC.md) | P0 修復 | ✅ | ✅ |
| [002](../backlog-002/pwd/SPEC.md) | P1 修復 | ✅ | ✅ |
| [003](../backlog-003/pwd/SPEC.md) | P2 review | ✅ (rubric) | ❌ |
| [004](../backlog-004/pwd/SPEC.md) | ⭐ 規劃 | ✅ | ❌ |

## 如何使用 Subagent

在 Cursor 對話中：

```
用 ticket-coordinator 幫我決定今天先做哪張工單
```

```
用 sdd-spec-writer 更新 backlog-001 的 PWD
```

```
用 tdd-implementer 實作 backlog-002 的 slice 2
```

## 建議優先順序

1. **BACKLOG-001** — 客戶 P0，影響最大
2. **BACKLOG-002** — 簽核 race，文件已完成，待 code + test
3. **BACKLOG-003** — Kevin 等 review，可與 001 並行
4. **BACKLOG-004** — 加分規劃題，時間允許再做

## 與既有文件的關係

- `your-work/backlog-XXX/` 根目錄的既有分析（如 `root-cause-analysis.md`）**保留**，PWD 引用而非取代
- `WORKLOG.md` / `QUESTIONS.md` 仍為面試交付的必備文件
- `pwd/` 與 `task/` 是工作流結構，面試時可展示 SDD+TDD 方法論
