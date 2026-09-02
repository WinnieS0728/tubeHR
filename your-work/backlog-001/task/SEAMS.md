# BACKLOG-001 測試 Seam

> TDD 前必須確認的 public boundary。未確認 seam 不寫測試。

## 建議 Seam

| Seam | 測試對象 | 理由 | 確認 |
|------|----------|------|------|
| S1 | `FormList` render output | 使用者可見：可見 row 數、filter 結果 | ⬜ |
| S2 | `formListAtom` 讀寫 | 資料正確性：完整列表 vs filtered view | ⬜ |
| S3 | `useFormList` hook | 租戶切換 → refetch 行為 | ⬜ |

## 不建議測試的邊界

- Jotai 內部 implementation
- `FormCard` 私有 helper
- API client HTTP 細節（mock 在 seam 邊界外）

## 測試範例（Slice 2.1）

```typescript
// Red: filter 不應覆寫 atom
test("搜尋 filter 後 atom 仍保留完整列表", () => {
  // Given: 100 筆表單寫入 atom
  // When: 使用者搜尋至 10 筆
  // Then: atom.get() 仍為 100 筆；UI 顯示 10 筆
});
```

## Mock 策略

- API：`client.getForms` mock 回固定 fixture
- 不 mock：`useMemo` filter logic、atom read/write 公開 API
