# BACKLOG-002 Task 分解

> **工作流**：Phase 0 SDD ✅ → Phase 1 TDD 實作 ⬜

## Phase 0 — SDD（規格）✅

| # | 任務 | 產出 | 狀態 |
|---|------|------|------|
| 0.1 | 根因分析 | `../root-cause-analysis.md` | ✅ |
| 0.2 | 方案決策 | `../decision.md` | ✅ |
| 0.3 | Mitigation 計畫 | `../frontend-mitigation-plan.md` | ✅ |
| 0.4 | PWD 規格 | `../pwd/SPEC.md` | ✅ |
| 0.5 | 後端溝通 | `../notes-to-tina.md` | ✅ |
| 0.6 | 確認 seam | `SEAMS.md` | ⬜ |

## Phase 1 — TDD Slice：Timestamp Merge

| # | Red | Green | 狀態 |
|---|-----|-------|------|
| 1.1 | 舊 poll 不覆寫新 PATCH | `mergeByUpdatedAt()` 函式 | ⬜ |
| 1.2 | PATCH response 更新 local timestamp | `useApprovalSync` PATCH handler | ⬜ |
| 1.3 | in-flight guard 阻擋 poll 覆寫 | optimistic lock per approvalId | ⬜ |

## Phase 2 — TDD Slice：Poll 節流

| # | Red | Green | 狀態 |
|---|-----|-------|------|
| 2.1 | PATCH 後 N 秒 skip merge | debounce / cooldown map | ⬜ |

## Phase 3 — 整合驗證

| # | 任務 | 狀態 |
|---|------|------|
| 3.1 | 手動模擬 race（mock poll + PATCH 時序） | ⬜ |
| 3.2 | 更新 `../timeline-plan.md` deploy 狀態 | ⬜ |
| 3.3 | 回覆客服 #4744 | ⬜ |

## 下一步

1. 確認 `SEAMS.md`
2. 委派 **tdd-implementer** 從 Slice 1.1 開始
3. 002 完成後，004 區塊三可沿用同一 merge 策略
