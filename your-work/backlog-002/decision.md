# BACKLOG-002 方案決策

**決策日期**：2026-05-27
**狀態**：已決策，待實作（本輪僅更新文件，不動 `codebase/`）

---

## 決策摘要

**採用 `updatedAt` timestamp merge 作為本 ticket 的修復方案。** ETag / If-Match 延後至 Q3 評估，不在本輪 scope。

---

## 為什麼選 `updatedAt` 而非 ETag / If-Match？

| 考量 | `updatedAt` | ETag + If-Match |
|------|-------------|-----------------|
| 解的本 ticket 問題 | ✅ stale poll 覆寫 UI | ✅ 也能，但主要強在寫入衝突 |
| 後端改動 | 小 — PATCH response 補 `updatedAt` | 大 — GET/PATCH 都要支援 header |
| GET 是否已有 | ✅ 已有 | ❌ 需新建 |
| 前端改動 | 小 — merge 邏輯 + guard | 中 — `apiFetch` ETag 管理、412 UI |
| Tina 下週 1–2 天能交付 | ✅ 很可能 | ⚠️ 勉強 |
| 符合本 ticket 場景 | ✅ HR 主管單人批次審核 | 過度 — 非多人搶改同一張單 |

**結論**：本 ticket 的核心是 read-after-write race（poll 拿到舊 `pending` 覆寫樂觀更新），`updatedAt` 已足夠。ETag / If-Match 留給「多人同時改同一張簽核單」成為真實痛點時再處理。

---

## 選定方案：三層前端防護 + `updatedAt`

```
Layer 1: mutation 期間暫停 poll
Layer 2: PATCH 成功後 guard window（10s，Tina 交付 PATCH updatedAt 後縮至 3s）
Layer 3: updatedAt 單調合併 — 只接受比本地已知更新的伺服器狀態
```

Layer 4（終態單調性）列為可選，時間允許再加。

---

## 後端需求（給 Tina）

**本輪只請一項**：`PATCH /api/approvals/{id}/status` response 回傳 `updatedAt`，格式對齊 GET。

詳見 [notes-to-tina.md](./notes-to-tina.md)。

---

## 明確不做（本輪）

- ETag / If-Match 整合
- WebSocket / SSE
- `useApprovalSync.ts` 重構（列技術債，非 blocker）
- `codebase/` 程式碼變更（本輪僅文件）

---

## 待辦（下一輪實作）

- [ ] `ApprovalStatus.tsx` — Layer 1–3 + 錯誤 rollback
- [ ] `useApprovalSync.ts` — 修 useEffect deps + timestamp merge（若時間允許）
- [ ] QA 重現腳本（DevTools throttle）
- [ ] 發 notes-to-tina 給 Tina
- [ ] 回覆客服 ticket #4744
