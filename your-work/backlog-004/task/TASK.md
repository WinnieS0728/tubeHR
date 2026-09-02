# BACKLOG-004 Task 分解

> **工作流**：SDD 規格 → 規劃交付（無 TDD code）

## Phase 0 — SDD（規格）

| # | 任務 | 產出 | 狀態 |
|---|------|------|------|
| 0.1 | 讀 PM brief + team-chat | 需求理解 | ⬜ |
| 0.2 | UI 結構草案 | `../planning.md` § UI | ✅ |
| 0.3 | PWD 規格 | `../pwd/SPEC.md` | ✅ |
| 0.4 | 狀態機定義 | `../planning.md` § State | ✅ |

## Phase 1 — API Contract

| # | 任務 | 產出 | 狀態 |
|---|------|------|------|
| 1.1 | 列出 endpoint | `../planning.md` § API | ✅ |
| 1.2 | TypeScript interface 草案 | `../planning.md` | ✅ |
| 1.3 | B3 delegate 對齊 002 | If-Match / updatedAt 註記 | ✅ |

## Phase 2 — Edge Case & 風險

| # | 任務 | 產出 | 狀態 |
|---|------|------|------|
| 2.1 | 列出 ≥ 8 edge cases | `../edge-cases-and-risks.md` | ✅ |
| 2.2 | 分類必處理 / 可忽略 / 後端 | 同上 | ✅ |
| 2.3 | 跨工單依賴表 | 同上 § Dependencies | ✅ |

## Phase 3 — 時程與 MVP

| # | 任務 | 產出 | 狀態 |
|---|------|------|------|
| 3.1 | MVP / P1 / V2 切分 | `../planning.md` § Phases | ✅ |
| 3.2 | Sprint 估計 | `../planning.md` | ✅ |
| 3.3 | 給 PM Stacy 的可行性結論 | `../README.md` | ✅ |

## Phase 4 — 實作準備（未來，非本 ticket）

| # | 任務 | 前置 | 狀態 |
|---|------|------|------|
| 4.1 | BACKLOG-001/002 完成 | P0/P1 | ⬜ |
| 4.2 | 後端 API contract 確認 | Tina / 後端 | ⬜ |
| 4.3 | 開實作 branch | contract 凍結後 | ⬜ |

## 注意

本工單**不需要 TDD**。未來實作時，各區塊可拆成獨立 backlog 並走 SDD+TDD 流程。

## 下一步

- 時間允許：補充 wireframe 文字描述或 PM 問答（`../QUESTIONS.md`）
- 001/002 完成後再排實作
