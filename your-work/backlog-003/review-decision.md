# PR #142 Review 決策

## 決策：**Request Changes**

## 一句話

virtualization 方向正確，但 PR 本身有 build blocker 和幾個它引入的問題要先修；BACKLOG-001 其餘正確性議題（filter、租戶等）已有排程，請 Kevin 後續依 001 處理，不在這張 PR 擋 merge。

---

## 為什麼不是 Approve

| 嚴重度 | 項目 | 理由 |
|--------|------|------|
| 🔴 必改（PR scope） | `react-window` 未加入 `package.json` | merge = CI 紅燈 |
| 🔴 必改（PR scope） | 自訂 `memo` compare 漏欄位 | PR 引入，可能顯示過期資料 |
| 🔴 必改（PR scope） | `IntersectionObserver` + `console.log` 無實際功能 | PR 引入，stale closure，production 不該留 |
| 🟡 建議改（PR scope） | description truncation 移除 + 固定 row height | UX regression |
| 🟡 建議改（PR scope） | `Row` 定義在 render 內 + inline onClick | 削弱 memo / virtualization 效益 |

## 不在此 PR 擋、改由 BACKLOG-001 排程處理

| 項目 | 說明 |
|------|------|
| filter 覆寫 `formListAtom` | 既有 bug，客戶「清除搜尋後資料消失」— 001 已排時程 |
| 切租戶資料殘留 | `tenantId` 讀了沒用、atom 未清 — 001 範圍 |
| `useEffect` fetch deps `[]` | filter / tenant 變不 refetch — 001 範圍 |
| debounce 搜尋 | PR 測試表寫了但 code 沒有 — 001 或 follow-up |

## 為什麼不是 Reject

- 方向對，`react-window` 選型合理，本機 perf 數字可信
- 問題多半是 PR 引入或 AI 幫倒忙，不是選型錯誤
- 001 其餘項目有排程，不需要一張 PR 扛全部

## 預期 merge 路徑

1. **本 PR**：加依賴、修/移除 PR 引入的 memo compare 和 observer、處理 description regression
2. **BACKLOG-001 後續**：filter 資料流、tenant refetch、debounce 等 — Kevin follow 001 時程
