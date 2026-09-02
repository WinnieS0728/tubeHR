# BACKLOG-003 PWD — PR #142 Review 規格

> **狀態**：SDD 規格 v1 | **優先級**：P2 | **類型**：Code Review（無 TDD code）

## 1. 問題陳述

Kevin 開 PR #142 嘗試 virtualization 解 BACKLOG-001 perf。Vivian 離職前未 review。需對 `codebase/PR-pending-form-card-perf.md` 做建設性 review。

## 2. Review 目標（非 bug hunt）

| 維度 | 期望 |
|------|------|
| 技術 | 區分 must-fix / should-fix / teaching / out-of-scope |
| 溝通 | Kevin 資淺、用 AI、前輩離職壓力 — 語氣建設性 |
| 範圍 | PR 解 perf；BACKLOG-001 正確性（filter、租戶）不在此 PR 擋 merge |

## 3. Review Rubric

### Must-fix（不改不能 merge）
- Build blocker（語法、import、型別錯誤）
- PR 新引入的 runtime bug
- 無需求 dead code（如 AI 塞的 visibility tracking）

### Should-fix（建議改，可 follow-up）
- Perf 相關但非 blocker 的優化
- 測試覆蓋建議

### Teaching（可改可不改，教學機會）
- stale closure、cleanup pattern
- virtualization 最佳實踐

### Out-of-scope（標註 follow BACKLOG-001，不擋 merge）
- filter 覆寫 `formListAtom`
- 租戶切換 refetch
- BACKLOG-002 approval race

## 4. 期望產出

- PR review comment 草稿（thread 形式）
- Review 決策：approve / request changes / comment
- 私訊 Kevin（公開不適合講的）
- 給 Tech Lead David 的訊息

## 5. 相關程式碼

- `codebase/PR-pending-form-card-perf.md`
- `codebase/src/components/FormCard.tsx`（原始）
- `codebase/src/components/FormList.tsx`

## 6. 參考

- 原始工單：`backlog/BACKLOG-003-pr-review.md`
- 既有 review：`../pr-review-comments.md`
- 決策：`../review-decision.md`
