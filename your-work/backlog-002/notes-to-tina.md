# 給 Tina（後端）的 API 需求

> 可直接貼到 Teams `#tubehr-foundation-frontend`，cc David。

---

@Tina 你好，BACKLOG-002 簽核狀態跳回我們前端這邊已定位根因（poll 與 PATCH race），會先上前端 guard 止血。若你下週能擠 1–2 天，**請優先幫 `PATCH /api/approvals/{id}/status` 補齊以下 contract**：

## 需求（優先順序）

### 1. PATCH response 回傳 `updatedAt`（最低成本、最高收益）

```json
// PATCH /api/approvals/{id}/status
// Response 200
{
  "status": "approved",
  "updatedAt": "2026-05-27T11:30:00.000Z"
}
```

**為什麼**：GET 已有 `updatedAt`，但 PATCH 沒有。前端 mutation 後無法知道「伺服器認定的最新版本」，只能靠 client 時間猜，guard window 是 workaround。PATCH 回 `updatedAt` 後，前端可用同一套 timestamp merge，guard 可縮短或移除。

### 2. GET 與 PATCH 回傳一致的 `ETag` + 支援 `If-Match`（理想方案）

```
GET  /api/approvals/{id}/status
→ 200 { status, updatedAt }
→ ETag: "W/\"abc123\""

PATCH /api/approvals/{id}/status
→ Request: If-Match: "W/\"abc123\""
→ 200 { status, updatedAt }
→ ETag: "W/\"def456\""

→ 412 Precondition Failed（版本衝突，有人先改了）
```

**為什麼**：根治 lost update。前端可區分「stale poll」vs「真實衝突」，對使用者顯示「此單已被他人更新，請重新整理」。

### 3.（加分）PATCH 完成後 GET 的 read-your-writes 一致性

若目前有 read replica lag，PATCH 後短時間內 GET 仍回舊值 — 這是客戶穩定踩到 race 的可能原因之一。能否讓 status GET 在寫入後至少走 primary，或保證 N 秒內一致？

---

## 我們不需要（短期）

- WebSocket / SSE — 長期可評估，但非本週 blocker
- 整個 approval flow 重構

---

## 前端配合方式

| 後端交付 | 前端動作 |
|---------|---------|
| 僅 `updatedAt` on PATCH | 收斂 guard window，全面改用 timestamp merge |
| ETag + If-Match | `apiFetch` 加 ETag header 管理；412 顯示衝突 UI |
| 兩者都有 | 移除 guard workaround，保留 timestamp 作為第二道防線 |

請告訴我們你下週能交付哪一項，我們好排前端第二階段 PR。謝謝！
