# BACKLOG-002 交付物索引

**方案決策**：採用 **`updatedAt` timestamp merge**（ETag / If-Match 延後 Q3）。詳見 [decision.md](./decision.md)。

| 檔案 | 內容 |
|------|------|
| [decision.md](./decision.md) | **方案決策紀錄** — 為何選 updatedAt、scope、待辦 |
| [root-cause-analysis.md](./root-cause-analysis.md) | 重現步驟、時序圖、根因說明 |
| [frontend-mitigation-plan.md](./frontend-mitigation-plan.md) | 三層前端防護（updatedAt 為核心） |
| [notes-to-tina.md](./notes-to-tina.md) | 給 Tina 的 API 需求 — **僅 PATCH `updatedAt`** |
| [timeline-plan.md](./timeline-plan.md) | 短期止血 → 下週整合 updatedAt → Q3 長期 |

---

## 票券產出對照（BACKLOG-002 checklist）

| 產出項 | 狀態 | 對應文件 |
|--------|------|---------|
| 重現 / 根因分析 | ✅ 完成 | [root-cause-analysis.md](./root-cause-analysis.md) |
| 前端 mitigate 方案 | ✅ 完成 | [frontend-mitigation-plan.md](./frontend-mitigation-plan.md) |
| 後端需求（回 Tina） | ✅ 完成 | [notes-to-tina.md](./notes-to-tina.md) |
| 時序計畫 | ✅ 完成 | [timeline-plan.md](./timeline-plan.md) |
| 客戶 3 週止血計畫 | ✅ 完成 | [timeline-plan.md](./timeline-plan.md) § 怎麼讓客戶不再遇到 |
| 程式碼實作 | ⏳ 待下一輪 | 見 [decision.md](./decision.md) 待辦 |

---

## 計畫中的程式碼變更（下一輪，不在本 PR）

> 本輪依要求 **不修改 `codebase/`**，以下為實作規格備忘。

| 檔案 | 變更 |
|------|------|
| `codebase/src/components/ApprovalStatus.tsx` | Layer 1–3 guard + `updatedAt` merge + PATCH 失敗 rollback |
| `codebase/src/hooks/useApprovalSync.ts` | 修 useEffect deps + timestamp merge（時間允許） |
| `codebase/src/lib/api/client.ts` | `updateApprovalStatus` 回傳型別補 `updatedAt`（Tina 交付後） |
