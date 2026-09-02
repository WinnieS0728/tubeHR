# Edge Cases、風險、分階段

## 1. Edge Cases（12 項）

### MVP 必須處理（5 項）

| ID | 情境 | 處理 |
|----|------|------|
| EC-01 | 離職者負責「離職交接清單」模板本身 | 後端標 `isOffboardingTemplate`；前端強制轉 HR Admin 群組，禁用一般 Select |
| EC-02 | D 日 17:00 與 client 時鐘不一致 | 倒數用 `serverNow` + `deadlineAt`；凍結只信後端 poll |
| EC-03 | 主管離職，下屬無合法新主管 | 區塊 `blocked` +「請 HR 更新組織架構」，不可 silent fail |
| EC-04 | 四區塊皆空 | 各區塊 `not_applicable`；區塊四仍要 HR 確認；須 explicit POST complete |
| EC-05 | 簽核跨權 race（BACKLOG-002） | delegate PATCH 帶 If-Match；成功後 poll；與 002 同一套 mitigation |

### P1/V2 可延後（4 項）

| ID | 情境 | 延後至 |
|----|------|--------|
| EC-06 | 被指派的代理人也離職 | P1：webhook reopen + 通知 |
| EC-07 | 員工撤回離職 | P1：`status: cancelled` + audit |
| EC-08 | 簽核 D+1 才回到離職者節點 | P1：`expectedReturnAt` + 凍結規則調整 |
| EC-09 | 同一員工重複建立清單 | P1：409 redirect 既有清單 |

### 後端主責（3 項）

| ID | 情境 | 分工 |
|----|------|------|
| EC-10 | 17:00 凍結 authoritative 執行 | 後端 cron + transaction；前端僅反映 |
| EC-11 | 跨 tenant 資料隔離 | 後端 tenant scope；前端切 tenant 清 cache |
| EC-12 | 組織架構環狀匯報 | 後端 cycle detection；前端顯示 error |

---

## 2. 分階段建議

### 優先順序

| 票 | 建議 |
|----|------|
| BACKLOG-001 FormList perf | **先做** — 現網 P0 |
| BACKLOG-002 approval race | **先做** — 區塊三直接受益 |
| BACKLOG-003 PR review | onboarding 順便 |
| BACKLOG-004 | Q1 2027；不搶 001/002 資源 |

### MVP（2 sprint）

- 路由、總覽、詳情四區塊 UI
- 區塊 1–3 可操作；區塊 4 唯讀 + HR 確認
- 四態 UI + complete / unfreeze
- EC-01 ~ EC-05
- **不含**：IT ticket、通知、SSE（用 30s poll）、PDF 匯出

### P1（+1 sprint）

- 通知（T-3/T-1 email、frozen alert）
- EC-06/08/09、IT 整合 v1、CustomerWeb 聯動

### V2（+1–2 sprint）

- EC-07 撤回離職、批量離職、報表、行動版

---

## 3. 風險（精選）

| 風險 | 緩解 |
|------|------|
| 後端聚合 API 延遲 | Sprint 0 先對 contract；mock server 並行 |
| 簽核 race（002）污染區塊三 | ETag + poll；向 Tina 提交 contract |
| 30 天系統清單資料來源不存在 | MVP 降級 HR 手動清單 |
| 凍結規則與 D+1 簽核未定 | MVP 保守計未完成；需 PM sign-off |
| Bundle 已超標（340KB） | 新路由 lazy load |
| multi-tenant cache 污染 | tenant switch 清 state |

---

## 4. 待釐清

### PM（Stacy）

| # | 問題 | 建議預設 |
|---|------|----------|
| Q1 | 四區塊全完成才算 complete？空清單 HR 確認一次算不算？ | 是 |
| Q2 | D 日 17:00 用 tenant 時區還是 UTC？ | tenant TZ |
| Q3 | 解凍後 deadline 是否自動延？ | 解凍時強制選新 deadline |
| Q4 | 已 delegate 但 expectedReturnAt > deadline 算不算完成？ | MVP：不算 |
| Q5 | 離職者是唯一 HR Admin，誰能 unfreeze？ | break-glass superadmin？ |
| Q6 | 30 天系統清單資料來源？ | MVP 接受 stub + HR 編輯 |

### 後端（Tina）

| # | 項目 |
|---|------|
| B1 | 聚合 API v1 mock 何時可用？ |
| B2 | delegate PATCH 是否共用 ETag？ |
| B3 | 凍結 cron 精度與 grace period？ |
| B4 | `isOffboardingTemplate` 由誰標記？ |
| B5 | direct reports 資料來源 — HRIS 還是 org API？ |

---

## 5. 假設（PM 未回覆時按此推進）

1. Deadline = D 日 17:00 **tenant 時區**
2. 四區塊全 complete 才能 POST `/complete`
3. Frozen 後僅 HR 可 unfreeze
4. 區塊四 MVP 唯讀 + HR confirm
5. 離職模板自動轉 HR Admin 群組
6. 只在 FormAdmin，不做 CustomerWeb 員工視角
