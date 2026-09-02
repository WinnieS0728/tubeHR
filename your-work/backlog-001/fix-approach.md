# BACKLOG-001 修復方案（分三階段）

因時間限制，本 ticket 拆成三個 step 依序交付。每個 step 獨立 PR、獨立 merge、獨立驗證。

---

## Step 1 — Filter 覆寫（Bug A）🔴 先做

**目標**：修正「搜尋／篩選後清除，資料仍只剩部分結果」的正確性問題。

**為什麼先做**：P0 正確性 bug，每次使用 filter 都會重現；改動範圍小、風險低；不依賴 virtualization。

| # | 問題 | 修法 | 檔案 |
|---|------|------|------|
| A | Filter 覆寫資料來源 | `formListAtom` 只存原始資料；`useMemo` 衍生 `filteredForms`；`handleFilterChange` 只改 `formFilterAtom` | `FormList.tsx`, `atoms.ts` |

**驗收標準**：搜尋 → 清空 → 筆數恢復初載總數；切換 status → 選「全部狀態」→ 恢復完整列表。

**可對外溝通**：Step 1 merge 後即可告知 PM／客服「篩選後資料消失」已修。

---

## Step 2 — Virtualization + Memo（Bug B + C + D）

**目標**：解決大列表初載慢、滑動卡頓、filter 切換卡 3–4 秒等效能問題。

**為什麼與 Step 1 分開**：Step 1 先穩定資料流；Step 2 在正確的 filter 邏輯上再做 render 優化，避免 Kevin PR #142 那種「perf 修了、正確性沒修」的情況。

| # | 問題 | 修法 | 檔案 |
|---|------|------|------|
| B | 全量 DOM render | 引入 `react-window` `FixedSizeList`，只 render 可視範圍 | `FormList.tsx`, `package.json` |
| C | `Date.now()` 破壞 memo | 移除 `renderedAt` prop 及 debug 時間戳 | `FormCard.tsx`, `FormList.tsx` |
| D | `key={idx}` | 隨 virtualization 一併處理（以 `form.id` 或 row index 正確對應） | `FormList.tsx` |

**額外改動（隨 Step 2 一併做）**：
- `FormCard` 加強 `memo` 自訂 compare（比對 `id`、`updatedAt`、`status`）
- `useCallback` 包 onClick handler

**驗收標準**：6000 筆初載 client scripting 明顯下降；滑動 FPS >45；DOM 中 FormCard 節點 ~10–20 個（非 6000）。

**Kevin PR #142**：virtualization 方向可參考，**不直接 merge**（仍含 Bug A、E 及 production 不該留的埋點）。詳見 `notes-to-kevin.md`。

---

## Step 3 — 租戶切換 stale data（Bug E）⏳ 時間允許再做

**目標**：切換公司後不再短暫顯示上一個租戶的表單。

**為什麼放最後**：重現率較低（sometimes）；牽涉 cookie vs localStorage、`page.tsx`、`useEffect` deps，範圍較廣。

| # | 問題 | 修法 | 檔案 |
|---|------|------|------|
| E | 租戶切換 stale data | `page.tsx` 傳 `serverTenantId`；sync localStorage → `tenantIdAtom`；`useEffect` deps 含 `tenantId`，切換時先 `setForms([])` 再 fetch | `FormList.tsx`, `page.tsx` |

**驗收標準**：租戶 A → B（不 full reload）→ 列表先清空或 loading，再顯示 B 的表單，無交叉資料。

**若 Step 3 來不及做**：在 release note 註明「切換租戶後建議 full reload」，並保留 TODO 供下一輪接手。

---

## 建議 defer（不在本次三 step 範圍）

| 項目 | 建議 | 理由 |
|------|------|------|
| cookie vs localStorage 雙來源 | 統一 tenant 來源（建議單一 `TenantProvider`） | 需跨模組協調，超出 FormList 範圍 |
| 伺服器端搜尋/分頁 | 與後端對 `FormListQuery` contract，大列表改 server filter | 6000 筆全載入記憶體仍不理想 |
| 搜尋 debounce | 300ms debounce on search input | Step 2 完成後 filter 已是 O(n) 純計算，優先級降 |
| 固定 row height 92px | 改 `VariableSizeList` 或 CSS truncate | 描述過長會被截，不影響正確性 |
| 編輯頁 hydration 閃爍 | 另開 ticket | 不同頁面、不同 root cause |

---

## PR 切法

| Step | PR 範圍 | 影響檔案 | 狀態 |
|------|---------|----------|------|
| **1** | Filter 資料流修正 | `FormList.tsx`, `atoms.ts` | 待實作 |
| **2** | Virtualization + memo | `FormList.tsx`, `FormCard.tsx`, `package.json` | 待實作 |
| **3** | 租戶切換 | `FormList.tsx`, `page.tsx` | 待實作（時間允許） |

---

## 對 Kevin PR #142 的判斷

**Step 2 可採用**：virtualization 方向、`memo` 自訂 compare 概念。

**不採用（各 step 對應）**：
- Step 1 未修：`setForms(filtered)`（Bug A）
- Step 2 未修：`Date.now()`（Bug C）
- Step 3 未修：`useEffect([], [])` 未處理 tenant（Bug E）
- 其他：IntersectionObserver + `console.log` 埋點；宣稱有 debounce 但 code 沒有
