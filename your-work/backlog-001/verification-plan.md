# BACKLOG-001 驗證計畫（分三階段）

環境不需在本題跑起來，以下為 staging / 本機可執行的驗證步驟。每個 step merge 前須通過對應 gate，不必等後續 step 完成。

---

## Step 1 Gate — 篩選正確性（Bug A）

**何時跑**：Step 1 PR merge 前／後。

| 步驟 | 預期結果 |
|------|----------|
| 載入含 ≥100 筆表單的租戶 | 顯示完整筆數 |
| 搜尋關鍵字縮小結果 | 筆數減少 |
| 清空搜尋框 | **筆數恢復為原始總數** |
| 切換 status → 選「全部狀態」 | 恢復完整列表 |
| 先搜尋再切 status 再全部清除 | 仍恢復完整列表 |

**Regression 指標**：「清除後筆數 = 初載筆數」

**Step 1 通過即可**：對 PM／客服同步「篩選後資料消失」已修（效能問題留 Step 2）。

---

## Step 2 Gate — 效能（Bug B + C + D）

**何時跑**：Step 2 PR merge 前／後。須先確認 Step 1 仍通過（filter 邏輯未被 Step 2 改壞）。

| 場景 | 量測方式 | 目標 |
|------|----------|------|
| 初載 6000 筆 | Chrome Performance → LCP / scripting time | scripting 明顯低於修正前（目標 <3s client） |
| 快速滑動列表 | Performance monitor FPS | 維持 >45 FPS |
| 切換 status filter | 從點擊到畫面更新 | <1s（修正前 ~3-4s） |
| 連續輸入搜尋 | 每次 keystroke | 不卡死（debounce 為可選優化） |

**DOM 節點數**：Elements panel 中 FormCard 相關節點應只有 ~10–20 個（virtualization），非 6000。

**Step 2 回歸 Step 1**：merge 後再跑一輪 Step 1 gate，確認 filter 正確性未 regression。

---

## Step 3 Gate — 租戶切換（Bug E）⏳ 時間允許

**何時跑**：Step 3 PR merge 前／後（若本輪有做 Step 3）。

| 步驟 | 預期結果 |
|------|----------|
| 以租戶 A 登入，進入表單列表 | 只見 A 的表單 |
| 切換至租戶 B（不 reload） | 列表先清空或 loading，再顯示 B 的表單 |
| 確認無 B 租戶的表單名稱出現在 A | 無交叉資料 |
| Full page reload 後再切換 | 同上 |

**注意**：需確認 cookie 與 localStorage 的 `tenantId` 一致，否則需另開 ticket 統一來源。

**若 Step 3 未做**：在 release note 註明切換租戶後建議 full reload；此 gate 標記為 N/A。

---

## 全 step 共用 — 回歸測項

每個 step merge 前建議至少跑：

- [ ] 點擊表單卡片可進入編輯頁
- [ ] 空搜尋結果顯示「沒有符合條件的表單」（或等效 UI）
- [ ] `form.description` 為 null 時不 crash（顯示「無描述」）
- [ ] TypeScript `npm run typecheck` 通過
- [ ] `npm run lint` 無新增 error

---

## 建議補充的自動化測試（下一輪）

```typescript
// 伪代碼 — filter 不應 mutate source（Step 1 核心）
it('clears search restores full list', () => {
  render(<FormList initialData={mock100} />);
  typeSearch('test');
  expect(screen.getByText(/共 \d+ 筆/)).toHaveText('共 3 筆');
  clearSearch();
  expect(screen.getByText(/共 \d+ 筆/)).toHaveText('共 100 筆');
});
```

目前 repo 無 FormList 測試，建議 Step 1 merge 後優先補上。
