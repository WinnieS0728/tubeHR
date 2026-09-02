# BACKLOG-001 Task 分解

> **工作流**：Phase 0 SDD → Phase 1–3 TDD 垂直切片

## Phase 0 — SDD（規格）

| # | 任務 | 產出 | 狀態 |
|---|------|------|------|
| 0.1 | 讀工單 + 根因分析 | `../root-cause-analysis.md` | ✅ |
| 0.2 | 撰寫 PWD 規格 | `../pwd/SPEC.md` | ✅ |
| 0.3 | 定義驗收條件 | `../pwd/ACCEPTANCE.md` | ✅ |
| 0.4 | 確認測試 seam | `SEAMS.md` | ⬜ 待確認 |

## Phase 1 — TDD Slice：列表效能（Step 1 PR）

| # | Red（失敗測試） | Green（最小實作） | 狀態 |
|---|----------------|-------------------|------|
| 1.1 | 長列表只 render 可見 row 數 | 引入 virtualization 或等效方案 | ⬜ |
| 1.2 | FormCard 不因時間戳在 render 重算 | 移除 render 期 `Date.now()` | ⬜ |
| 1.3 | 6000 筆 mock 首屏互動時間 | 整合 PR #142 方向或等效 | ⬜ |

**參考**：`codebase/PR-pending-form-card-perf.md`、BACKLOG-003 review 結論

## Phase 2 — TDD Slice：Filter 正確性（Step 2 PR）

| # | Red | Green | 狀態 |
|---|-----|-------|------|
| 2.1 | filter 後 atom 仍存完整列表 | 移除 `setForms(filtered)` | ⬜ |
| 2.2 | 清除 filter 還原全部 | `useMemo` derived filter | ⬜ |
| 2.3 | filter 切換不 refetch | 確認 deps 正確 | ⬜ |

## Phase 3 — TDD Slice：租戶切換（Step 3 PR）

| # | Red | Green | 狀態 |
|---|-----|-------|------|
| 3.1 | tenantId 變更觸發 refetch | `useFormList` effect deps | ⬜ |
| 3.2 | refetch 前不顯示舊資料 | loading / reset atom | ⬜ |
| 3.3 | 新資料僅含當前租戶 | integration test | ⬜ |

## 協作產出（非 code）

| # | 任務 | 檔案 | 狀態 |
|---|------|------|------|
| C.1 | 客戶溝通摘要 | `../customer-communication.md` | ✅ |
| C.2 | 給 Kevin 的分階段說明 | `../notes-to-kevin.md` | ✅ |
| C.3 | 驗證計畫 | `../verification-plan.md` | ✅ |

## 下一步

1. 確認 `SEAMS.md` 後委派 **tdd-implementer** 執行 Slice 1.1
2. 可並行 **sdd-spec-writer** 微調 Step 1 規格（若採 PR #142 方案）
