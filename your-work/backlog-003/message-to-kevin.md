# 私訊 Kevin（Teams DM 草稿）

> 公開 PR review 不好講的話放這裡。語氣：支持、具體、不空泛安慰。

---

嗨 Kevin，

PR #142 我看完囉，先在 GitHub 上留了 review（Request changes）。想先私訊你幾句，免得公開 thread 看起來像被打槍 😅

**先說結論：方向完全對，值得繼續推。** 6000 row 用 virtualization 是正解，你本機的數字也說明你抓到重點了。Vivian 來不及看完不是你的問題，等一週確實很煎熬，我理解。

我會 request changes 主要是三個硬原因：
1. `react-window` 還沒裝進 package.json — merge 了 CI 會掛
2. filter 那個「搜尋完清不掉」的 bug 還在（`setForms(filtered)` 那行），這個跟 perf 無關但客戶一直在抱怨
3. FormCard 的自訂 memo compare 會漏更新 — 這個我當初也寫錯過，很容易以為自己在優化其實在製造 ghost data

IntersectionObserver 那段我建議整段拿掉 — 老實說看起來像 AI 塞的「看起來很 perf」的 code，但現在只做 console.log，沒有實際功能。你 description 裡寫 cleanup deps 我特別看了，**disconnect 寫法是對的**，這點你可以放心，不是那邊有問題。

有幾點想跟你說但不是批评：
- PR 測試表寫了 debounce 但 code 沒有 — 你自己在 description 有坦白，這很好。之後 test plan 跟 code 對齊就好，reviewer 會更信任你。
- 「主要靠 Claude 寫的」這件事完全 OK，我們都用 AI。重要的是你能解釋每一段為什麼在那裡 — 你對 react-window 和 cleanup 的問題問得很好，這才是重點。
- Vivian 走了之後你還主動扛 perf，David 跟我都有看到。

如果你願意，這週可以約 30 分鐘 pair，我跟你一起走一遍 `itemData` + filter useMemo 的改法，應該半天內可以推到 approve。

有任何地方覺得我的 review 不合理，直接回我或 PR 上 push back — David 也說了歡迎你給我視角，我們可以討論。

加油，這個 PR 離 merge 不遠了 💪
