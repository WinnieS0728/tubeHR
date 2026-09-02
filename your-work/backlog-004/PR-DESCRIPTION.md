# PR Description（供 PR #4 使用）

> 若 GitHub PR body 需手動更新，請複製下方內容至 PR description。

---

## 背景

對應 [BACKLOG-004](../../backlog/BACKLOG-004-offboarding-checklist.md)（⭐ 加分規劃題）。PM Stacy 規劃 2027 Q1 推出「員工離職交接清單」功能，本 PR **僅交付前端可行性評估文件，不包含任何程式碼變更**。

員工提離職後，主管須在系統內完成四件事：指派下屬新主管、重新指派表單模板負責人、跨權簽核代理、HR 確認 IT 權限回收。全部完成且在最後在職日 D 日 17:00 前結束，才算交接完成；否則進入「強制凍結」。

---

## 交付物

規劃文件位於 `your-work/backlog-004/`：

| 文件 | 內容 |
|------|------|
| [README.md](./README.md) | 執行摘要、核心決策、時程粗估 |
| [planning.md](./planning.md) | UI 結構、API 契約、狀態機 |
| [edge-cases-and-risks.md](./edge-cases-and-risks.md) | Edge cases、分階段建議、風險、待釐清項目 |

---

## 可行性結論

**前端可做，但高度依賴後端聚合 API 與 server-side deadline。** 離職交接跨組織架構、表單模板、簽核、IT 權限四個域，不應在前端拼湊多支零散 API。

### 五項核心決策

1. **單頁 dashboard** — 一頁呈現四交接區塊、截止倒數與全局狀態
2. **後端聚合 `OffboardingChecklist`** — 前端以 checklist 為 single source of truth
3. **狀態四態** — `in_progress` / `blocked` / `complete` / `frozen`；凍結由後端 cron 觸發，前端只反映
4. **MVP 範圍** — 區塊 1–3 可操作；區塊 4（IT 權限）MVP 唯讀 + HR 手動確認
5. **實作優先順序** — 先處理 BACKLOG-001（FormList perf）、BACKLOG-002（approval race），再排本 feature

---

## Backlog 產出對照

| 要求項目 | 對應文件 |
|----------|----------|
| UI 結構描述 | `planning.md` §1 |
| API 契約草案 | `planning.md` §2 |
| 狀態流 / state machine | `planning.md` §3 |
| Edge case 清單（12 項，含 MVP 必須 5 項） | `edge-cases-and-risks.md` §1 |
| 開發階段建議（MVP / P1 / V2） | `edge-cases-and-risks.md` §2 |
| 風險 / 待釐清項目 | `edge-cases-and-risks.md` §3–§5 |

---

## 時程粗估

| 階段 | Sprint | 交付 |
|------|--------|------|
| MVP | 2 | 四區塊 UI；1–3 可操作；4 唯讀確認；17:00 凍結演示 |
| P1 | +1 | 通知、IT 整合、連鎖離職、D+1 簽核規則 |
| V2 | +1–2 | 撤回離職、批量離職、報表 |

前提：後端聚合 API v1 就緒，且 BACKLOG-002 簽核 ETag 方案已對齊。

---

## Commits

| Commit | 說明 |
|--------|------|
| `ebca0d7` | 初版規劃（8 份文件） |
| `eaa3e5f` | 精簡為 3 份文件，保留核心決策 |

---

## Review 重點

- [ ] 五項核心決策是否與 PM / 後端方向一致
- [ ] API 聚合設計是否足夠讓 Tina 排 Sprint 0 mock
- [ ] MVP edge cases（EC-01 ~ EC-05）是否涵蓋 PM brief 中的關鍵情境
- [ ] 待 PM 釐清項目（Q1–Q6）是否需要優先開會對齊

---

## 範圍外

- 無 `codebase/` 程式變更
- 無 CustomerWeb 員工視角
- 無 IT ticket 自動化（留 P1）
