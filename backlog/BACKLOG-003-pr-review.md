# BACKLOG-003：PR #142 Review — FormCard virtualization 嘗試

**優先級**：🟡 P2（不阻塞，但 Kevin 等了一週很焦慮）
**指派**：未指派（原本 Vivian，她離職後沒人接）
**狀態**：Open，等 review
**作者**：Kevin Liu（前端，到職 6 個月，剛被升職）

---

## 描述

Kevin 看 BACKLOG-001 的 perf 問題後，主動開了 PR #142 嘗試 virtualization。
他在 Teams 上說「主要靠 Claude 幫忙寫的，但我自己也理過邏輯」。

Vivian 沒來得及 review 就離職。Kevin 已經 ping 了 Tech Lead 兩次，希望盡快進。

---

## 你的任務

對 `codebase/PR-pending-form-card-perf.tsx` 做 code review。

**這不是一個簡單的 LGTM 或拒絕** — Kevin 比較資淺、用了 AI、且因為前輩離職正在試圖證明自己能扛。
請考慮：

- 哪些是必須改的問題（不改不能進）？
- 哪些是可改可不改（風格、preference）？
- 哪些是「我以前也這樣寫過」可以教學的點？
- 哪些其實是 **AI 幫倒忙**（Kevin 自己沒發現）？

---

## 需要的產出

- [ ] **PR review comment 草稿**（PR 留言形式，可以一個或多個 thread）
- [ ] **總結**：你會 approve、request changes、還是 comment？為什麼？
- [ ] **私訊 Kevin 的訊息**（如果有）— 公開 review 不適合講的話放這
- [ ] **給 Tech Lead 的訊息**（如果你發現 PR 之外的更大問題）

---

## 提示

> 我們在意的不是「你抓到幾個 bug」，是你**怎麼跟 Kevin 溝通**。
>
> 同樣的問題用「這裡寫錯了」跟「我看了一下，這個 cleanup 我之前也踩過 stale closure 的坑，
> 要不要我跟你解一次？」會差很多。
>
> 成熟工程師不是只會 review，是會 review **而且讓人想再給你 review**。

---

## 相關程式碼

- `codebase/PR-pending-form-card-perf.tsx`（PR 的內容）
- `codebase/src/components/FormCard.tsx`（原始版本，給你 diff 參考）
- `codebase/src/components/FormList.tsx`（PR 想解的 perf 問題在這裡）
