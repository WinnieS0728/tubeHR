# WORKLOG 可引用筆記

> 本文件供填入 `your-work/WORKLOG.md` 時直接引用或改寫。  
> 對應 BACKLOG-004 加分題產出。

---

## 0. 開工前 5 分鐘判斷（WORKLOG §0 草稿）

讀完 README、team-chat、backlog 後的第一印象：

1. **現網火 > 新 feature**：team-chat 裡 reportlab 列表慢（#001）、簽核跳回（#002）、跨 tenant 資料（#4801）都是進行中客訴；Stacy 自己也說 BACKLOG-004「等新前端到再討論，不急」。
2. **但仍值得做規劃題**：這題考的是 edge case 深度與 API 契約能力 — 跟「會不會写 React」無關，跟「能不能當 Foundation 前端」有關。
3. **最大技術訊號**：離職交接不是 CRUD 表單，是 **deadline-driven workflow** + **四域聚合**；若後端不給聚合 API，前端會重蹈 FormList/approval 的 patch 地獄。
4. **決定**：BACKLOG-004 只产出規劃文件在 `your-work/backlog-004/`，不動 `codebase/`；若還有時間再回 BACKLOG-001/002。

---

## 1. 取捨清單（WORKLOG §2 草稿）

| # | 取捨 | 選了什麼 | 為什麼 | 放棄的代價 |
|---|------|---------|-------|-----------|
| 1 | MVP 區塊四深度 | 唯讀 + HR 手動確認 | IT 整合不確定、不 block 1–3 | HR 需多一步 copy 通知範本 |
| 2 | 凍結判斷位置 | 後端 cron 為 authoritative | 避免 client clock / race | 依賴後端準時 cron |
| 3 | D+1 簽核規則 | MVP 保守計未完成 | PM 未 sign-off EC-08 | 可能 frozen 後需 HR unfreeze 才能算 complete |
| 4 | 狀態同步方式 | MVP poll 30s，P1 SSE | 後端 SSE 未必 sprint 1 就绪 | critical 倒數時 UX 略延遲 |
| 5 | 先做規劃 vs 先修 002 | 本 session 做 004 規劃 | 題目交付要求；002 需 Tina API 對齊 | 002 客訴仍未解 |

---

## 2. 問題清單（WORKLOG §4 草稿）

| # | 問題 | 優先級 | 我做了嗎 | 驗證過是真問題嗎 | 不做的理由 |
|---|------|-------|---------|-----------------|-----------|
| 1 | FormList 5000+ 列卡頓 | P0 | 否（本 session） | 是 — ARCHITECTURE + Stacy 信 | 留 BACKLOG-001 |
| 2 | 簽核狀態 race | P0 | 否 | 是 — team-chat 3 次客訴 + Tina 承認 | 需後端 ETag；可写 notes |
| 3 | 跨 tenant 表單殘留 #4801 | P1 | 部分 | 未復現 — 僅 team-chat | offboarding 規劃內寫 mitigate |
| 4 | Build 3min | P2 | 否 | 疑似 — ARCHITECTURE | 非 onboarding 核心 |
| 5 | 離職模板遞迴 owner | P1 | **是（EC-01）** | 邏輯推導 — backlog 明示 | — |
| 6 | 17:00 凍結 client/server 不一致 | P1 | **是（EC-02）** | 業界常見 | — |
| 7 | Bundle 340KB 超标 | P2 | 部分（R5） | 是 — ARCHITECTURE | MVP lazy load 缓解 |
| 8 | 後端 schema drift / any types | P1 | 部分（contract） | 是 — api.ts 注释 | 新 feature 用 strict types |

---

## 3. 跨團隊協作（WORKLOG §5 草稿）

### 5.1 後端問題、前端 mitigate

- **離職交接**：若 approval delegate 仍有 race，沿用 BACKLOG-002 策略 — 不 optimistic、poll 確認、向 Tina 要 ETag。
- **态度**：在 `notes-to-backend.md` 写清楚「要什麼 contract」，不 silent workaround。

### 5.2 PR review 策略（Kevin #142）

- 本 session 未 review；若做 BACKLOG-003：先抓 **correctness > perf**，virtualization 方向對但 Vivian 提醒「perf ≠ 正確性」。

### 5.3 留給 PM / 後端的訊息

| 對象 | 內容 | 位置 |
|------|------|------|
| Stacy | Q1–Q12 待釐清 + MVP 2 sprint 演示 | `06-risks-and-open-questions.md` |
| Tina | B1–B6 API + ETag | 建議 `your-work/notes-to-backend.md` |
| David | 優先級：001/002  antes 004 implementation | WORKLOG §0 |

---

## 4. 若再給 3 小時（WORKLOG §6 草稿）

順序：

1. **BACKLOG-002** — 读 `useApprovalSync.ts` + 写 `notes-to-backend.md` 给 Tina（ETag contract）
2. **BACKLOG-001** — 读 FormList / Kevin PR，列 perf + correctness 分离问题
3. **BACKLOG-003** — review PR #142，留 3–5 条最重要 comment

原因：team-chat 客户压力在 002/001；004 规划已完成，implementation 排 Q1。

---

## 5. AI 使用紀錄（WORKLOG §3 草稿）

### 我用 AI 用在哪

- 生成 API interface boilerplate、Mermaid state diagram 语法
- 系统化枚举 edge case（再人工对照 backlog 提示删/add）
- 组织 phasing 表格

### AI 有没有帮倒忙？怎么识别的？

- AI 初稿倾向「前端自行算 17:00 凍結」→ **错**；已改為後端 cron authoritative（對照 EC-02）。
- AI 建议 MVP 做完整 IT API 整合 → ** over-scope**；對照 team-chat「後端排程緊」降級為 HR 手動。

### 反向验证

- 對照 `ARCHITECTURE.md` multi-tenant 要求 → 補 EC-11
- 對照 `team-chat` Tina ETag 訊息 → 寫入 API contract §4 與 EC-05
- 對照 backlog 5 個提示 edge case → 確認 04-edge-cases 全部覆蓋

---

## 6. 自由欄位（WORKLOG §7 草稿）

- 題目設計巧妙：Vivian 離職本身就是「離職交接」的 live case，meta 感強。
- 缺 design mock — 故意考文字規格能力；UI 描述用 ascii wireframe 補足。
- `context/` 未讀（依指示）；所有假設寫在 06 §5。

---

## 7. 本產出文件清單

```
your-work/backlog-004/
├── README.md                      # 索引 + 執行摘要
├── 01-ui-structure.md             # UI 結構
├── 02-api-contract.md             # API 契約
├── 03-state-machine.md            # 狀態機
├── 04-edge-cases.md               # 12 edge cases
├── 05-phasing.md                  # MVP/P1/V2
├── 06-risks-and-open-questions.md # 風險 + 待釐清
└── 07-worklog-notes.md            # 本文件
```
