# PR #142 Review Comments（GitHub thread 草稿）

> 照實講 PR 本身的問題。BACKLOG-001 的正確性議題不在此 PR 擋，但會明確標註後續由 001 處理。

---

## 總評（PR 層級 comment）

Kevin，謝謝你主動接 BACKLOG-001 的 perf 部分。

**方向正確**：6000 row 需要 virtualization，`react-window` 也是 Vivian 當初建議的做法，本機 8s → 1.5s 代表你抓到主要瓶頸。

我會 **Request changes**，原因都在這張 PR 改動本身，不是否定方向：

1. `react-window` 沒進 `package.json` — merge 後 CI 會掛
2. FormCard 的自訂 memo compare 和 IntersectionObserver 是這 PR 新加的，有正確性 / 維護性問題
3. description 顯示邏輯改動 + 固定 row height 會造成 UX regression

另外：**BACKLOG-001 還有 filter、租戶切換等正確性問題，團隊已有排程**。那些不在這張 PR 的 merge 條件裡，請你後續 follow 001 做對應處理。我在下面 Thread 2 會點名，避免 merge 後以為 001 全結了。

修完 PR scope 的項目後，我會很快 approve。

---

## Thread 1 — `FormList.tsx`：`react-window` 依賴未加入 🔴

📍 import 區

```ts
import { FixedSizeList } from 'react-window';
```

`package.json` 沒有 `react-window`，也沒有 `@types/react-window`。這 PR merge 後 build 會直接失敗。

```bash
npm install react-window
npm install -D @types/react-window
```

bundle size 已超 budget（ARCHITECTURE.md ~340KB / 250KB），加依賴前 worth 跟 David 確認，但 perf 需求合理。

---

## Thread 2 — `FormList.tsx`：filter 覆寫 atom（不在此 PR 擋，BACKLOG-001 處理）

📍 `handleFilterChange`（這段 PR 沒動，但問題還在）

```ts
setForms(filtered);
```

這是 BACKLOG-001 客訴「搜尋完清除，東西不見了」的根因。`atoms.ts` 註解也寫了不要直接覆寫 atom。

**這不是這 PR 新引入的，我不會因為這個擋 merge。** BACKLOG-001 已有處理時程，請你後續 follow 001 修 — 方向是保留完整列表、用 `useMemo` 做 client-side filter，不要 `setForms(filtered)`。

merge 這 PR 後請在 BACKLOG-001 追蹤，不要跟 PM 說 perf + filter 都結案了。

---

## Thread 3 — `FormList.tsx`：`Row` 定義在 render 內 🟡

📍 `FormList` return 前

每次 re-render 都建立新的 `Row` reference，讓 `react-window` reconciliation 和 FormCard memo 效果打折。

建議：把 `Row` 抽到檔案外層，用 `itemData` 傳 `forms` + `handleCardClick`。`react-window` 文件有範例。

---

## Thread 4 — `FormList.tsx`：inline `onClick` 跟 memo 策略矛盾 🟡

📍 `Row` 內

```ts
onClick={() => handleCardClick(form.id)}
```

`handleCardClick` 已用 `useCallback` 包好了，但 Row 裡還是每次 render 新 arrow function。搭配 Thread 5 的自訂 compare，兩邊改動互相矛盾 — 一邊想 skip re-render，一邊在製造新 reference。

要嘛穩定 callback（`itemData` pattern），要嘛拿掉自訂 compare。不要兩個都做一半。

---

## Thread 5 — `FormCard.tsx`：自訂 `memo` compare 會漏欄位更新 🔴

📍 export

```ts
return (
  prev.form.id === next.form.id &&
  prev.form.updatedAt === next.form.updatedAt &&
  prev.form.status === next.form.status
);
```

沒比到 `name`、`version`、`description`、`activeSubmissionCount`。表單名稱改了但 `updatedAt` 沒變時，卡片會顯示舊資料。

`renderedAt={Date.now()}` 每次 parent render 都變，但 compare 擋掉 re-render，時間戳永遠不更新。若只是 debug 用，拿掉；若是產品需求，compare 不能擋。

**建議**：這 PR 改回預設 `memo(FormCardImpl)`。virtualization 已解大部分 perf，自訂 compare 複雜度 > 收益。

---

## Thread 6 — `FormCard.tsx`：IntersectionObserver + `console.log` 應移除 🔴

📍 `useEffect`

```ts
useEffect(() => {
  ...
  console.log('card visible:', form.id);
  ...
}, []);
```

這段只做 `console.log`，沒有 lazy load 或正式埋點。6000 row 列表裡可見卡片都打 log，devtools 會拖慢。

`useEffect` deps 是 `[]` 但 callback 用到 `form.id` — stale closure，永遠 log mount 時的 id。

cleanup `disconnect()` 寫法沒問題，問題是這段 code 不該進 production perf PR。看起來像 AI 塞的 pattern，沒有對應需求就刪掉。若未來要做 visibility tracking，另開 ticket 接 analytics SDK。

---

## Thread 7 — `FormCard.tsx`：description 顯示邏輯變了 🟡

**Before**：60 字 truncation  
**After**：完整顯示 + `|| '（無描述）'`

truncation 拿掉但 `itemSize={92}` 固定高度，長描述會被裁切。

`(form.description ?? '').slice(0, 60)` 可以同時處理 null 和 truncation。可變 row height 你 TODO 寫了，可以 001 follow-up 做。

---

## Thread 8 — 不在此 PR scope，BACKLOG-001 後續處理

| 項目 | 說明 |
|------|------|
| `tenantId` 未使用 / 切租戶殘留 | Arthur #4801，001 範圍 |
| `useEffect` fetch deps `[]` | filter / tenant 變不 refetch，001 範圍 |
| debounce 搜尋 | PR 測試表寫了但 code 沒有，001 範圍 |
| `height={600}` 寫死 | 001 或 follow-up |
| 重複 className | 順手修，不擋 merge |

---

## Review action

**Request changes** — PR scope 必改項修完後 approve。BACKLOG-001 正確性部分請 follow 001 時程。
