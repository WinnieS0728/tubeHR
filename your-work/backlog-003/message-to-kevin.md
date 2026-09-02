# 私訊 Kevin（Teams DM 草稿）

---

嗨 Kevin，

PR #142 我看完了，GitHub 上留了 review（Request changes）。

**方向是對的**，virtualization 該做，本機數字也說明你抓到重點了。Request changes 不是打槍，是 PR 本身有幾個要修的：

1. `react-window` 沒裝 — merge 了 CI 會掛
2. 自訂 memo compare 會漏更新 — 這 PR 新加的，改回預設 memo 就好
3. IntersectionObserver 那段建議整段拿掉 — 只做 console.log，deps 還有 stale closure，看起來像 AI 塞的，沒有實際功能

filter「搜尋完清不掉」和租戶切換那些，**BACKLOG-001 已有排程，不在這張 PR 擋你**。請你後續 follow 001 做，我在公開 review 也有標清楚，免得 merge 後大家以為 001 全結了。

你 description 寫 cleanup deps 我特別看了，`disconnect()` 是對的，問題不在 cleanup 而在這段 observer 本身不需要。

測試表寫 debounce 但 code 沒有 — 你自己有坦白，之後 test plan 跟 code 對齊就好。

修 PR scope 那幾項應該很快，有需要可以約 30 分鐘 pair 走一遍。
