# Microsoft Teams — `#tubehr-foundation-frontend` 頻道

> 過去兩週訊息節錄。時間以台北為準。
> 出現的人：
> - **Vivian Chen** — 前端工程師（上週五離職）
> - **David Chang** — Foundation Team Tech Lead
> - **Kevin Liu** — 前端工程師（到職 6 個月）
> - **Stacy Wu** — PM
> - **Arthur Lin** — 客服 / 客戶成功
> - **Tina Tsai** — 後端 Lead

---

### 2026-05-19（星期一）

**Stacy Wu** · 10:14
> 早安各位 — 上週客戶 reportlab 的顧問又寄信來抱怨 FormAdmin 列表頁慢，這是這個月第三次了。能幫我安一下嗎？

**Vivian Chen** · 10:17
> 收到，我這週看一下，最近表單暴量的客戶愈來愈多，是該認真處理了。

**Kevin Liu** · 10:22
> 我也想學一下這種 perf optimization，能跟你一起看嗎 @Vivian

**Vivian Chen** · 10:24
> 好啊，我先看，找到方向丟給你接 👍

---

### 2026-05-20（星期二）

**Arthur Lin** · 09:03
> 又有客戶 ticket #4744 — HR 主管說「按了同意又變回待簽」，我 reload 沒復現，先擱著。

**Vivian Chen** · 09:11
> 這個我兩個月前就有印象 🤔 之前也是復現不出來。先放著吧，FormList 比較急。

**David Chang** · 14:30
> 順便提一下，最近 build 時間從 30 秒變成 3 分鐘了，誰有空找一下 bisect？不急但是有點崩潰。
> （獎勵：找出來的人下次團聚我請喝飲料 ☕）

**Kevin Liu** · 14:32
> 哈哈我來試試看

---

### 2026-05-21（星期三）

**Vivian Chen** · 11:48
> @Kevin 我看了一下 FormList，這個比想像中複雜，可能多個問題疊一起。
> 先給你方向：virtualization 是必要的，但**還有別的問題**，virtualization 解了 perf 不代表正確性也解了。
> 你先把 virtualization 試出來，剩下我們一起 pair。

**Kevin Liu** · 11:51
> 收到！我這幾天試試 react-window。

---

### 2026-05-22（星期四）

**Stacy Wu** · 09:20
> 跟你們提一下 — 公司明年 Q1 要推「離職交接清單」這個 feature，HR 主管會很愛。我這週會寫 brief，下週四你們有空我們對齊一下？

**Vivian Chen** · 09:22
> 收到 👍

**Kevin Liu** · 16:48
> @Vivian PR #142 開了，你有空幫忙看 🙏 我 react-window 第一次用，怕有坑。
> 主要 perf 數字看起來不錯（從 8s → 1.5s），但邏輯部分還是請你過目。

**Vivian Chen** · 16:54
> 好我這幾天看。

---

### 2026-05-23（星期五）

**David Chang** · 10:00
> 各位早上好，沉重的消息：
> Vivian 因家庭因素需要立刻離職，今天是最後一天。
> 我們已經啟動招募，請大家先撐一下，有事問我或 Kevin。
> 謝謝 Vivian 這兩年的貢獻 🙏

**Vivian Chen** · 10:02
> 對不起大家，事出突然來不及好好交接 😢
> 我把目前手上的事情寫在 codebase/ARCHITECTURE.md 最後一段，**剩下的 backlog 都在 backlog/ 資料夾**。
> Kevin 你的 PR 我來不及看完，先 punt 給接手的人吧。對不起 🙇

**Kevin Liu** · 10:14
> 沒事 Vivian，照顧好家人重要，謝謝你之前帶我！

**Arthur Lin** · 15:21
> 那個簽核狀態跳回的客戶**又來了**，這次同一個禮拜內第 3 次。她說再來她要找她們公司 CTO 打電話。
> @David 這個要處理一下嗎？

**David Chang** · 15:28
> 收到，等新人到先看一下，後端那邊我也問問。

**Tina Tsai** · 15:34
> @David 那個 `PATCH /api/approvals/{id}/status` 我們最近沒空動，至少 3 週後才能排，ETag 那個 feature 也是 Q3 才會有。
> 抱歉，前端先想辦法擋一下吧 🙏

---

### 2026-05-26（星期一）

**Stacy Wu** · 09:00
> 早安，提醒一下「離職交接清單」brief 我已經寫好放在 backlog 了（BACKLOG-004）。
> 等新前端到再來討論，不急。

**David Chang** · 09:30
> 各位週一愉快。新前端今天到，請大家有空多 onboarding 一下。
> Kevin 你帶他環境 setup，我會丟 Vivian 留下的 backlog 給他先看。
> 跟新人講一下，第一週就是看看、抓抓問題、跟團隊 pair，不用急著生產。

**Kevin Liu** · 09:32
> 收到！我也想 review 一下我的 PR，但既然新人來了，我等他先看也好，可以順便對 codebase 多熟一點。

**David Chang** · 09:35
> 對，新人 review 你的 PR 是好 onboarding 機會 — Kevin 你後續如果有 push back 也歡迎，他需要你的視角。

---

### 2026-05-27（星期二，今天）

**David Chang** · 09:00
> @新前端 早安，歡迎加入 🎉
>
> 你今天看到的 backlog/ 是 Vivian 離職前留下的 — **不需要全部做完**，你**自己決定優先順序、做什麼、不做什麼**。
>
> 我們沒有正確答案，想看的是你怎麼思考。有問題隨時 ping 我或 Kevin。
>
> 設備 Setup Kevin 帶你，午餐我們一起吃。

**Arthur Lin** · 09:40
> 早，又一張客服單 #4801 想丟給前端看一下：A 公司的 HR admin 反映，她切到 A 公司之後，表單列表裡還夾著上一個她登入過的 B 公司的 demo 表單，reload 有時候會好、有時候還在。她問是不是「資料串到別家公司去了」，有點緊張。
> （我先回她說我們在查了。這張不確定算 P 幾，新人看看順便。）

**Tina Tsai** · 11:15
> @David 補充一下我昨天說的 approval API — 我重看了一下排程，**其實下週可以擠出 1-2 天**，如果你們前端真的需要，我可以先幫 `PATCH /approvals/{id}/status` 加個 `ETag` / `If-Match`（或至少 response 回 `updatedAt`）。但要你們**明確跟我說要不要、要哪個**，我才好排。不講的話我就先照原計畫 Q3 了。

**David Chang** · 11:20
> @新前端 ^ 這個你評估一下，如果對你解 BACKLOG-002 有幫助，把你要的具體 contract 寫清楚回 Tina。
