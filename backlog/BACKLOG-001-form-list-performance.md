# BACKLOG-001：表單列表（FormList）效能與正確性問題

**優先級**：🔴 P0
**指派**：未指派
**狀態**：客戶持續抱怨，Vivian 嘗試過修但沒解
**回報來源**：客戶 reportlab（S Tier 訂閱）顧問 + 客服 ticket #4821, #4837, #4856

---

## 描述

S Tier 客戶 reportlab 顧問前兩週反映：

> 「我們公司有 6000+ 表單模板，FormAdmin 列表頁要 8 秒才會載完，
> 而且滑動明顯卡頓，filter 一切換又卡 3-4 秒。」

客服又陸續收到類似回報，多半來自表單數 > 1000 的客戶。

Vivian 在離職前嘗試過幾次：加 `React.memo`、把 row 拆 component、整合 Jotai —
**都沒解**。她在 `ARCHITECTURE.md` 裡有寫但沒寫具體原因。

Kevin（另一位前端）開了 **PR #142** 嘗試 virtualization（見 `codebase/PR-pending-form-card-perf.tsx`），但 PR 卡在 review 還沒進。

---

## 看起來的症狀（客服整理）

1. **列表初載 ~8 秒**（網路只佔 ~1 秒，其他是 client 處理）
2. **切租戶**後 sometimes 還是看到舊租戶的表單（？）
3. **filter status / 搜尋名稱**：一切換就卡 3-4 秒，且**搜尋過一次之後，清除搜尋還是只剩搜尋結果**（客戶反應「東西不見了」）
4. **滑動列表**有掉幀感
5. Vivian 在便利貼上還有寫「偶爾編輯頁會閃一下，看起來是 hydration warning」— 不確定跟這個有關

---

## 需要的產出

- [ ] **根因分析**：哪些是不同的 bug？分別在哪？（提示：可能不只一個）
- [ ] **修復方案**：哪些必修、哪些先繞過、哪些 punt 到下一輪？
- [ ] **客戶溝通摘要**（給 PM 用，非技術語言，1 段就好）
- [ ] **驗證計畫**：你怎麼確認真的修好了？

---

## 相關程式碼

- `codebase/src/components/FormList.tsx`
- `codebase/src/components/FormCard.tsx`
- `codebase/src/lib/jotai/atoms.ts`
- `codebase/src/app/(admin)/forms/page.tsx`

---

## 暗示（如果你有需要）

> 不需要看暗示也能找到問題，這只是怕你卡太久。
> **你也可以選擇不看，直接挑戰**。

<details>
<summary>展開暗示</summary>

- 看到「filter 後清除還是只剩搜尋結果」這個現象，你應該想到「資料來源被覆寫了」
- 看到「滑動卡頓」應該想到「render 數量 × 每 row 工作量」
- 看到 `Date.now()` 在 render 期被呼叫，你應該警覺
- 看到 `useEffect(() => {...}, [])`，先別假設 deps 對

</details>
