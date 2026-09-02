# BACKLOG-004：員工離職交接清單 — 前端可行性評估

**分支**：`backlog/004-offboarding-checklist`  
**狀態**：規劃完成，待 PM / 後端對齊  
**語言**：繁體中文  
**產出日期**：2026-05-27

---

## 文件索引

| 文件 | 內容 |
|------|------|
| [01-ui-structure.md](./01-ui-structure.md) | UI 結構描述（頁面區塊、資訊密度、空狀態） |
| [02-api-contract.md](./02-api-contract.md) | API 契約草案（TypeScript interface + JSON 範例） |
| [03-state-machine.md](./03-state-machine.md) | 狀態流 / state machine（進行中、卡住、完成、凍結） |
| [04-edge-cases.md](./04-edge-cases.md) | Edge case 清單（12 項，含分類） |
| [05-phasing.md](./05-phasing.md) | MVP / P1 / V2 開發階段建議 + 時程估計 |
| [06-risks-and-open-questions.md](./06-risks-and-open-questions.md) | 風險與待釐清項目 |
| [07-worklog-notes.md](./07-worklog-notes.md) | WORKLOG 可引用筆記（取捨、協作決策、問題清單草稿） |

---

## 執行摘要

### 可行性結論

**前端可做，但高度依賴後端聚合 API 與截止時間的 server-side 權威。** FormAdmin 現有模組（表單列表、簽核狀態）可復用 UI 模式，但離職交接是跨域 workflow（組織架構 + 表單模板 + 簽核 + IT 權限），不應在前端拼湊多支零散 API。

### 規劃重點

1. **單頁 wizard-dashboard 混合**：一頁看清四個交接區塊 + 頂部截止倒數 + 整體狀態 banner。
2. **後端提供 `OffboardingChecklist` 聚合資源**：前端以 checklist 為 single source of truth，避免樂觀更新與 deadline race。
3. **狀態機四態**：`in_progress` → `blocked` / `complete` / `frozen`；凍結由後端 cron 觸發，前端只反映。
4. **MVP 只做 1–3 區塊的可操作交接**；IT 系統清單（區塊 4）MVP 先做唯讀 + 匯出，P1 才接 IT ticket 整合。
5. **最大風險**：簽核 race condition（BACKLOG-002 未解）、遞迴模板（離職清單本身被離職者負責）、主管連鎖離職。

### 時程粗估

| 階段 | Sprint 數 | 前提 |
|------|-----------|------|
| MVP | 2 sprint | 後端聚合 API 第一版就緒 |
| P1 | +1 sprint | IT 整合 + 通知 |
| V2 | +1–2 sprint | 連鎖離職、撤回離職、報表 |

---

## Edge case 統計

共 **12** 項（要求 8+），分類如下：

| 分類 | 數量 |
|------|------|
| 必須處理（MVP） | 5 |
| 可延後（P1/V2） | 4 |
| 後端主責 | 3 |

詳見 [04-edge-cases.md](./04-edge-cases.md)。
