# BACKLOG-001 驗收條件

## Step 1 — 列表效能

- [ ] **AC-1.1** Given 6000 筆 mock 表單，When 列表頁 mount，Then 首屏可互動 < 2s（API mock 1s）
- [ ] **AC-1.2** Given 長列表，When 使用者 scroll，Then DOM 中 row 數量 ≈ viewport + overscan（非全量）
- [ ] **AC-1.3** Given 靜態 props，When re-render，Then `FormCard` 不因 `Date.now()` 無故重算

## Step 2 — Filter 正確性

- [ ] **AC-2.1** Given 100 筆表單，When 搜尋名稱 filter 至 10 筆，Then atom 仍存 100 筆
- [ ] **AC-2.2** Given 已 filter，When 清除搜尋，Then UI 顯示完整 100 筆
- [ ] **AC-2.3** Given status filter，When 切換 filter，Then 不觸發 API refetch（client-side only）

## Step 3 — 租戶切換

- [ ] **AC-3.1** Given 租戶 A 有表單，When 切換至租戶 B，Then 不顯示租戶 A 的表單
- [ ] **AC-3.2** Given 租戶切換，When refetch 進行中，Then 顯示 loading 或空狀態
- [ ] **AC-3.3** Given refetch 完成，When 渲染列表，Then 僅含租戶 B 表單

## 整體

- [ ] **AC-4.1** 客戶溝通摘要已更新（`../customer-communication.md`）
- [ ] **AC-4.2** 驗證計畫三階段已執行或記錄結果（`../verification-plan.md`）
