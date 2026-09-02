# 給 Tina（後端）的 API 需求

> 可直接貼到 Teams `#tubehr-foundation-frontend`，cc David。
>
> **決策**：本 ticket 採 `updatedAt` 方案；ETag / If-Match 延後 Q3，本訊息不請求。

---

@Tina 你好，BACKLOG-002 簽核狀態跳回我們前端已定位根因（poll 與 PATCH race），會用 **`updatedAt` timestamp merge** 在前端止血。

若你下週能擠 1–2 天，**請幫 `PATCH /api/approvals/{id}/status` 補一項 contract**：

## 需求：PATCH response 回傳 `updatedAt`

```json
// PATCH /api/approvals/{id}/status
// Response 200
{
  "status": "approved",
  "updatedAt": "2026-05-27T11:30:00.000Z"
}
```

**為什麼只要這個**：

- GET 已有 `{ status, updatedAt }`，但 PATCH 目前只回 `{ status }`
- 前端 mutation 後無法對齊「伺服器認定的最新版本」，只能靠 client 時間 + guard window  workaround
- PATCH 回 `updatedAt` 後，前端可用同一套 timestamp merge，guard window 可從 10s 縮到 3s

**為什麼本輪不要 ETag / If-Match**：

- 本 ticket 症狀是 stale poll 覆寫 UI，不是多人同時改同一張單
- `updatedAt` 已足夠止血，ETag 我們 Q3 再跟你對

---

## 前端配合方式

| 後端交付 | 前端動作 |
|---------|---------|
| PATCH 回 `updatedAt` | mutation 成功後用 server `updatedAt` 更新 ref；guard window 10s → 3s |
| 來不及 | 維持 Phase 0 方案（GET `updatedAt` + guard），已足夠止血 |

請告訴我們下週能否交付，我們好排前端第二階段 PR。謝謝！
