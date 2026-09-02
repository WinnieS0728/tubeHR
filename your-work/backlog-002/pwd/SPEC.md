# BACKLOG-002 PWD — 簽核狀態偶發跳回

> **狀態**：SDD 規格 v1 | **優先級**：P1 | **類型**：前端 mitigate（需 TDD）

## 1. 問題陳述

HR 主管按「同意」後，畫面短暫顯示已同意，數秒後跳回「待簽」。客服 reload 無法復現；同客戶一週 3 次回報。

## 2. 根因

**Read-after-write race**：使用者 PATCH 成功 → 樂觀更新 UI → 背景 poll 拿到舊 `pending` → 覆寫 UI。

觸發條件組合：
- 長時間開著簽核頁 + 批次審多張
- poll interval 與 PATCH 時間窗重疊
- 後端 GET 無 ETag，僅能 poll

詳細分析：`../root-cause-analysis.md`

## 3. 方案決策（已確認）

| 項目 | 決策 |
|------|------|
| 核心修復 | **`updatedAt` timestamp merge** |
| ETag / If-Match | 延後 Q3（非本 ticket blocker） |
| 後端請求 | PATCH response 補 `updatedAt`（`../notes-to-tina.md`） |

## 4. 期望行為（三層防護）

### Layer 1 — Optimistic UI Guard
- PATCH 進行中，poll 結果不覆寫該 approval 的 optimistic 狀態

### Layer 2 — Timestamp Merge
- 合併 poll 結果時：若 incoming `updatedAt` ≤ local `updatedAt`，保留 local
- PATCH response 的 `updatedAt` 寫入 local

### Layer 3 — Poll 節流
- PATCH 成功後 N 秒內跳過該 approval 的 poll merge（或延遲下一輪 poll）

## 5. 非目標

- 後端 ETag 實作（Q3）
- WebSocket / SSE（後端 3 週內不動）
- 多人同時改同一張簽核單（不同場景）

## 6. 相關程式碼

- `codebase/src/hooks/useApprovalSync.ts`
- `codebase/src/components/ApprovalStatus.tsx`
- `codebase/src/lib/api/client.ts`

## 7. 參考

- 原始工單：`backlog/BACKLOG-002-approval-race.md`
- Mitigation 計畫：`../frontend-mitigation-plan.md`
- 時序計畫：`../timeline-plan.md`
- 決策紀錄：`../decision.md`
