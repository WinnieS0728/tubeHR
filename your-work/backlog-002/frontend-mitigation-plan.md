# 前端 Mitigation 方案（假設後端 3 週內不動）

## 目標

讓 HR 主管在點「同意/駁回」後，**不再看到狀態跳回待簽**，即使後端 GET 短暫回傳舊資料。

---

## 策略概覽（三層防護）

```
Layer 1: mutation 期間暫停 poll
Layer 2: mutation 成功後設 guard window（10–15s 內忽略 stale poll）
Layer 3: 用 updatedAt 做單調遞增合併（只接受比本地已知更新的伺服器狀態）
```

三層可獨立運作，疊加後覆蓋率最高。Layer 1+2 可立即上線；Layer 3 依賴 GET 回傳的 `updatedAt`（已有，但未使用）。

---

## Layer 1：Mutation 期間暫停 poll

**做法**：poll callback 開頭檢查 `updating === true` 則 skip。

**效果**：擋住 PATCH 飛行中的覆寫。

**侷限**：PATCH 完成後、後端尚未一致時，下一次 poll 仍可能帶回舊值 → 需 Layer 2。

---

## Layer 2：Post-mutation guard window

**做法**：PATCH 成功後記錄 `mutationGuardUntil = Date.now() + 10_000`，guard 期間忽略 poll 結果。

**效果**：給後端 10 秒 eventual consistency 緩衝。多數 .NET write → read 延遲 < 数秒。

**trade-off**：
- 若其他審核人在 guard 期間改了同一張單，UI 可能短暫不同步 → 可接受（HR 主管場景多為單人操作自己的待簽）
- guard 結束後仍靠 Layer 3 兜底

---

## Layer 3：updatedAt 單調合併

**做法**：

```typescript
const lastServerUpdatedAtRef = useRef<string | null>(null);

// poll 時
if (lastServerUpdatedAtRef.current && res.updatedAt <= lastServerUpdatedAtRef.current) {
  return; // 過期讀取，丟棄
}
lastServerUpdatedAtRef.current = res.updatedAt;
setStatus(res.status);
```

**效果**：即使 guard 過期，只要伺服器 `updatedAt` 沒變新，就不會用舊 status 覆寫。

**侷限**：PATCH response 目前不回 `updatedAt`，mutation 後需暫用 client timestamp 或再 GET 一次確認（見下方 Tina 需求）。

---

## Layer 4（可選）：狀態單調性

終態（`approved` / `rejected` / `withdrawn`）不應被非終態覆寫，除非 `updatedAt` 明確更新。

```typescript
const isFinal = (s: Status) => ['approved','rejected','withdrawn'].includes(s);
// poll 時：若本地已是 final 且 server 回 non-final 且 updatedAt 未更新 → ignore
```

防禦後端或 cache 異常回傳。

---

## 錯誤處理

目前 PATCH 失敗只 `console.error`，樂觀更新不會 rollback。

**建議**：
- PATCH 失敗 → `setStatus` 回到 mutation 前狀態（或 re-fetch）
- 顯示 toast：「簽核失敗，請重試」

---

## `useApprovalSync.ts` 同步修復

若未來多元件共用簽核狀態，應將上述合併邏輯抽到 `useApprovalSync` 或 `lib/approvalState.ts`：

1. 修 `useEffect` 缺少 `[]` 的 bug
2. cache 寫入改為 timestamp-aware merge
3. 對外暴露 `mutateApprovalStatus()` 統一處理 PATCH + guard

**現階段**：`ApprovalPanel` 未用此 hook，優先修 `ApprovalStatus.tsx`，但應在 PR 註記技術債。

---

## 不建議的做法

| 方案 | 為何不採 |
|------|---------|
| 關掉 poll | 其他 tab / 協作者改狀態時 UI 會過期 |
| 無限樂觀更新、永不接受 server | 真實被駁回/撤回時 UI 會騙人 |
| 每次 PATCH 後 hard reload | 體驗差，且未解根本 race |
| 等後端 ETag 才修 | 客戶等不了 3 週 |

---

## 驗收標準

- [ ] Network throttle 下點同意，UI 不跳回待簽
- [ ] PATCH 失敗時 UI rollback + 錯誤提示
- [ ] 正常 poll 仍能反映他人操作（guard 過期後）
- [ ] 無新增 console error / infinite loop
