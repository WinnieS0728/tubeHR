# WORKLOG - 張維承

> 完成度高 better，但不全做不扣分。本 log 聚焦思路、決策與取捨；技術細節見各 `backlog-XXX/` 產出。

---

## 0. 開工前 5 分鐘的判斷

讀完 README、team-chat、backlog 後，兩個訊號最突出：

1. **P0 — reportlab 列表**：Stacy 本月第三次催，Vivian 離職前也說「virtualization 必要但不夠」→ 不是單一 perf 問題。
2. **P1 — 簽核跳回待簽**：Arthur #4744 難復現，但 ticket 還開著；Kevin PR #142 在等 review。

接著掃過 BACKLOG-001 與 Kevin PR #142（`PR-pending-form-card-perf.md`）後，直覺判斷**兩者其實是同一條任務線**——都在講 FormList 列表，PR 解的是 perf 切片，001 則把 perf 與正確性拆開；若沒先釐清 001 的全貌就 review PR，很容易只肯定 virtualization、漏掉 filter 覆寫等既有 bug。

**結論**：先把 001 提前，建立問題地圖、拆成可獨立 merge 的階段；001 有脈絡後立刻接 003 review Kevin 的 PR（同一任務線的上下游）。002 需後端配合，排在後面；004 規劃題放在文件與既有火都穩定之後。

**因此**：人工排序 → multi-agent 並行規劃 → 人工審查 agent 產出 → SDD/TDD 任務化 → 依 task 順序實作 code。

**工作方式（刻意不搶跑 code）**：

- 我的習慣是 **SDD + TDD**：先寫清楚行為規格（PWD）、驗收條件與測試 seam，把根因與修復切片釐清後，再動 `codebase/`。本輪因此以文件與結構化交付為主，001 的程式修改在 spec 到位後才委派 agent 工作流執行。
- 不直接 merge PR #142 原文：virtualization 方向可參考，但需對齊 001 分階段計畫，避免 perf 修了、正確性仍漏。
- 不跑本地環境：題目不需跑起來，靜態讀 code + spec 對照即可。

---



## 1. 工作日誌（按階段）

> 流程總覽：**setup → 全局掃描與排序 → multi-agent 並行規劃 → 人工審查 agent 產出 → SDD/TDD 任務化與實作**



### 時段 1 — 專案 setup 與 AI codebase sync

**做了什麼**：

- 開啟 repo、掃過 `README.md`、`codebase/ARCHITECTURE.md`、`team-chat/`、`backlog/`、`your-work/` 的目錄分工
- 在 Cursor 內建立工作環境：確認 AI 能讀到 `codebase/` 與 `your-work/`（index / @codebase），避免後續分析漏檔
- 讓 AI 與 codebase「對齊同一套地圖」：先讀 FormAdmin 核心路徑（`FormList`、`ApprovalStatus`、`useApprovalSync`、Jotai atoms）再開工單，減少幻覺與過期推論
- 配置 subagent 角色（`ticket-coordinator`、`sdd-spec-writer`、`tdd-implementer`），為後續 multi-agent 分派做準備

**為什麼這時候做這個**：

- 前一位前端緊急離職、交接不足；若 AI 沒先 sync 專案脈絡，很容易在錯的檔案或錯的假設上生成分析
- 後續要走 SDD + TDD + multi-agent，需要先把「規格寫哪、code 改哪、測試 seam 在哪」的路徑固定，setup 是一次性投資

**用了什麼工具 / AI**：

- Cursor + 專案索引；用 AI 快速畫出模組依賴與檔案索引，再人工對照 `ARCHITECTURE.md` 抽查

**遇到的卡點**：

- 題目不需跑起來 → setup 刻意停在「讀得懂、找得到、AI 不瞎編」，不花時間在 `npm install` / dev server
- AI 常常會做我不想要的東西，可能剛 sync 所以 context 也不夠，前期會需要花很多時間驗證 AI 的輸出

---



### 時段 2 — 全局掃描與人工排序

**做了什麼**：

- 掃過 BACKLOG-001～004、`team-chat/`、Kevin PR #142（`PR-pending-form-card-perf.md`）
- **人工**定優先級與問題結構（不交給 AI 決定順序）

**為什麼這時候做這個**：

- 四張工單彼此有依賴（001 與 003 同一任務線、002 需後端、004 依賴 001/002 穩定）；先全局看過再開 agent，才不會 sub-agent 各做各的、方向打架

**用了什麼工具 / AI**：

- 此階段以人工閱讀為主；AI 僅輔助快速定位檔案，**排序與結構判斷自己下**

**遇到的卡點**：

---



### 時段 3 — Multi-agent 並行分派

**做了什麼**：

- 在**統一 context** 之後，由主 agent（`ticket-coordinator`）一次指派多個 sub-agent **同時**處理不同工單的規劃：
  - **001**：根因分析、分階段修復、PWD 草稿 → `backlog-001/`
  - **002**：`updatedAt` 方案、mitigation、給 Tina 的需求 → `backlog-002/`
  - **003**：Kevin PR #142 review（含 review comments、決策、訊息草稿）→ `backlog-003/`
  - **004**：離職交接清單可行性與 UI/API 規劃草稿 → `backlog-004/`
- 各 sub-agent 在**自己的 session** 內迭代修正，完成後將結果回傳主 agent 彙整

**為什麼這時候做這個**：

- 四張工單的「規劃類」工作彼此獨立度高，並行可省時間；且 003 的 PR review 本來就是獨立 deliverable，適合交給專責 sub-agent
- 此階段**不寫 TASK 定稿、不動 code**——只產草稿與分析，留給時段 4 人工審查

**用了什麼工具 / AI**：

- Multi-agent orchestration：主 agent 拆工 → sub-agent 並行
- 各工單內的修改來回在 sub-agent session 內完成，避免單一對話 context 爆炸

**遇到的卡點**：

- sub-agent 產出品質不一 → 不能跳過人工審查直接當定稿

---



### 時段 4 — 審查閘門（Review Gate）

**做了什麼**：

- **人工**逐份審閱時段 3 各 sub-agent 回傳的產出：RCA 是否拆對、002 方案是否 over-scope、003 review 語氣與分 scope 是否合理、004 MVP 邊界是否收斂
- 對 PWD 草稿做修正、定稿方向（通過 / 打回 sub-agent 補寫——補寫仍在原 sub-agent 或新開 session，不與規劃主線混用）
- Agent 實作產出後的 **commit / PR**：另開**獨立 session** 的 agent 做 review（不與規劃主 session 共用 context，專心對 diff 找問題）

**為什麼這時候做這個**：

- 時段 4 審的是**該 agent 的回應是否可用**，不是我自己重做一次 PR review
- 規劃與 code review 分 session，避免規劃階段的假設污染 review，也避免 review 意見被規劃 context 稀釋

**用了什麼工具 / AI**：

- 時段 4 以**人工閱讀** sub-agent 產出為主
- commit / PR review 委派獨立 session agent；結論再由人工取捨是否採納

**遇到的卡點**：

- AI 草稿常過於樂觀或漏 edge case（如 001 只建議 debounce）→ 必須對照 code 抽查後才放行進入任務化

---



### 時段 5 — SDD/TDD 任務化與實作

**做了什麼**：

- 時段 4 通過的 PWD，收成可執行結構：`pwd/ACCEPTANCE.md`、`task/TASK.md`、`task/SEAMS.md`，並建立 `sdd-tdd/README.md` 工作流說明
- 依各 `TASK.md` 的 slice 順序，委派 `tdd-implementer` 實作 **001 code**（002 維持文件方案、不動 code）
- 實作完成後，觸發時段 4 所述的獨立 session 做 agent PR / commit review

**為什麼這時候做這個**：

- SDD/TDD 的 TASK / SEAMS 是「可開工」的契約，應在人工審查後才寫死；避免 agent 邊規劃邊實作、規格飄移
- 001 文件與 task 到位後才動 `codebase/`，符合「先脈絡、後程式」

**用了什麼工具 / AI**：

- `sdd-spec-writer` / 主 agent 協助將定稿 PWD 切片為 TASK
- `tdd-implementer` 依 `ACCEPTANCE.md` 垂直切片實作；本輪我負責驗收對照，不親手改 `codebase/`

**遇到的卡點**：

---



## 2. 取捨清單


| #   | 取捨                               | 選了什麼                            | 為什麼                             | 放棄的代價                                 |
| --- | -------------------------------- | ------------------------------- | ------------------------------- | ------------------------------------- |
| 1   | 先修正確性 vs 先 perf                  | 001 Step 1 filter 先做            | P0、每次 filter 都會中、改動小            | perf 痛點留 Step 2                       |
| 2   | Merge PR #142 vs Request Changes | Request Changes                 | build blocker + PR 自引入問題        | Kevin 多一輪修改                           |
| 3   | ETag vs updatedAt（002）           | updatedAt + 前端三層 mitigate       | Tina 來不及、場景是 stale poll         | 多人搶改同一單未覆蓋                            |
| 4   | 全工單寫 code vs 文件優先                | 四工單文件完整；code 僅 001，且委派 agent 執行 | 3h 內先 unblock 團隊；spec 清楚再動 code | 002 無 live diff；本 log 不含 code diff 細節 |
| 5   | 單一對話 vs multi-agent 並行           | 統一 context 後 multi-agent 分派     | 四工單規劃可並行、context 不爆炸            | 需時段 4 人工審查閘門                          |


---



## 3. AI 使用紀錄



### 我用 AI 用在哪

- **時段 1**：專案索引、模組依賴速覽、subagent 配置
- **時段 2**：僅輔助找檔；**排序與結構判斷不用 AI**
- **時段 3**：multi-agent 並行——主 agent 分派，sub-agent 分別產出 001～004 規劃草稿與 003 PR review
- **時段 4**：人工審 sub-agent 產出；agent commit/PR 由**獨立 session** agent review
- **時段 5**：TASK/SEAMS 切片、`tdd-implementer` 實作 001 code
- **WORKLOG**：所有任務結束後，用 AI 整理所有 context 並總結出脈絡。



### AI 有沒有幫倒忙？怎麼識別的？

**工作方式上的衝突（最困擾我的部分）**：

- AI 傾向**一次把整件事做完**（分析 → 改 code → commit → 開 PR），但我比較習慣**循序漸進**：每一步都先看產出、確認方向對了再往下走。
- 請它「只改某一段」時，AI 常「太聰明」——改完就直接 `push`、順便開 PR，跳過我想人工檢查的環節。這會讓我失去對節奏的掌控，也難以判斷問題出在哪一步。
- **因應**：才會把流程拆成時段 2～5（排序 → 並行規劃 → 人工審查閘門 → 任務化後才實作），並要求 sub-agent 只回傳產出、不擅自 push / 開 PR；commit / PR review 另開獨立 session。



### 我做了哪些反向驗證確認 AI 的輸出沒推坑？

- **節奏**：每個時段結束先人工過一輪，通過才進下一階段；不讓 AI 連續執行「規劃 + 實作 + 提交」
- **模糊或多選一的任務**：另開**新的 agent session**，分別從不同角度提出方案（避免單一對話越早走越窄）；最後由**人工判斷**，再搭配 AI 統整成一份決策
  - **例子（002）**：`updatedAt` vs ETag / If-Match——分開請 agent 論述各自優缺點與後端成本，對照 ticket 場景（單人批次審核、stale poll）與 Tina 交付時程後，人工定案選 `updatedAt` → 見 `backlog-002/decision.md`

---



## 4. 問題清單（必填）


| #   | 問題                          | 優先級      | 我做了嗎                          | 驗證過是真問題嗎？怎麼驗的                     | 不做的理由（如果沒做）                      |
| --- | --------------------------- | -------- | ----------------------------- | --------------------------------- | -------------------------------- |
| 1   | Filter 覆寫 `formListAtom`    | P0       | ✅ 001 文件 + spec；code 委派 agent | 靜態 trace `handleFilterChange`     | —                                |
| 2   | 6000 筆全量 render             | P0       | ✅ 001 規格                      | 讀 code + team-chat 症狀一致           | Step 2 virtualization 待 agent 實作 |
| 3   | `Date.now()` 破壞 memo        | P0       | ✅ 001 規格 + 003 review         | 讀 `FormList.tsx` L96              | Step 2 一併處理                      |
| 4   | 租戶切換 stale data             | P1       | ✅ 001 規格 Step 3               | `tenantId` 讀了未用於 fetch            | 時間/範圍，留 Step 3                   |
| 5   | 簽核 poll race                | P1       | ✅ 002 方案文件                    | 讀 `useApprovalSync` 無 merge guard | code 依 spec 下一輪                  |
| 6   | PR #142 缺 `react-window` 依賴 | P0（該 PR） | ✅ 003 review                  | 讀 `package.json`                  | —                                |
| 7   | 編輯頁 hydration 閃爍            | P2       | ❌                             | team-chat 提及                      | 001 標為 out of scope              |
| 8   | Build 時間 30s→3min           | P2       | ❌                             | David 訊息                          | 與 onboarding 任務無關                |


---



## 5. 跨團隊協作的決策



### 5.1 遇到「後端有問題、前端能 mitigate」的情況，你怎麼處理？

002 簽核 race：採前端三層防護（暫停 poll、guard window、`updatedAt` merge），後端只請 Tina 補 PATCH `updatedAt`，不擅自承諾 ETag。詳見 `backlog-002/decision.md`、`notes-to-tina.md`。

### 5.2 給 PR 作者（Kevin）的 review，你的策略是什麼？

- **決策**：Request Changes
- **分層**：must-fix（依賴、PR 自引入問題）公開講清楚；001 既有 bug（filter、tenant）標 follow-up，不在此 PR 擋 merge
- **語氣**：先肯定 virtualization 方向與 perf 數字；建設性細節放私訊，offer pair
- 詳見 `backlog-003/review-decision.md`、`message-to-kevin.md`



### 5.3 你留給後端 / 設計 / PM 的訊息是什麼？放哪？


| 對象       | 檔案                                                                | 內容摘要                 |
| -------- | ----------------------------------------------------------------- | -------------------- |
| Tina（後端） | `backlog-002/notes-to-tina.md`                                    | PATCH 回傳 `updatedAt` |
| Kevin    | `backlog-001/notes-to-kevin.md`、`backlog-003/message-to-kevin.md` | 001 分階段 + PR review  |
| David    | `backlog-003/message-to-david.md`                                 | 系統性問題與團隊動態           |
| PM / 客服  | `backlog-001/customer-communication.md`                           | reportlab 進度與預期      |


---



## 6. 如果再給我 3 小時

依既有 spec 繼續走，不另開新路。優先完成「客戶會痛」的交付，再處理團隊長期健康度：

### 6.1 功能與修復（延續本輪 backlog）

1. **001 Step 2**：移除 `Date.now()` + `react-window` virtualization 最小版 → 對照 `verification-plan.md`
2. **001 Step 3**：租戶切換 refetch + atom reset
3. **002 Phase 1**：`mergeByUpdatedAt()` + `useApprovalSync` 整合（見 `backlog-002/task/TASK.md`）
4. **跟 Kevin pair**：修 PR #142 must-fix，對齊 001 Step 2 方向
5. **004**：等 PM brief 對齊後再開實作 spike



### 6.2 工程健康度（本輪看到但刻意不做的事）

1. **Build time 調查**（David：30s → 3min）
  - `git bisect` 或 CI 歷史找出回歸點；區分是依賴變胖、Webpack 設定、還是某次 PR 引入大量 client bundle
  - 產出簡短 note 給 David（根因 + 建議修法 + 是否需開 ticket），不求 3 小時內修完，但求「可追」
2. **Coding Style 整理**
  - 本輪在 code review / RCA 反覆看到的反模式，收成團隊可執行的約定（不必一次寫很厚）：
    - **資料流**：`formListAtom` 只存原始列表，filter 用 derived state（對應 001 Bug A）
    - **效能**：render 期不傳 `Date.now()`；大列表必須 virtualization；`key` 用穩定 id
    - **副作用**：`useEffect` deps 寫清楚；poll / mutation 要有 guard（對應 002）
    - **AI 產出**：production 不留 `console.log`、無功能的 observer、過度 aggressive 的 `memo` compare（對應 003）
  - 形式可以是 `your-work/coding-style-notes.md` 或 CONTRIBUTING 草稿，讓 Kevin / 後續新人有共同基準，減少「每張 PR 各寫各的」

**為什麼這個順序**：001 / 002 直接解客戶與客服 ticket；build time 與 coding style 不擋本輪 onboarding 交付，但 Vivian 離職後若不做，技術債會繼續堆在下一個人身上。

---



## 7. 自由欄位

很高興有這個機會可以實際體驗完整的團隊開發過程，也是我第一次非常大量的使用 AI 在我的工作流程中，過程很有趣，也更了解 AI 哪裡好哪裡不好。