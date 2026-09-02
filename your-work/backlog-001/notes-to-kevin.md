# PR #142 Review 摘要（給 Kevin）

嗨 Kevin，我 onboarding 時看了你的 PR #142，方向是對的（virtualization 確實必要），有幾點想跟你 sync：

**BACKLOG-001 分三階段做**（因時間限制）：
- **Step 1**：先修 filter 覆寫（Bug A）— 你的 PR 還沒修這個
- **Step 2**：virtualization + memo（Bug B/C/D）— 這步會參考你的 PR 方向
- **Step 3**：租戶切換（Bug E）— 時間允許再做

**做得好的地方**
- 用 `react-window` 解決大量 DOM 的問題，本機數字也說明你驗證過
- `memo` 自訂 compare 的概念正確

**需要先修再 merge 的（對應各 step）**
1. **Step 1**：`handleFilterChange` 還是 `setForms(filtered)` — 客戶說「搜尋後東西不見了」的主因，virtualization 解不了
2. **Step 2**：`renderedAt={Date.now()}` 讓 memo 失效
3. **Step 3**：`useEffect([], [])` 沒處理租戶切換，Arthur 那張 #4801 會繼續發生
4. **Step 2 不要帶進 prod**：IntersectionObserver 的 `useEffect` deps 是 `[]`，`form.id` 會 stale；而且 `console.log` 不該進 prod

Step 2 開 PR 時我會 ping 你 diff，看有沒有想合併的部分。有疑問我們可以 pair 一下。
