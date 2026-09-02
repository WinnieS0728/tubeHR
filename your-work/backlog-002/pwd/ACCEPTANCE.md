# BACKLOG-002 驗收條件

## 核心行為

- [ ] **AC-1** Given 使用者 PATCH 同意成功，When poll 回傳舊 `pending`，Then UI 仍顯示「已同意」
- [ ] **AC-2** Given poll 回傳的 `updatedAt` 早於 PATCH response，When merge，Then 保留 PATCH 狀態
- [ ] **AC-3** Given poll 回傳的 `updatedAt` 晚於 local，When merge，Then 採用 poll 狀態（後端確實更新）
- [ ] **AC-4** Given PATCH in-flight，When poll 觸發，Then 不覆寫該 approval 的 optimistic UI

## 邊界

- [ ] **AC-5** Given 無 `updatedAt` 的 legacy response，When merge，Then 優先保留 optimistic（graceful degrade）
- [ ] **AC-6** Given 使用者 F5 reload，When GET 最新，Then 顯示後端真實狀態

## 協作

- [ ] **AC-7** `notes-to-tina.md` 已送出（PATCH `updatedAt`）
- [ ] **AC-8** Deploy 後追蹤 ticket #4744

## 文件（已完成）

- [x] 根因分析
- [x] Mitigation 計畫
- [x] 方案決策
- [x] 時序計畫
