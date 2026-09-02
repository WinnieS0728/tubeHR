# BACKLOG-001 驗證計畫

環境不需在本題跑起來，以下為 staging / 本機可執行的驗證步驟。

---

## 1. 篩選正確性（Bug A）

| 步驟 | 預期結果 |
|------|----------|
| 載入含 ≥100 筆表單的租戶 | 顯示完整筆數 |
| 搜尋關鍵字縮小結果 | 筆數減少 |
| 清空搜尋框 | **筆數恢復為原始總數** |
| 切換 status → 選「全部狀態」 | 恢復完整列表 |
| 先搜尋再切 status 再全部清除 | 仍恢復完整列表 |

**Regression 指標**：「清除後筆數 = 初載筆數」

---

## 2. 效能（Bug B + C）

| 場景 | 量測方式 | 目標 |
|------|----------|------|
| 初載 6000 筆 | Chrome Performance → LCP / scripting time | scripting 明顯低於修正前（目標 <3s client） |
| 快速滑動列表 | Performance monitor FPS | 維持 >45 FPS |
| 切換 status filter | 從點擊到畫面更新 | <1s（修正前 ~3-4s） |
| 連續輸入搜尋 | 每次 keystroke | 不卡死（可選加 debounce 再測） |

**DOM 節點數**：Elements panel 中 FormCard 相關節點應只有 ~10–20 個（virtualization），非 6000。

---

## 3. 租戶切換（Bug E）

| 步驟 | 預期結果 |
|------|----------|
| 以租戶 A 登入，進入表單列表 | 只見 A 的表單 |
| 切換至租戶 B（不 reload） | 列表先清空或 loading，再顯示 B 的表單 |
| 確認無 B 租戶的表單名稱出現在 A | 無交叉資料 |
| Full page reload 後再切換 | 同上 |

**注意**：需確認 cookie 與 localStorage 的 `tenantId` 一致，否則需另開 ticket 統一來源。

---

## 4. 回歸測項

- [ ] 點擊表單卡片可進入編輯頁
- [ ] 空搜尋結果顯示「沒有符合條件的表單」
- [ ] `form.description` 為 null 時不 crash（顯示「無描述」）
- [ ] TypeScript `npm run typecheck` 通過
- [ ] `npm run lint` 無新增 error

---

## 5. 建議補充的自動化測試（下一輪）

```typescript
// 伪代碼 — filter 不應 mutate source
it('clears search restores full list', () => {
  render(<FormList initialData={mock100} />);
  typeSearch('test');
  expect(screen.getByText(/共 \d+ 筆/)).toHaveText('共 3 筆');
  clearSearch();
  expect(screen.getByText(/共 \d+ 筆/)).toHaveText('共 100 筆');
});
```

目前 repo 無 FormList 測試，建議下一輪補上。
