# BACKLOG-001 修復方案

## 必修（本次已實作）

| # | 問題 | 修法 | 檔案 |
|---|------|------|------|
| A | Filter 覆寫資料來源 | `formListAtom` 只存原始資料；`useMemo` 衍生 `filteredForms`；`handleFilterChange` 只改 `formFilterAtom` | `FormList.tsx`, `atoms.ts` |
| B | 全量 DOM render | 引入 `react-window` `FixedSizeList`，只 render 可視範圍 | `FormList.tsx`, `package.json` |
| C | `Date.now()` 破壞 memo | 移除 `renderedAt` prop 及 debug 時間戳 | `FormCard.tsx`, `FormList.tsx` |
| E | 租戶切換 stale data | `page.tsx` 傳 `serverTenantId`；sync localStorage → `tenantIdAtom`；`useEffect` deps 含 `tenantId`，切換時先 `setForms([])` 再 fetch | `FormList.tsx`, `page.tsx` |

## 建議下一輪（defer）

| # | 問題 | 建議 | 理由 |
|---|------|------|------|
| D | `key={idx}` | 已隨 virtualization 排除 | — |
| — | cookie vs localStorage 雙來源 | 統一 tenant 來源（建議單一 `TenantProvider`） | 需跨模組協調，超出 FormList 範圍 |
| — | 伺服器端搜尋/分頁 | 與後端對 `FormListQuery` contract，大列表改 server filter | 6000 筆全載入記憶體仍不理想 |
| — | 搜尋 debounce | 300ms debounce on search input | 修正 A+B 後 filter 已是 O(n) 純計算，優先級降 |
| — | Kevin PR #142 | 參考 virtualization 方向，但**不直接 merge** — 他的 PR 仍保留 filter 覆寫 bug、`Date.now()`、空 deps | 見 `notes-to-kevin.md` |
| — | 固定 row height 92px | 改 `VariableSizeList` 或 CSS truncate | 描述過長會被截，不影響正確性 |

## 對 Kevin PR #142 的判斷

**採用**：virtualization 方向、`memo` 自訂 compare 概念。

**不採用**：
- 仍保留 `setForms(filtered)`（Bug A 未修）
- 仍傳 `Date.now()`（Bug C 未修）
- `useEffect([], [])` 未處理 tenant（Bug E 未修）
- IntersectionObserver + `console.log` 埋點（production 不該留）
- 宣稱有 debounce 但 code 沒有

## 變更摘要

```
codebase/src/components/FormList.tsx   — 核心修正
codebase/src/components/FormCard.tsx   — 移除 renderedAt、強化 memo
codebase/src/lib/jotai/atoms.ts        — 註解釐清 atom 語意
codebase/src/app/(admin)/forms/page.tsx — 傳 serverTenantId
codebase/package.json                  — 新增 react-window
```
