# 給 Tech Lead David 的訊息

> PR review 之外、需要 TL 層級知道的系統性問題。

---

嗨 David，

新人 onboarding 順便看了 Kevin 的 PR #142 和 BACKLOG-001 周邊，review 結論是 **request changes**（細節在 PR comment）。Kevin 方向對，預計修一輪就能進。

但有幾件事我覺得 **超出這個 PR scope、需要你拍板或排程**：

---

## 1. BACKLOG-001 是「perf + 正確性」兩條線，不是一張票能關

| 問題 | 現況 | Kevin PR 有沒有解 |
|------|------|-------------------|
| 6000 row render 慢 | 主因是無 virtualization | ✅ 有解 |
| filter 後清除搜尋資料消失 | `setForms(filtered)` 覆寫 atom | ❌ 未解（`atoms.ts` 註解已警告） |
| 切租戶看到別家資料 | `tenantIdAtom` 讀了沒用、jotai 全域 cache 未清 | ❌ 未解（Arthur #4801） |
| `useEffect` fetch deps `[]` | filter/tenant 變不 refetch | ❌ 既有行為 |

建議：**不要讓 Kevin 一個人扛「BACKLOG-001 結案」的期待**。PR #142 merge 後應明確跟 Stacy 說「列表效能改善已上線，filter/租戶切換另開票追」。

---

## 2. Bundle size 已超標，加 `react-window` 需要 conscious decision

ARCHITECTURE.md 寫 initial JS ~340KB（budget 250KB）。`react-window` 不大，但團隊似乎沒有在擋新依賴。要不要順便排一輪 bundle audit？（你 Teams 提過 build 從 30s → 3min，可能相關。）

---

## 3. Approval 狀態 race（BACKLOG-002 預告）

Tina 說下週可以擠 1-2 天加 ETag，但需要前端明確說要什麼 contract。這跟 FormList perf 無關，但客服 ticket 已經第三次了，客戶威脅要找 CTO。

我傾向：**先讓 Kevin PR 專注 perf，approval 另排**。但如果你希望新人第一週就碰跨團隊協作，我可以把要的 API contract 草稿寫給 Tina。

---

## 4. 團隊動態（非技術）

Kevin 等這個 PR 一週了，Vivian 離職後沒人 review，他 description 寫「主要靠 Claude」其實是在降低期待、也透露不安全感。我會在 review 裡保持建設性，也私訊他 offer pair。

**建議**：之後可以訂個「PR 超過 3 天沒人看就自動 ping TL」的輕量規則，避免 junior 卡住又不敢催。

---

有需要我可以把 BACKLOG-001 拆票建議寫成簡短 doc 給你/Stacy。先這樣，有問題 ping 我。
