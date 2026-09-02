# BACKLOG-002 根因分析：簽核狀態偶發跳回

## 症狀

HR 主管點擊「同意」後，畫面短暫顯示「已同意」，數秒內又跳回「待簽」。再按一次通常就正常。客服 reload 後無法復現。

---

## 根因（高信心）

**樂觀更新 + 背景 poll 無條件覆寫狀態**，形成典型的 read-after-write race。

### 問題程式碼

`ApprovalStatus.tsx` 同時做兩件事：

1. **使用者操作**：`handleApprove` 先 `setStatus('approved')`（樂觀更新），再 `await updateApprovalStatus(...)`（PATCH）
2. **背景 poll**：每 3 秒 `fetchApprovalStatus` 並 **無條件** `setStatus(res.status)`

```37:47:codebase/src/components/ApprovalStatus.tsx
  const handleApprove = async () => {
    setUpdating(true);
    setStatus('approved');
    try {
      await updateApprovalStatus(submissionId, { status: 'approved' });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };
```

```25:35:codebase/src/components/ApprovalStatus.tsx
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetchApprovalStatus(submissionId);
        setStatus(res.status);
      } catch (err) {
        console.warn('poll failed', err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [submissionId]);
```

### 時序圖（失敗路徑）

```
t=0s    使用者點「同意」
        → setStatus('approved')     ← 使用者看到「已同意」
        → PATCH 開始（非同步）

t=0~2s  PATCH 尚在飛行中，或後端寫入尚未對 GET 可見
        （.NET API + 可能 read replica lag）

t=3s    poll 觸發
        → GET 仍回傳 status: 'pending'
        → setStatus('pending')      ← 狀態被舊資料覆寫，跳回「待簽」

t=5s+   PATCH 完成，但 poll 已經把 UI 打回去了
        使用者困惑，再按一次 → 此時後端已一致，第二次成功
```

### 為什麼 API 已有 `updatedAt` 卻沒擋住？

`fetchApprovalStatus` 回傳 `{ status, updatedAt }`，但元件**完全沒用 `updatedAt`**，無法判斷 poll 回來的是否為過期讀取。

```109:114:codebase/src/lib/api/client.ts
export async function fetchApprovalStatus(submissionId: string): Promise<{
  status: ApprovalStatus;
  updatedAt: string;
}> {
  return apiFetch(`/api/approvals/${submissionId}/status`);
}
```

### 附帶問題：`useApprovalSync.ts`

- `useEffect` **缺少 dependency array**，每次 render 都重設 interval（效能與行為不穩定）
- 同樣無條件覆寫 cache，若未來多處共用會放大 race
- 目前 `ApprovalPanel` 只用 `ApprovalStatus`，未接此 hook，但屬於潛在炸彈

---

## 為什麼客戶看得到、客服復現不出來？

| 面向 | 客戶（HR 主管） | 客服 / 內部 |
|------|----------------|-------------|
| 使用模式 | 長時間開著簽核頁、批次審多張單 | 收到 ticket 後 reload 測試 |
| 網路 | 企業 VPN、較慢或較不穩 | 辦公室網路快 |
| 觸發窗口 | 3 秒 poll 週期內 PATCH 未完成就會中招 | reload 時後端早已寫入，直接拿到正確狀態 |
| 重現難度 | 需「剛好在 PATCH 與 poll 重疊」 | 單次手動測很難踩到，但同一客戶一週 3 次代表**條件穩定存在** |

### 如何穩定重現（建議 QA 腳本）

1. 在 DevTools → Network 將 `PATCH .../status` throttle 為 Slow 3G
2. 開啟簽核頁，等第一次 poll 跑過
3. 點「同意」
4. 觀察 3 秒內 poll 的 GET 是否在 PATCH 完成前回來
5. 若 GET 先回 `pending`，UI 會跳回待簽 — **可穩定復現**

修復後用同一腳本驗證：UI 應維持「已同意」不跳回。

---

## 選定修復方案

**採用 `updatedAt` timestamp merge**（三層前端防護）。詳見 [decision.md](./decision.md) 與 [frontend-mitigation-plan.md](./frontend-mitigation-plan.md)。

| 修復手段 | 對應根因 |
|---------|---------|
| Layer 1：mutation 期間 pause poll | 擋 PATCH 飛行中被 poll 覆寫 |
| Layer 2：guard window | 擋 PATCH 完成後短暫 eventual consistency 窗口 |
| Layer 3：`updatedAt` merge | 根因核心 — poll 回舊 `pending` 但 `updatedAt` 未更新 → 丟棄 |

ETag / If-Match 不採用於本 ticket — 症狀是 stale read 非 lost update，延後 Q3。

---

## 結論

| 項目 | 判斷 |
|------|------|
| 根因 | 前端 poll 與 mutation 缺乏協調，非單純「後端 bug」 |
| 後端因素 | PATCH 未回 `updatedAt`、可能 read replica lag，加劇窗口 |
| 嚴重度 | P1 — 影響簽核信任感，客戶已威脅升級 |
| 前端能否止血 | **能**，`updatedAt` + guard 不需等 ETag |
| 修復方案 | **`updatedAt` 三層防護** — 見 [frontend-mitigation-plan.md](./frontend-mitigation-plan.md) |
