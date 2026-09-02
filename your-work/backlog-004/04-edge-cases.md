# Edge Case 清單

> 共 **12** 項（要求 8+）。分類：**必須處理（MVP）** / **可延後（P1/V2）** / **後端主責**。

---

## 必須處理（MVP）— 5 項

### EC-01：離職者負責的模板含「離職交接清單」本身（遞迴）

| 項目 | 內容 |
|------|------|
| 情境 | 離職者恰好是「離職交接清單」表單模板的 owner |
| 為何會出事 | 不能把模板轉給一般員工，否則下一個離職者又缺模板 |
| MVP 處理 | 後端標 `isOffboardingTemplate=true` + `forcedTransferTarget: hr_admin_group`；前端顯示 warning callout，禁用一般 Select，改「確認轉移至 HR Admin 群組」按鈕 |
| 驗證 | 後端拒絕 `newOwnerId` 為非 HR Admin 的 request |

### EC-02：D 日 17:00 截止與 client/server 時鐘不一致

| 項目 | 內容 |
|------|------|
| 情境 | 使用者電腦時間不准，或跨時區 tenant |
| 為何會出事 | 前端自行判斷 17:00 可能早凍或晚凍 |
| MVP 處理 | 倒數用 `serverNow` + `deadlineAt`；凍結轉換只信後端 poll/SSE；banner 文案寫明「以系統時間為準」 |
| 驗證 | 手動改 client clock 不應改變可操作與否 |

### EC-03：主管離職 — 下屬要交接給誰？

| 項目 | 內容 |
|------|------|
| 情境 | 離職者本身有 direct reports，但離職者的主管也可能同時離職或不存在 |
| 為何會出事 | SearchableSelect 無合法選項 → 區塊永久 blocked |
| MVP 處理 | 後端提供 `suggestedManagers[]`（跳過離職者鏈）；若仍無 → 區塊 `blocked` + 原因「請 HR 更新組織架構」+ 連結 HR 工單；前端不可 silent fail |
| 驗證 | mock 空 suggested list，UI 必須顯示 blocked 而非空 dropdown |

### EC-04：四區塊空清單（零項目）

| 項目 | 內容 |
|------|------|
| 情境 | 離職者無下屬、無負責模板、無待簽、無系統紀錄 |
| 為何會出事 | 使用者不知道「要不要按完成」 |
| MVP 處理 | 各區塊 `not_applicable` 或 auto-complete；區塊四仍要求 HR 手動「確認已核查 SSO」（即使空清單）— 合規需求；全局仍須 explicit POST `/complete` |
| 驗證 | 四區塊皆空時 stepper 全綠但 Footer「完成交接」仍 enabled（區塊四 HR 確認後） |

### EC-05：簽核跨權與現有 race condition（BACKLOG-002）

| 項目 | 內容 |
|------|------|
| 情境 | 主管指定代理人後，UI 顯示成功但 reload 代理人消失；或與原簽核 PATCH 競態 |
| 為何會出事 | team-chat 已確認 approval API 有 race；Tina 可下週加 ETag |
| MVP 處理 | delegate PATCH 帶 `If-Match`；成功後 poll 確認 `isComplete`；失敗顯示「同步失敗，請重試」不 silent overwrite；在 notes-to-backend 明確要求 ETag |
| 驗證 | 與 BACKLOG-002 同一套 mitigation，不在 offboarding 重新發明樂觀更新 |

---

## 可延後（P1/V2）— 4 項

### EC-06：被指派的代理人也離職（連鎖離職）

| 項目 | 內容 |
|------|------|
| 情境 | 5/23 指定 David 代理，David 5/25 也提離職 |
| 為何會出事 | 原清單顯示 complete 但實際無人可簽 |
| 延後理由 | 需 org 離職事件訂閱 + 自動 re-open 區塊三；複雜度高 |
| P1 處理 | 後端 webhook 觸發 checklist revert section3 → in_progress；前端 notification + email |
| MVP | 僅 static 警告文案：「請確認代理人近期無離職計畫」 |

### EC-07：員工 D 日（或之後）撤回離職

| 項目 | 內容 |
|------|------|
| 情境 | HR 已建清單、部分已指派，員工撤回 |
| 為何會出事 | 已 reassign 的下屬/模板是否 rollback？ |
| 延後理由 | 需 PM 定義業務規則（rollback vs 保留） |
| P1 處理 | 新增 `status: cancelled` + audit log；前端 archive 視圖 |
| MVP | 不在 UI 做撤回；HR 聯絡後端 manual cancel |

### EC-08：簽核單 D+1 才回到離職者節點

| 項目 | 內容 |
|------|------|
| 情境 | 多級簽核，離職者節點在 D+3 才 active |
| 為何會出事 | D 日 17:00 凍結時該單技術上仍「未處理」 |
| 延後理由 | 需後端重新定義「待簽」判定（含 future node） |
| P1 處理 | `expectedReturnAt` 欄位 + UI 說明「已指定代理，待流程抵達時生效」；凍結規則 exclude 已 delegate 且 `expectedReturnAt > deadline` 的單 |
| MVP | 顯示 `expectedReturnAt` info banner；凍結仍計入未完成（保守）— 需 PM sign-off |

### EC-09：同一員工重複建立清單

| 項目 | 內容 |
|------|------|
| 情境 | HR 誤按兩次「新增離職交接」 |
| 為何會出事 | 雙份指派紀錄 |
| P1 處理 | POST 建清單 idempotent（同 employeeId + active status → 409 + 既有 id） |
| MVP | 409 時前端 redirect 既有清單 |

---

## 後端主責 — 3 項

### EC-10：D 日 17:00 強制凍結的 authoritative 執行

| 項目 | 內容 |
|------|------|
| 情境 | 16:59:59 有人按完成，17:00:01 cron 凍結 |
| 前端責任 | 僅反映後端狀態；mutation in-flight 時若收到 frozen，顯示「操作已過截止時間」 |
| 後端責任 | cron + DB transaction 保證；audit log；考慮 grace period（PM 決定） |

### EC-11：跨 tenant 資料隔離

| 項目 | 內容 |
|------|------|
| 情境 | HR admin 切換 A/B 公司後看到另一家離職清單（#4801 類似） |
| 前端責任 | 切 tenant 清 Jotai cache + abort in-flight fetch |
| 後端責任 | 所有 query 強制 tenant scope；錯誤 tenant header → 403 |

### EC-12：組織架構環状匯報（A→B→A）

| 項目 | 內容 |
|------|------|
| 情境 | 指派新主管造成 circular reporting line |
| 前端責任 | 顯示後端回傳的 validation error |
| 後端責任 | graph cycle detection；拒絕 PATCH |

---

## 分類統計

| 分類 | 數量 | ID |
|------|------|-----|
| 必須處理（MVP） | 5 | EC-01 ~ EC-05 |
| 可延後（P1/V2） | 4 | EC-06 ~ EC-09 |
| 後端主責 | 3 | EC-10 ~ EC-12 |

---

## Backlog 提示對照

| PM / backlog 提示 | 對應 |
|-------------------|------|
| 主管離職，要交接給誰？ | EC-03 |
| 被指派的代理人也離職 | EC-06 |
| 員工 D 日撤回離職 | EC-07 |
| 簽核單跨到 D+1 才回來 | EC-08 |
| 表單模板是離職交接清單本身 | EC-01 |
