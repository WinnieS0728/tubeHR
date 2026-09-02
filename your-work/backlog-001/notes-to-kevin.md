# PR #142 Review 摘要（給 Kevin）

嗨 Kevin，我 onboarding 時看了你的 PR #142，方向是對的（virtualization 確實必要），有幾點想跟你 sync：

**做得好的地方**
- 用 `react-window` 解決大量 DOM 的問題，本機數字也說明你驗證過
- `memo` 自訂 compare 的概念正確

**需要先修再 merge 的**
1. `handleFilterChange` 還是 `setForms(filtered)` — 這是客戶說「搜尋後東西不見了」的主因，virtualization 解不了
2. `renderedAt={Date.now()}` 讓 memo 失效
3. `useEffect([], [])` 沒處理租戶切換，Arthur 那張 #4801 會繼續發生
4. IntersectionObserver 的 `useEffect` deps 是 `[]`，`form.id` 會 stale；而且 `console.log` 不該進 prod

我在 `backlog/001-form-list-performance` 分支上先做了 correctness + virtualization 的最小修正，你可以 diff 看看有沒有想合併的部分。有疑問我們可以 pair 一下。
