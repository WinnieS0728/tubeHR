# BACKLOG-003 Review Seam

> 本工單為 review，非 code TDD。此文件定義 **review 檢查邊界**。

## Review Seam（檢查維度）

| Seam | 檢查對象 | Must-fix 判斷 | 確認 |
|------|----------|---------------|------|
| R1 | PR diff 本身 | build / runtime 新 bug | ⬜ |
| R2 | 與 FormList perf 目標 | 是否解 RC-01 | ⬜ |
| R3 | 與 BACKLOG-001 正確性 | 標 out-of-scope，不擋 merge | ⬜ |
| R4 | AI 生成 code 痕跡 | dead code、過度 pattern | ⬜ |

## 不在此 PR 檢查

- filter atom 覆寫（001 Step 2）
- 租戶 refetch（001 Step 3）
- approval race（002）

## 可選：Merge 後回歸測試建議

若 Kevin 修完 must-fix，可建議為 virtualization 加一行為測試：

```typescript
test("長列表只 render 可見範圍內的 FormCard", () => {
  // 對應 BACKLOG-001 AC-1.2
});
```

此測試屬 BACKLOG-001 TDD，非 003 scope。
