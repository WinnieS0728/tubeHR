# 短期 vs 長期時序計畫

## 時間軸總覽

```
本週          下週（Tina 可能配合）    3 週後（原後端計畫）    Q3
  │                    │                      │                │
  ├─ P1 前端止血 ──────┤                      │                │
  │  (Layer 1-3)       ├─ 整合 updatedAt/ETag ┤                │
  │                    │  收斂 workaround     ├─ 完整 API 硬化 ─┤
  │                    │                      │                ├─ SSE/推送評估
```

---

## Phase 0：本週（Day 1–2）— 前端止血，不等後端

| 動作 | 負責 | 產出 |
|------|------|------|
| 合併 `ApprovalStatus` mitigation PR | 前端 | Layer 1–3 guard + updatedAt merge |
| 寫 QA 重現腳本（throttle） | 前端 | 給客服驗證修復 |
| 發 notes-to-tina | 前端 → Tina | 明確 API contract 需求 |
| 回覆客服 ticket #4744 | 前端 + Arthur | 「已修復，請客戶更新後觀察」 |

**客戶體感目標**：3 週內不再遇到跳回待簽。

**可退場的 workaround**：無（這是必要防護，即使後端改了也應保留 timestamp merge）。

---

## Phase 1：下週（若 Tina 交付）— 收斂 workaround

### 情境 A：Tina 只加 PATCH `updatedAt`

| 動作 | 說明 |
|------|------|
| `updateApprovalStatus` 型別補 `updatedAt` | 對齊 GET |
| mutation 成功後用 server `updatedAt` 更新 ref | 移除 client 時間猜測 |
| guard window 10s → 3s | 縮短過渡期 |

### 情境 B：Tina 加 ETag + If-Match

| 動作 | 說明 |
|------|------|
| `apiFetch` 支援 ETag 讀寫 | GET 存 ETag，PATCH 帶 If-Match |
| 412 處理 | 顯示衝突提示 + 強制 re-fetch |
| guard window 可移除 | ETag 已擋 stale write |

### 情境 C：Tina 來不及

| 動作 | 說明 |
|------|------|
| 維持 Phase 0 方案 | 已足夠止血 |
| Q3 再整合 ETag | 不阻塞客戶 |

---

## Phase 2：3 週後（原後端排程）— API 硬化

- 完整 ETag / If-Match（若 Phase 1 未做）
- read-your-writes 一致性保證
- OpenAPI spec 更新（解 `types/api.ts` any 問題）

**前端退場項**：
- post-mutation guard window（若 ETag + updatedAt 穩定）
- 保留 timestamp merge 作為防禦性程式

---

## Phase 3：Q3 長期 — 架構優化

| 項目 | 說明 |
|------|------|
| 抽 `useApprovalState` hook | 統一 `ApprovalStatus` + `useApprovalSync` |
| 評估 SSE / WebSocket | 多審核人即時協作場景 |
| 衝突解決 UI | 412 + 多人編輯提示 |
| 測試覆蓋 | race condition 整合測試（mock timer + delayed fetch） |

---

## 風險與應變

| 風險 | 應變 |
|------|------|
| `updatedAt` 精度不足（秒級） | 加 `version` 整數欄位 |
| 後端 clock skew | 用單調遞增 `version` 取代 timestamp |
| 客戶仍回報 | 加前端 logging（poll 結果 vs mutation 時間）送 Sentry |

---

## 怎麼讓客戶這 3 週不再遇到？

1. **本週 deploy Phase 0 前端修復**（最高優先）
2. **請 Arthur 回覆客戶**：已定位並修復，請清除快取或等下次部署
3. **暫時性客服話術**（若 deploy 前）：「若狀態跳回，請按 F5 重新整理；我們本週會發修復」
4. **部署後追蹤 1 週**：請 Arthur 標記 #4744 相關 ticket 是否再發生
