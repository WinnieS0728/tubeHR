# BACKLOG-001 PWD — FormList 效能與正確性

> **狀態**：SDD 規格 v1 | **優先級**：P0 | **類型**：修復（需 TDD）

## 1. 問題陳述

S Tier 客戶 reportlab（6000+ 表單）回報 FormAdmin 列表頁：
- 初載 ~8 秒（client 處理佔多數）
- 滑動掉幀
- filter / 搜尋切換卡 3–4 秒
- **搜尋後清除，列表仍只剩搜尋結果**（資料「消失」）
- 切換租戶 sometimes 仍看到舊租戶表單

## 2. 根因（多 bug 分離）

| ID | 類型 | 根因 | 相關檔案 |
|----|------|------|----------|
| RC-01 | Perf | 一次 render 全量 row；`Date.now()` 在 render 觸發重算 | `FormList.tsx`, `FormCard.tsx` |
| RC-02 | Correctness | filter 結果 `setForms(filtered)` 覆寫 atom，清除搜尋無法還原 | `FormList.tsx`, `atoms.ts` |
| RC-03 | Correctness | 租戶切換未 refetch / reset atom | `useFormList.ts`, `page.tsx` |
| RC-04 | Out of scope | 編輯頁 hydration 閃爍 | 另開 ticket |

詳細分析：`../root-cause-analysis.md`

## 3. 期望行為（規格）

### 3.1 列表效能（Step 1）
- 6000 筆表單下，首屏可互動時間 < 2s（mock API 1s 前提下）
- 滑動時只 render 可見 viewport + overscan
- 每 row 不因 `Date.now()` 在每次 render 重算

### 3.2 Filter 正確性（Step 2）
- `formListAtom` 永遠保存**完整** API 回傳列表
- status / 名稱 filter 僅為 derived view（`useMemo`），不寫回 atom
- 清除 filter 後列表與 API 原始資料一致

### 3.3 租戶切換（Step 3）
- 切換 `tenantId` 後觸發 refetch
- 新資料載入前顯示 loading 或空狀態，不顯示舊租戶資料
- atom 與 cookie/localStorage 的 tenantId 一致

## 4. 非目標

- 編輯頁 hydration（RC-04）
- 後端 API 分頁（本輪 client-side 優化優先）
- 一次 PR 解決全部（分三階段獨立 merge）

## 5. 交付策略

三階段獨立 PR，詳見 `../fix-approach.md` 與 `task/TASK.md`。

## 6. 相關程式碼

- `codebase/src/components/FormList.tsx`
- `codebase/src/components/FormCard.tsx`
- `codebase/src/lib/jotai/atoms.ts`
- `codebase/src/hooks/useFormList.ts`
- `codebase/src/app/(admin)/forms/page.tsx`
- `codebase/PR-pending-form-card-perf.md`（Kevin PR #142 方向）

## 7. 參考

- 原始工單：`backlog/BACKLOG-001-form-list-performance.md`
- 客戶溝通：`../customer-communication.md`
- 驗證計畫：`../verification-plan.md`
