# BACKLOG-002：簽核狀態偶發跳回（race condition 疑似）

**優先級**：🟡 P1
**指派**：未指派
**狀態**：客服轉了 3 次，前端 reload 後好，沒復現過
**回報來源**：客服 ticket #4744（HR 主管帳號）

---

## 描述

某客戶 HR 主管 3 次回報：

> 「我明明按了『同意』，畫面也說已同意，但**過幾秒又變回待簽**。
> 我又按一次同意，這次就好了。是不是系統壞了？」

客服 reload 重現不出來，前端團隊也沒復現出來 — 但同個客戶一週內回報 3 次同樣症狀，**不像偶發**。

Vivian 在離職前的便利貼上有寫：「ApprovalStatus 偶爾顯示錯狀態 — Reload 就好，所以一直擺著」。

---

## 已知的後端狀況

> 這段是 Tech Lead David 在 Teams 上提的（見 team-chat），轉貼如下：

- 後端的 `PATCH /api/approvals/{id}/status` API **沒有提供 ETag / If-Match**
- 後端沒有 WebSocket / SSE，要拿最新狀態只能 poll
- 後端團隊現在在改其他事，**這個 API 至少 3 週內不會動**

> **（補充 · 見 team-chat 2026-05-27 Tina 的訊息）**
> 後端 Tina 後來鬆口：**下週其實能擠出 1-2 天**，如果前端需要，可以先幫這支 API 加 `ETag` / `If-Match`，或至少 response 回 `updatedAt`。但她要前端**明確說要不要、要哪個**才好排，不講就照原計畫 Q3。

---

## 需要的產出

- [ ] **重現 / 根因分析**：為什麼客戶能看到、客服復現不出來？哪個流程組合才會觸發？
- [ ] **前端能怎麼 mitigate**？（先假設後端完全不動的前提下）
- [ ] **若後端能配合，你會請他們做什麼**？（寫 1-2 句話的需求回給 Tina — 你要 ETag、`updatedAt`、還是別的？為什麼？）
- [ ] **後端鬆口可提早給時**，你的短期 mitigate 與長期方案的**時序計畫**會怎麼調整？（短期先扛什麼、後端 contract 來了之後哪段退場？）
- [ ] **怎麼讓客戶這 3 週不再遇到這問題**？

---

## 相關程式碼

- `codebase/src/components/ApprovalStatus.tsx`
- `codebase/src/hooks/useApprovalSync.ts`
- `codebase/src/lib/api/client.ts`

---

## 思考點

這題的隱藏維度是 **「不是我的問題、但會打到客戶」的當責態度**：

- 「後端 API 沒給 ETag，這不是前端能解的」 — 這個答案技術上對，但不能止血
- 成熟的前端工程師應該想：**前端有沒有辦法讓客戶體感不到這個問題**？
- 答案不是唯一的，看你怎麼權衡 trade-off
