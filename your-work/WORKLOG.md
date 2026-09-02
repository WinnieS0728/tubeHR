# WORKLOG

> 完成 BACKLOG-003：PR #142 code review 產出。詳細草稿見 `your-work/backlog-003/`。

---

## 0. 開工前 5 分鐘的判斷

讀完 README、team-chat、BACKLOG-003 後：

- **先做 PR review（003）** 而非直接改 code：David 明說新人第一週「看看、抓問題」，且 Kevin PR 是現成 onboarding 素材
- **003 是 P2 但有人等了一週**：review 照實講 PR 問題，溝通清楚比堆 bug 數重要
- **不碰 `context/`**：題目明確禁止
- BACKLOG-001 正確性議題（filter、租戶）已有排程，不在 PR #142 擋 merge，請 Kevin follow 001

---

## 1. 工作日誌

### 時段 1

**做了什麼**：
- checkout `backlog/003-pr-review`
- 讀 PR diff（`codebase/PR-pending-form-card-perf.md`）、現行 `FormCard.tsx` / `FormList.tsx`
- 對照 BACKLOG-001、`atoms.ts` 註解、team-chat、ARCHITECTURE.md
- 產出 review comments、決策、私訊 Kevin、訊息 David
- 依 TL 指示調整：PR scope 照實講必改項，001 正確性 follow 001 時程

**為什麼這時候做這個**：
- 任務定義就是 review + 溝通，不是實作 merge

**用了什麼工具 / AI**：
- 靜態閱讀 codebase + PR markdown

**遇到的卡點**：
- PR 檔名 backlog 寫 `.tsx` 實際是 `.md` — 不影響，diff 在 md 裡

---

## 2. 取捨清單

| # | 取捨 | 選了什麼 | 為什麼 | 放棄的代價 |
|---|------|---------|-------|-----------|
| 1 | Request changes vs Approve | Request changes | PR 有 build blocker + 自引入問題 | Kevin 多一輪修改 |
| 2 | filter bug 在此 PR 擋嗎 | 否 — follow BACKLOG-001 | 001 已有處理時程 | 此 PR 只解 perf |
| 3 | 公開 review 語氣 | 照實講，不過度軟化 | TL 指示 | 評論較直接 |
| 4 | 是否直接在 codebase 套 PR | 不套 | 任務 focus 是 review deliverables | 沒有 live demo |
| 5 | 是否順手做 BACKLOG-002 | 不做，只 note 給 David | 超出 003 scope | approval bug 繼續 pending |

---

## 3. AI 使用紀錄

### 我用 AI 用在哪
- 本任務未使用 AI 生成 review 內容

### AI 有沒有幫倒忙？（Kevin PR 裡的觀察）
- **IntersectionObserver + console.log**：典型 AI slop — 看起來像 perf pattern，無產品需求
- **自訂 memo compare**：容易漏欄位，製造 ghost data
- **重複 Tailwind class**：可能是 AI merge 產物

### 反向驗證
- 查 `package.json` 確認 `react-window` 不存在 → build 必掛
- 讀 `atoms.ts` L7 註解確認 filter 覆寫是已知反模式
- 比對 main `FormCard` description truncation vs PR 移除 → UX regression

---

## 4. 問題清單

| # | 問題 | 優先級 | 我做了嗎 | 驗證過是真問題嗎？ | 不做的理由 |
|---|------|-------|---------|-------------------|-----------|
| 1 | `react-window` 未安裝 | P0 | Review 指出（PR 必改） | ✅ 讀 package.json | — |
| 2 | filter 覆寫 formListAtom | P0 | 標註 follow 001 | ✅ 讀 code + atom 註解 | 001 已有排程 |
| 3 | 自訂 memo compare 漏欄位 | P1 | Review 要求移除 | ✅ 邏輯分析 | — |
| 4 | IntersectionObserver 無功能 | P2 | Review 要求移除 | ✅ 讀 PR diff | — |
| 5 | tenant 切換資料殘留 | P1 | Note 給 David | ✅ team-chat #4801 | 001 範圍 |
| 6 | approval race condition | P1 | Note 給 David | ⚠️ 僅 team-chat | 003 scope |
| 7 | bundle size 超標 | P2 | Note 給 David | ✅ ARCHITECTURE.md | 非 Kevin 引入 |
| 8 | debounce 測試表與 code 不符 | P2 | 標註 001 follow-up | ✅ PR description 自承 | 001 範圍 |

---

## 5. 跨團隊協作的決策

### 5.1 後端問題、前端 mitigate
- approval ETag：建議 David 決定是否讓新人寫 contract 給 Tina，不擅自承諾

### 5.2 給 Kevin 的 review 策略
- **PR scope**：照實講必改項（依賴、memo、observer）
- **001 範圍**：點名問題存在，但不擋此 PR merge，請 follow 001
- **私訊**：support 方向正確，說明 Request changes 不是打槍

### 5.3 留給其他角色的訊息
- David：`your-work/backlog-003/message-to-david.md`
- Kevin：`your-work/backlog-003/message-to-kevin.md`
- Review 草稿：`your-work/backlog-003/pr-review-comments.md`
- 決策：`your-work/backlog-003/review-decision.md`

---

## 6. 如果再給我 3 小時

1. 跟 Kevin pair 30min 修 PR scope 必改項
2. 開始 BACKLOG-001 filter / tenant 修復
3. 讀 BACKLOG-002 評估要不要回 Tina API contract

---

## 7. 自由欄位

- Review 策略：方向認可 + PR 照實講 + 001 正確性 follow 排程，避免一張 PR 扛全部 BACKLOG-001
- `atoms.ts` 註解是強 signal，顯示 Vivian 早知道 filter 問題但來不及修
