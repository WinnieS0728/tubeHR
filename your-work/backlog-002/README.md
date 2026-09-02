# BACKLOG-002 交付物索引

| 檔案 | 內容 |
|------|------|
| [root-cause-analysis.md](./root-cause-analysis.md) | 重現步驟、時序圖、根因說明 |
| [frontend-mitigation-plan.md](./frontend-mitigation-plan.md) | 三層前端防護策略與 trade-off |
| [notes-to-tina.md](./notes-to-tina.md) | 給後端 Tina 的 API contract 需求（可直貼 Teams） |
| [timeline-plan.md](./timeline-plan.md) | 短期止血 → 下週整合 → Q3 長期方案 |

## 程式碼變更

- `codebase/src/components/ApprovalStatus.tsx` — Layer 1–3 mitigation 實作
- `codebase/src/hooks/useApprovalSync.ts` — 修 useEffect deps + timestamp merge
