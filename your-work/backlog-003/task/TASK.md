# BACKLOG-003 Task 分解

> **工作流**：SDD review rubric → Review 執行（無 TDD code loop）

## Phase 0 — SDD（Review 規格）

| # | 任務 | 產出 | 狀態 |
|---|------|------|------|
| 0.1 | 讀 PR diff | `codebase/PR-pending-form-card-perf.md` | ⬜ |
| 0.2 | 對照 BACKLOG-001 根因 | `../backlog-001/root-cause-analysis.md` | ⬜ |
| 0.3 | 建立 review rubric | `../pwd/SPEC.md` | ✅ |
| 0.4 | 讀 team-chat / ARCHITECTURE | 上下文 | ⬜ |

## Phase 1 — Review 執行

| # | 任務 | 產出 | 狀態 |
|---|------|------|------|
| 1.1 | 分類 must-fix 項 | Thread 1–N in review comments | ✅ |
| 1.2 | 標記 out-of-scope → 001 | Thread 2, 8 | ✅ |
| 1.3 | 撰寫 teaching comments | Thread 中穿插 | ✅ |
| 1.4 | 撰寫 review 總結 | `../review-decision.md` | ✅ |

## Phase 2 — 溝通

| # | 任務 | 產出 | 狀態 |
|---|------|------|------|
| 2.1 | 私訊 Kevin | `../message-to-kevin.md` | ✅ |
| 2.2 | 訊息 David | `../message-to-david.md` | ✅ |
| 2.3 | WORKLOG 筆記 | `../worklog-notes.md` | ✅ |

## Phase 3 — Follow-up（Kevin merge 後）

| # | 任務 | 負責 | 狀態 |
|---|------|------|------|
| 3.1 | Kevin 修 must-fix | Kevin | ⬜ |
| 3.2 | Merge PR #142 | Reviewer approve | ⬜ |
| 3.3 | BACKLOG-001 Step 2/3 接續 | 001 task | ⬜ |

## 注意

本工單**不走 TDD red-green loop**。若 Kevin 修 PR 後需回歸測試建議，寫在 review comment 即可。

## 下一步

- 若 PR 內容更新，重新跑 Phase 1
- Merge 後將 virtualization 整合進 BACKLOG-001 Phase 1
