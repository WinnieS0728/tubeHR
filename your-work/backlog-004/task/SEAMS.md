# BACKLOG-004 規劃 Seam

> 規劃題無 code TDD。此文件定義 **規劃交付的邊界**。

## 規劃 Seam（交付維度）

| Seam | 交付物 | 驗收方式 | 確認 |
|------|--------|----------|------|
| P1 | UI 結構 | PM 可理解、可開發 | ✅ |
| P2 | API contract | 後端可估工 | ✅ |
| P3 | 狀態機 | 覆蓋 draft→frozen 路徑 | ✅ |
| P4 | Edge cases | ≥ 8，有分類 | ✅ |
| P5 | 時程 | sprint 級估計 | ✅ |

## 未來實作時的 TDD Seam（預留）

若 BACKLOG-004 進入實作階段，建議 seam：

| 區塊 | Seam | 備註 |
|------|------|------|
| B1 下屬 | `SubordinateAssignPanel` | form submit → API |
| B2 表單 | `FormReassignPanel` | 同上 |
| B3 簽核 | `ApprovalDelegatePanel` | 沿用 002 merge |
| B4 系統 | `SystemAckPanel` | checkbox ack |
| 整體 | `OffboardingProgress` | 四區塊完成度 |

現階段不寫測試。
