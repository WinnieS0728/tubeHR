# BACKLOG-004：員工離職交接清單 — 前端可行性評估

**分支**：`backlog/004-offboarding-checklist`  
**PR**：[#4 — BACKLOG-004：員工離職交接清單 — 前端可行性評估](https://github.com/WinnieS0728/tubeHR/pull/4)  
**狀態**：規劃完成，待 PM / 後端對齊  
**產出日期**：2026-09-02（精簡版）

---

## 文件索引

| 文件 | 內容 |
|------|------|
| [planning.md](./planning.md) | UI 結構、API 契約、狀態機 |
| [edge-cases-and-risks.md](./edge-cases-and-risks.md) | Edge cases、風險、待釐清、分階段建議 |

---

## 執行摘要

**前端可做，但高度依賴後端聚合 API 與 server-side deadline。** 離職交接跨 org、表單、簽核、IT 四個域，不應在前端拼湊多支零散 API。

### 五項核心決策

1. **單頁 dashboard**：一頁看清四區塊 + 截止倒數 + 狀態 banner。
2. **後端聚合 `OffboardingChecklist`**：前端以 checklist 為 single source of truth。
3. **狀態四態**：`in_progress` / `blocked` / `complete` / `frozen`；凍結由後端 cron 觸發。
4. **MVP 區塊 1–3 可操作**；區塊 4（IT 權限）唯讀 + HR 手動確認。
5. **先做 BACKLOG-001/002**，再排本 feature 實作。

### 時程粗估

| 階段 | Sprint | 交付 |
|------|--------|------|
| MVP | 2 | 四區塊 UI，1–3 可操作，4 唯讀確認，17:00 凍結演示 |
| P1 | +1 | 通知、IT 整合、連鎖離職、D+1 簽核規則 |
| V2 | +1–2 | 撤回離職、批量離職、報表 |

**總計 3–5 sprint**（後端聚合 API v1 就緒為前提）。

### 給 PM 的一句話

> MVP 2 sprint 可演示「四步交接 + 17:00 凍結」；要給 HR 每天用再加 1 sprint；連鎖離職與撤回留 V2。
