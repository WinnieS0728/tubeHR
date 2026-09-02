# PR #142 Review 決策

## 決策：**Request Changes**

## 一句話

方向正確、perf 有實質改善，但有 **build blocker** 和 **正確性風險**，修完核心項後我會很快 approve。

---

## 為什麼不是 Approve

| 嚴重度 | 項目 | 理由 |
|--------|------|------|
| 🔴 必改 | `react-window` 未加入 `package.json` | merge = CI 紅燈 |
| 🔴 必改 | filter 覆寫 `formListAtom`（既有 bug，PR 未修） | 客戶「清除搜尋後資料消失」仍會發生；Vivian 明確警告過 |
| 🔴 必改 | 自訂 `memo` compare 漏欄位 | 可能顯示過期資料，比 perf 更難 debug |
| 🟡 建議改 | `console.log` + 無實際功能的 IntersectionObserver | debug 殘留 + AI 產生的無用複雜度 |
| 🟡 建議改 | description truncation 移除 + 固定 row height | UX regression |
| 🟡 建議改 | `Row` 定義在 render 內 + inline onClick | 削弱 memo / virtualization 效益 |

## 為什麼不是 Comment（也不直接 Reject）

- Kevin 找對了主要 perf 瓶頸，本機數據可信
- `react-window` 選型合理，跟 Vivian 當初方向一致
- cleanup `useEffect` 寫法正確，他問的 deps 問題值得在 review 裡正面回饋
- 多數問題是「AI 幫倒忙」或「經驗不足」，不是態度或能力問題
- Reject 會打擊一個等了一週、剛升職、前輩離職的 junior

## 預期 merge 路徑

1. **第一輪**（擋 merge）：加依賴、修 filter 資料流、移除/簡化 FormCard 的 observer + 自訂 compare
2. **第二輪**（可 follow-up）：可變 row height、tenant 切換、debounce、bundle size 評估

預估 Kevin 修第一輪需要 **半天到一天**，我可以 offer pair session。

---

## Must-fix vs Nice-to-have 總表

### Must-fix（不改不能進）

1. 安裝並 lock `react-window` + types
2. filter 改為 `useMemo` 衍生，不覆寫 atom 原始資料
3. 移除自訂 `memo` compare，或補齊所有會變的欄位（傾向前者）
4. 移除 `console.log` 和無功能的 IntersectionObserver

### Nice-to-have（可這 PR 或 follow-up）

1. `Row` 抽到外部 + `itemData` pattern
2. 恢復 description truncation（配合固定 itemSize）
3. 動態 list height
4. debounce 搜尋輸入
5. `tenantId` 變更時 refetch / clear cache
6. 清掉重複 Tailwind class

### 教學向（公開 review 用「我以前也踩過」語氣）

- stale closure 與 `useEffect` deps（他主動問了，正面回答）
- memo + inline callback 的矛盾
- perf PR 也要看 correctness regression
- AI 生成的「看起來專業」程式碼要會辨識（observer 那段）
