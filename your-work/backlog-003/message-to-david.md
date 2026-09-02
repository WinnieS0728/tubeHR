# 給 Tech Lead David 的訊息

---

嗨 David，

Kevin PR #142 review 結論：**Request changes**（細節在 PR comment）。

**方向正確**，virtualization 該 merge 的方向沒問題。擋的是 PR 本身：缺 `react-window` 依賴、memo compare 和 observer 是 PR 新引入的問題。

BACKLOG-001 的 filter / 租戶等正確性議題 **已有排程，我沒在這張 PR 擋**。請 Kevin follow 001 後續處理。建議 merge 後跟 Stacy 講清楚：這 PR 是列表 perf，001 正確性部分還在排程中。

其他 note：
- bundle size 已超標，加 `react-window` 前 worth conscious decision
- Kevin 等了一週，review 照實講，私訊有 support 一下
