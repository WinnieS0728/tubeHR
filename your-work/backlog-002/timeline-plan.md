# 短期 vs 長期時序計畫

**方案決策**：本 ticket 採 **`updatedAt`**；ETag / If-Match 延後 Q3。詳見 [decision.md](./decision.md)。

---

## 時間軸總覽

```
本週                    下週（Tina 配合）         Q3（長期）
  │                            │                      │
  ├─ 文件 + 方案定案 ──────────┤                      │
  │  (updatedAt 三層防護)        ├─ 整合 PATCH updatedAt ┤
  │                            │  收斂 guard window    ├─ ETag/If-Match 評估
  ├─ 前端實作 PR（下一輪）───────┤                      │  SSE/推送評估
  │                            │                      │
```

---

## Phase 0：本週 — 方案定案 + 前端止血（下一輪實作）

| 動作 | 負責 | 產出 | 狀態 |
|------|------|------|------|
| 根因分析 + 方案決策 | 前端 | `your-work/backlog-002/` 文件 | ✅ 完成 |
| 合併 `ApprovalStatus` mitigation PR | 前端 | Layer 1–3 + `updatedAt` merge | ⏳ 下一輪 |
| 寫 QA 重現腳本（DevTools throttle） | 前端 | 給客服驗證修復 | ⏳ 下一輪 |
| 發 notes-to-tina | 前端 → Tina | 僅請 PATCH `updatedAt` | ✅ 文件就緒 |
| 回覆客服 ticket #4744 | 前端 + Arthur | deploy 後通知客戶 | ⏳ deploy 後 |

**客戶體感目標**：deploy 後不再遇到跳回待簽。

**不退場的防護**：`updatedAt` timestamp merge — 即使 Tina 交付後也保留，作為 stale poll 的第二道防線。

---

## Phase 1：下週 — 整合 PATCH `updatedAt`

### 情境 A：Tina 交付 PATCH `updatedAt`（預期路徑）

| 動作 | 說明 |
|------|------|
| `updateApprovalStatus` 回傳型別補 `updatedAt` | 對齊 GET |
| mutation 成功後用 server `updatedAt` 更新 ref | 移除 client 時間猜測 |
| guard window 10s → 3s | 縮短過渡期 |

### 情境 B：Tina 來不及

| 動作 | 說明 |
|------|------|
| 維持 Phase 0 方案 | GET `updatedAt` + guard 已足夠止血 |
| Q3 再請 PATCH `updatedAt` | 不阻塞客戶 |

---

## Phase 2：Q3 長期 — 視需求評估

| 項目 | 說明 | 觸發條件 |
|------|------|---------|
| ETag + If-Match | 根治 lost update、412 衝突 UI | 多人同時改同一張單成為真實痛點 |
| read-your-writes 一致性 | PATCH 後 GET 走 primary | 客戶仍回報且確認 replica lag |
| OpenAPI spec | 解 `types/api.ts` any 問題 | 後端排程 |
| SSE / WebSocket | 多審核人即時協作 | 產品需求 |

**前端退場項（Q3 若做 ETag）**：
- post-mutation guard window
- 保留 `updatedAt` merge 作為防禦性程式

---

## Phase 3：架構優化（時間允許）

| 項目 | 說明 |
|------|------|
| 抽 `useApprovalState` hook | 統一 `ApprovalStatus` + `useApprovalSync` |
| 修 `useApprovalSync.ts` | useEffect deps + timestamp merge |
| 測試覆蓋 | race condition 整合測試（mock timer + delayed fetch） |

---

## 風險與應變

| 風險 | 應變 |
|------|------|
| `updatedAt` 精度不足（秒級） | 請 Tina 加 `version` 整數欄位 |
| 後端 clock skew | 用單調遞增 `version` 取代 timestamp |
| 客戶仍回報 | 加前端 logging（poll vs mutation 時間）送 Sentry；再評估 read-your-writes |
| 多人同時改同一張單 | Q3 評估 ETag / If-Match |

---

## 怎麼讓客戶這 3 週不再遇到？

1. **下一輪 merge 前端修復 PR 並 deploy**（最高優先）
2. **請 Arthur 回覆客戶**：已定位並修復，請等下次部署
3. **deploy 前暫時話術**：「若狀態跳回，請按 F5；我們本週會發修復」
4. **部署後追蹤 1 週**：請 Arthur 標記 #4744 是否再發生
