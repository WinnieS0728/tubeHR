# WORKLOG 相關筆記（BACKLOG-003）

> 可直接貼進 `your-work/WORKLOG.md` 各區塊的草稿。

---

## §0 開工前 5 分鐘判斷

讀完 README、team-chat、BACKLOG-003 後：

- **先做 PR review（003）** 而非直接改 code：David 明說新人第一週「看看、抓問題」，且 Kevin PR 是現成 onboarding 素材
- **003 是 P2 但有人等了一週**：溝通品質 > 找 bug 數量
- **不碰 `context/`**：題目明確禁止
- BACKLOG-001/002/004 先不動，但 review 時會標記 PR 沒解的相關問題

---

## §1 工作日誌（時段 1）

**做了什麼**：
- checkout `backlog/003-pr-review`
- 讀 PR diff（`codebase/PR-pending-form-card-perf.md`）、現行 `FormCard.tsx` / `FormList.tsx`
- 對照 BACKLOG-001、`atoms.ts` 註解、team-chat、ARCHITECTURE.md
- 產出 review comments、決策、私訊 Kevin、訊息 David

**為什麼這時候做這個**：
- 任務定義就是 review + 溝通練習，不是實作 merge

**用了什麼工具 / AI**：
- 靜態閱讀 codebase + PR markdown；未用 AI 生 review 內容

**遇到的卡點**：
- PR 檔名 backlog 寫 `.tsx` 實際是 `.md` — 不影響，diff 在 md 裡

---

## §2 取捨清單

| # | 取捨 | 選了什麼 | 為什麼 | 放棄的代價 |
|---|------|---------|-------|-----------|
| 1 | Request changes vs Approve with comments | Request changes | PR 有 build blocker + 自引入問題 | Kevin 多一輪修改 |
| 2 | 公開 review 講多少 | PR scope 照實講 + 001 項目標註 follow-up | 用戶指示：001 有排程，不在此 PR 擋 | filter 等留到 001 |
| 3 | 是否直接在 codebase 套 PR | 不套 | 任務 focus 是 review deliverables | 沒有 live demo |
| 4 | filter bug 算 must-fix 嗎 | 否 — follow BACKLOG-001 | 001 已有處理時程 | 此 PR 只解 perf |
| 5 | 是否順手做 BACKLOG-002 | 不做，只 note 給 David | 超出 003 scope | approval bug 繼續 pending |

---

## §3 AI 使用紀錄

### 我用 AI 用在哪
- 本任務未使用 AI 生成 review

### AI 有沒有幫倒忙？（Kevin PR 裡的觀察）
- **IntersectionObserver + console.log**：典型 AI slop — 看起來像 perf best practice，無產品需求、無實際效益
- **自訂 memo compare**：AI 常建議「更 aggressive memo」，但容易漏欄位
- **重複 Tailwind class**：可能是 AI merge 產物

### 反向驗證
- 查 `package.json` 確認 `react-window` 不存在 → build 必掛
- 讀 `atoms.ts` L7 註解確認 filter 覆寫是已知反模式
- 比對 main `FormCard` description truncation vs PR 移除 → UX regression

---

## §4 問題清單（必填）

| # | 問題 | 優先級 | 我做了嗎 | 驗證過是真問題嗎？ | 不做的理由 |
|---|------|-------|---------|-------------------|-----------|
| 1 | `react-window` 未安裝 | P0 | Review 指出 | ✅ 讀 package.json | — |
| 2 | filter 覆寫 formListAtom | P0 | 標註 follow 001，不擋 PR | ✅ 讀 code + atom 註解 + BACKLOG-001 症狀 | 001 已有排程 |
| 3 | 自訂 memo compare 漏欄位 | P1 | Review 要求移除/修 | ✅ 邏輯分析 | — |
| 4 | IntersectionObserver 無功能 | P2 | Review 建議移除 | ✅ 讀 PR diff | — |
| 5 | tenant 切換資料殘留 | P1 | Note 給 David | ✅ team-chat #4801 + tenantId 未使用 | 超出 PR scope |
| 6 | approval race condition | P1 | Note 給 David | ⚠️ 僅 team-chat，未讀 BACKLOG-002 code | 003 scope |
| 7 | bundle size 超標 | P2 | Note 給 David | ✅ ARCHITECTURE.md | 非 Kevin 引入 |
| 8 | debounce 測試表與 code 不符 | P2 | Review nice-to-have | ✅ PR description 自承 | — |

---

## §5 跨團隊協作

### 5.1 後端問題、前端 mitigate
- approval ETag：建議 David 決定是否讓新人寫 contract 給 Tina，不擅自承諾

### 5.2 給 Kevin 的 review 策略
- **分層**：must-fix 公開講清楚；情緒支持放私訊
- **語氣**：「我以前也踩過」取代「你寫錯了」
- **offer pair**：降低「被打槍」感，加速第二輪
- **肯定方向**：virtualization 選型、cleanup 寫法、description 誠實

### 5.3 留給其他角色的訊息
- David：`message-to-david.md`（系統性問題 + 團隊動態）
- Kevin 私訊：`message-to-kevin.md`
- Stacy/PM：未單獨寫信，但在 David 訊息建議 merge 後勿宣稱 BACKLOG-001 全結案

---

## §6 如果再給我 3 小時

1. **跟 Kevin pair 30min** 改 filter + itemData（最快 unblock PR）
2. **草擬 BACKLOG-001 拆票**（perf / filter correctness / tenant isolation）
3. **讀 BACKLOG-002** 評估要不要回 Tina API contract

---

## §7 自由欄位

- 題目設計很好地測「review 不只是找 bug」— Kevin 的心理狀態、Vivian 離職、AI 使用都是變因
- PR 檔是 markdown 而非真 branch diff，但資訊足夠做 review
- `atoms.ts` 的註解是強 signal，顯示 Vivian 早知道 filter 問題但來不及修
