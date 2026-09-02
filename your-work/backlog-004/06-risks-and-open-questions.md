# 風險與待釐清項目

## 1. 風險矩陣

| # | 風險 | 影響 | 可能性 | 緩解 |
|---|------|------|--------|------|
| R1 | 後端聚合 API 延遲，前端只能 mock | 高 | 中 | Sprint 0 先對 contract（本文件 02）；mock server parallel |
| R2 | 簽核 race（BACKLOG-002）污染區塊三 | 高 | 高 | MVP 必須 ETag / poll；向 Tina 提交明確 contract |
| R3 | 「30 天系統清單」資料來源不存在或不準 | 中 | 高 | MVP 降級為 HR 手動清單 + CSV import；不 block 1–3 |
| R4 | 凍結規則與 D+1 簽核語意未定 | 高 | 中 | EC-08 寫入 PM sign-off checklist；MVP 保守計入未完成 |
| R5 | FormAdmin bundle 已超標（340KB） | 中 | 高 | 新路由 lazy load；不 import 整包 FormEditor 到 offboarding |
| R6 | multi-tenant cache 污染（#4801） | 高 | 中 | tenant switch 清 state；E2E 覆蓋 |
| R7 | Vivian 離職後無 domain owner | 中 | 高 | 本規劃作 onboarding 產出；David review |
| R8 | CustomerWeb 離職單與 FormAdmin 不同步 | 中 | 中 | `sourceRef` 欄位；P1 再做自動建立 |
| R9 | HR 期望「一鍵完成」vs 實際四步操作 | 低 | 中 | Stepper + batch actions 降低摩擦 |
| R10 | 組織架構 API 品質差（cycle、缺主管） | 高 | 中 | EC-03 blocked UX + HR escalation path |

---

## 2. 待 PM 釐清（Questions for Stacy）

### 2.1 業務規則

| # | 問題 | 影響範圍 | 建議預設 |
|---|------|----------|----------|
| Q1 | 四區塊是否必須**全部**完成才能算 complete？區塊四空清單時 HR 確認一次算不算？ | 完成條件 | 是，空清單也需 HR「已人工核查」checkbox |
| Q2 | D 日 17:00 是 **tenant 本地時區** 還是 UTC？ | deadline cron | tenant TZ（台北企業 → UTC+8） |
| Q3 | 凍結後 HR 解凍，deadline 是否自動延到 D+1 17:00？ | unfreeze flow | 需 PM 定；建議解凍時強制選新 deadline |
| Q4 | 已 delegate 但 `expectedReturnAt > deadline` 的簽核，算不算「已完成交接」？ | EC-08 | MVP 保守：不算；P1 可放寬 |
| Q5 | 離職者是 **唯一 HR Admin** 時，誰能 unfreeze / complete？ | 權限 | 後端 break-glass superadmin？ |
| Q6 | 「最近 30 天系統」的資料來源是 SSO log、VPN、還是 HR 手動維護？ | 區塊四 | MVP 接受後端 stub + HR 編輯 |

### 2.2 使用者與權限

| # | 問題 | 影響範圍 |
|---|------|----------|
| Q7 | 只有 **直屬主管** 能操作，還是 **HR Admin 可代操作**？ | capabilities |
| Q8 | 離職者本人能否在 CustomerWeb 看到自己交接進度？ | 範圍外？V2？ |
| Q9 | 多主管（matrix management）下屬怎麼算？ | 區塊一資料模型 |

### 2.3 整合

| # | 問題 | 影響範圍 |
|---|------|----------|
| Q10 | IT 通知是 email 範本、ServiceNow、還是 Jira SM？ | P1 scope |
| Q11 | 是否需與現有 CustomerWeb「離職申請單」雙向連動？ | 自動建清單 |
| Q12 | 完成交接後是否自動 trigger 帳號 deactivate？ | 後端 / IT |

---

## 3. 待後端釐清（Notes for Tina）

| # | 項目 | 前端期望 |
|---|------|----------|
| B1 | 聚合 API 何時可提供 v1 mock？ | Sprint 1 Week 1 |
| B2 | `PATCH /approvals/{id}/delegate` vs 現有 status PATCH 是否共用 ETag？ | 共用 If-Match 機制 |
| B3 | 凍結 cron 精度（分鐘級？）與 grace period？ | 影響 EC-10 UX 文案 |
| B4 | `isOffboardingTemplate` 由誰標記？form metadata flag？ | 避免前端 hardcode form name |
| B5 | direct reports 資料來源 — HRIS 還是 TubeHR org API？ | 影響 EC-03 suggested managers |
| B6 | 409 idempotent create 是否同意做？ | EC-09 |

建議放置位置：`your-work/notes-to-backend.md`（若後續與 BACKLOG-002 合併一封給 Tina）。

---

## 4. 技術風險 — 前端具體作法

### 4.1 Bundle size（R5）

- offboarding 路由 `dynamic import` 四區塊 table
- 不 reuse FormEditor；只 reuse badge / chip 級 component

### 4.2 Approval sync（R2）

- 區塊三 delegate 後：`useApprovalSync` 同模式 — 禁用 double submit、poll 3 次確認
- 在 contract 明確要 `updatedAt` 或 ETag（呼應 team-chat 5/27 Tina 訊息）

### 4.3 Tenant isolation（R6）

```typescript
// tenant 切換時
offboardingAtom.reset();
abortController.abort('tenant-changed');
```

---

## 5. 假設清單（Assumptions）

若 PM 未及時回覆，前端按以下假設推進：

1. Deadline = 最後在職日 D 當天 17:00 **tenant 時區**。
2. 四區塊全 complete 才能 POST `/complete`。
3. Frozen 後僅 HR 可 unfreeze；主管只能看。
4. 區塊四 MVP 為唯讀 + HR confirm，不要求 IT API。
5. 離職模板自動轉 HR Admin 群組，不可指派一般員工。
6. 本 feature 只在 FormAdmin（HR Admin 視角），不做 CustomerWeb 員工視角。

---

## 6. 成功指標建議（供 PM OKR）

| 指標 | MVP 後 3 個月目標 |
|------|-------------------|
| D 日前完成率 | ≥ 80% |
| 凍結後需 unfreeze 比例 | ≤ 10% |
| 區塊三簽核代理相關客訴 | 0 件 P0 |
| HR 完成一次交接 median 時間 | ≤ 15 分鐘 |
