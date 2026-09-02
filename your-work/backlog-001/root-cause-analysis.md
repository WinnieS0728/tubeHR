# BACKLOG-001 根因分析

本議題是**多個獨立 bug 疊加**，不是單一效能問題。以下分開說明。

---

## Bug A：Filter 覆寫資料來源（正確性 · P0）

**症狀**：搜尋或切換 status 後，清除條件仍只剩部分結果（客戶說「東西不見了」）。

**位置**：`codebase/src/components/FormList.tsx` — `handleFilterChange`

**根因**：
- `formListAtom` 同時扮演「API 原始列表」與「畫面顯示列表」
- `handleFilterChange` 對 `forms` 做 `.filter()` 後直接 `setForms(filtered)`，**永久丟失未篩選的資料**
- 再次清除搜尋時，只能從已縮小的子集合重新 filter，無法還原

**驗證方式**：載入 100 筆 → 搜尋縮到 5 筆 → 清空搜尋 → 仍只有 5 筆（程式碼靜態追蹤即可確認）。

---

## Bug B：一次 render 全部列（效能 · P0）

**症狀**：6000+ 表單初載 ~8 秒、滑動掉幀。

**位置**：`FormList.tsx` — `forms.map(...)` 無 virtualization

**根因**：
- 每筆都 mount 一個 `FormCard` DOM 節點
- 6000 節點 × 每張卡片的 `formatDistanceToNow`（date-fns locale 運算）= 大量 client 工作
- 網路 ~1 秒、其餘是 client 處理，與客服描述一致

---

## Bug C：`Date.now()` 在 render 期呼叫（效能 · P0）

**症狀**：`React.memo` 加了卻沒效果（Vivian 的嘗試失敗原因之一）。

**位置**：`FormList.tsx` 第 96 行 `renderedAt={Date.now()}`

**根因**：
- 每次 parent re-render，每張卡都拿到新的 `renderedAt`
- props 永遠變 → `memo` 比較永遠失敗 → 6000 張卡全部重繪
- `renderedAt` 僅用於 debug 時間戳，無業務價值

---

## Bug D：`key={idx}`（正確性 · P1）

**位置**：`FormList.tsx` — `forms.map((form, idx) => ... key={idx})`

**根因**：filter 後 index 與 entity 對應改變，React reconciliation 可能重用錯誤的 component state。應使用 `form.id`。

（virtualization 後改由 `react-window` 管理 index，此問題隨架構調整一併排除。）

---

## Bug E：租戶切換後顯示舊資料（正確性 · P0）

**症狀**：切換公司後列表仍夾雜上一個租戶的表單（ticket #4801）。

**位置**：`FormList.tsx` + `atoms.ts` + `page.tsx`

**根因（多點）**：
1. `useEffect(..., [])` 只在 mount 跑一次，**不會因租戶變更重新 fetch**
2. `tenantIdAtom` 被 read 但從未被 set，等於 dead code
3. `formListAtom` 是全域 Jotai atom，SPA 導航時**記憶體內舊列表不會自動清空**
4. SSR `page.tsx` 用 **cookie** 讀 tenant，client API 用 **localStorage** 帶 `X-Tenant-Id` — 兩者不同步時可能拿到錯誤資料

---

## Bug F：`useEffect` 空 deps 的其他副作用（正確性 · P1）

**位置**：`FormList.tsx` 第 27–37 行

**根因**：
- `filter` 變了不會重新打 API（目前靠 client-side filter，短期可接受）
- `initialData` 變了（例如 soft navigation）不會更新
- 與 Bug E 疊加造成 stale data

---

## 不屬於本 ticket 的項目（defer）

| 項目 | 理由 |
|------|------|
| 編輯頁 hydration 閃爍 | Vivian 便利貼，不同頁面、不同 root cause |
| Kevin PR #142 的 IntersectionObserver 埋點 | 與核心問題無關，且 deps `[]` 有 stale closure |
| 後端分頁 / 搜尋 API | 長期解法，本次先用 client filter + virtualization 止血 |
| `pageSize: 50` 只載入 50 筆 | 大客戶實際可能調高或 API 忽略分頁；需與後端確認 contract |
| 搜尋 debounce | 優化體感，非 root cause |
