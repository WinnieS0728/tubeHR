# BACKLOG-002 測試 Seam

## 建議 Seam

| Seam | 測試對象 | 理由 | 確認 |
|------|----------|------|------|
| S1 | `mergeApprovalState(local, incoming)` 純函式 | 核心 merge 邏輯，易 unit test | ⬜ |
| S2 | `useApprovalSync` hook 行為 | PATCH + poll 整合 | ⬜ |
| S3 | `ApprovalStatus` 顯示 | 使用者可見狀態 | ⬜ |

## 首選：S1 純函式 seam

將 timestamp merge 抽成 pure function，TDD 從這裡開始：

```typescript
// Red
test("incoming updatedAt 較舊時保留 local 狀態", () => {
  const local = { status: "approved", updatedAt: "2026-05-27T10:00:01Z" };
  const incoming = { status: "pending", updatedAt: "2026-05-27T10:00:00Z" };
  expect(mergeApprovalState(local, incoming)).toEqual(local);
});
```

## Mock 策略

- PATCH / GET：mock `client.patchApprovalStatus` / poll callback
- 不 mock merge 函式本身
