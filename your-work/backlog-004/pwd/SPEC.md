# BACKLOG-004 PWD — 員工離職交接清單

> **狀態**：SDD 規格 v1 | **優先級**：⭐ 加分 | **類型**：規劃（無 TDD code）

## 1. 產品需求摘要

員工提離職後，主管需在系統內完成四件事才算交接完成：

| # | 區塊 | 動作 |
|---|------|------|
| B1 | 下屬管理 | 指派新主管 |
| B2 | 進行中表單模板 | 重新指派負責人 |
| B3 | 待簽核單 | 跨權給代理人（PATCH + poll，沿用 BACKLOG-002） |
| B4 | 內部系統清單 | HR 通知 IT 收回權限（最近 30 天使用） |

**截止**：最後在職日 D 日 17:00 前完成，否則「強制凍結」。

## 2. UI 結構（草案）

```
/offboarding/{employeeId}
├── Header：員工資訊 + 倒數 + 整體進度
├── Block 1：下屬清單 → 選新主管
├── Block 2：表單模板 → 選新負責人
├── Block 3：待簽核 → 指定代理人
├── Block 4：系統權限 → 勾選已通知 IT
└── Footer：完成交接 CTA（四區塊全完成才 enable）
```

詳細：`../planning.md`

## 3. 狀態機

```
draft → in_progress → blocked → completed
                    ↘ frozen (D日17:00未完成的強制狀態)
```

- `blocked`：缺 API 資料或依賴未滿足
- `frozen`：唯讀，僅 HR admin 可解凍

## 4. API Contract 概要

| Endpoint | 用途 |
|----------|------|
| `GET /api/offboarding/{employeeId}` | 交接總覽 + 四區塊狀態 |
| `PATCH /api/offboarding/{employeeId}/subordinates` | 指派新主管 |
| `PATCH /api/offboarding/{employeeId}/forms` | 重新指派模板負責人 |
| `PATCH /api/offboarding/{employeeId}/approvals/delegate` | 簽核代理人 |
| `POST /api/offboarding/{employeeId}/systems/acknowledge` | IT 權限收回確認 |

詳細 schema：`../planning.md`

## 5. Edge Case 要求

至少 8 個，分類必處理 / 可忽略 / 後端責任。詳見 `../edge-cases-and-risks.md`。

## 6. 非目標（MVP 外）

- IT ticket 自動開立
- SSE 即時更新（用 30s poll）
- PDF 匯出

## 7. 依賴

- **BACKLOG-001/002 先做** — 001 現網 P0；002 的 `updatedAt` merge 供 B3 沿用
- Q1 2027 時程，不搶 001/002 資源

## 8. 參考

- 原始工單：`backlog/BACKLOG-004-offboarding-checklist.md`
- 規劃詳細：`../planning.md`
- Edge cases：`../edge-cases-and-risks.md`
