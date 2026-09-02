# 開發階段建議：MVP / P1 / V2

## 時程總覽

假設 1 sprint = 2 週，Foundation Team 1 前端 + 後端 1–2 人可部分並行。

| 階段 | Sprint | 前端人力 | 後端依賴 | 可交付給 PM 演示 |
|------|--------|----------|----------|------------------|
| **MVP** | Sprint 1–2 | ~1.5 FTE | 聚合 API v1 + cron 凍結 | 完整四區塊 UI，1–3 可操作，4 唯讀確認 |
| **P1** | Sprint 3 | ~1 FTE | IT 整合 + 事件訂閱 | 通知、連鎖離職、D+1 簽核規則 |
| **V2** | Sprint 4–5 | ~0.5–1 FTE | 報表 + HRIS 深度整合 | 儀表板、audit、批量離職 |

**粗估總計：3–5 sprint**（與 backlog 要求的「大概幾個 sprint」一致）。

---

## MVP（Sprint 1–2）— 最小可演示閉環

### 目標

HR / 主管能在 FormAdmin **看見並完成** PM 四件事中的前三件；第四件以「HR 手動確認 + 複製 IT 通知範本」閉環。

### 包含

| 項目 | 說明 |
|------|------|
| 路由 + 總覽頁 | 列表、篩選、aggregates |
| 詳情頁 shell | Header、deadline banner、stepper |
| 區塊一：下屬指派 | SearchableSelect + batch assign |
| 區塊二：模板負責人 | 含 EC-01 離職模板特殊 UI |
| 區塊三：簽核代理 | PATCH + poll；ETag if available |
| 區塊四：系統清單 | **唯讀** list + HR checkbox confirm |
| 狀態機 | in_progress / blocked / complete / frozen 四態 UI |
| POST complete / unfreeze | 依 capabilities |
| 空狀態 | 各區塊 + 總覽 |
| Edge cases | EC-01 ~ EC-05 |

### 不包含

- IT ticket 自動建立
- Email / Teams 通知
- 連鎖離職自動 re-open
- 撤回離職 flow
- PDF 匯出（可先用 CSV stub）
- SSE（用 30s poll 即可）

### 驗收標準

1. Stacy 演示腳本：建立 → 指派 → 17:00 前 complete → 列表顯示完成
2. 演示凍結：mock `deadlineAt` 已過 → UI 正確 frozen
3. 離職模板 owner edge case 有專用 UI

---

## P1（Sprint 3）— 營運可用

### 目標

從「能演示」到「HR 願意每天用它」。

### 新增

| 項目 | 說明 |
|------|------|
| 通知 | 主管 deadline T-3/T-1 email；frozen 時 HR alert |
| EC-06 連鎖離職 | 代理人離職 → 自動 reopen + 通知 |
| EC-08 D+1 簽核 | 後端調整凍結規則 + `expectedReturnAt` UX |
| EC-09 idempotent 建立 | 409 handling |
| IT 整合 v1 | 「建立 IT ticket」按鈕 → ServiceNow API（若 tenant 有接） |
| 匯出 | PDF/CSV 正式版含 audit trail |
| SSE / 10s poll | critical phase 加速同步 |
| 延長 deadline | HR modal + audit |
| CustomerWeb 聯動 | 員工提離職自動建 checklist（若 backend ready） |

### 依賴後端

- Org 離職 event bus
- ITSM connector
- 凍結規則 PM sign-off 文件

---

## V2（Sprint 4–5）— 規模與洞察

### 目標

多公司、多離職並發、管理層報表。

### 新增

| 項目 | 說明 |
|------|------|
| EC-07 撤回離職 | cancel + rollback 策略 |
| 批量離職 | 部門整批裁員 wizard |
| 主管儀表板 | 「我的團隊離職風險」widget |
| 完成率報表 | HR analytics：平均完成時間、常卡住區塊 |
| 權限細分 | 部門 HR vs 全公司 HR |
| 行動版優化 | 主管手機審批代理 |
| 與 TubeHR-WebAdmin | superadmin 跨 tenant 稽核視圖（只讀） |

---

## 與現有 Backlog 優先級關係

| 現有票 | 建議 |
|--------|------|
| BACKLOG-001 FormList perf | **先做** — 現網 P0 客訴 |
| BACKLOG-002 approval race | **先做** — offboarding 區塊三直接受益 |
| BACKLOG-003 PR review | onboarding 順便 |
| BACKLOG-004 本 feature | Q1 2027 roadmap；MVP 可 Sprint 規劃但 **不搶 001/002 資源** |

此順序與 David / Stacy 在 team-chat 的語氣一致：新 feature 不急，現網火先滅。

---

## 前端 Sprint 1 任務拆解（參考）

**Week 1**
- [ ] 路由、layout、空殼頁
- [ ] API client types（`types/offboarding.ts`）
- [ ] 總覽列表 + mock data 開發

**Week 2**
- [ ] 詳情頁四區塊 UI
- [ ] 狀態 banner + stepper
- [ ] 區塊一、二 mutation flow
- [ ] 區塊三 integrate `useApprovalSync` 模式
- [ ] frozen / blocked 態样式
- [ ] 串 backend staging

---

## 給 PM 的一句話

> MVP 2 sprint 可演示「主管四步交接 + 17:00 凍結」；要給 HR 每天用再加 1 sprint（P1 通知 + IT）；連鎖離職與撤回留 V2。
