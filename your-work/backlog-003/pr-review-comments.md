# PR #142 Review Comments（GitHub thread 草稿）

> 以下模擬在 GitHub PR 上留言的格式。公開 review 以「教學 + 建設性」為主，不堆疊羞辱感。

---

## 總評（PR 層級 comment）

嗨 Kevin，謝謝你主動接 BACKLOG-001，也謝謝在 description 裡老實寫了不確定的地方 — 這對 reviewer 很有幫助。

**整體方向我認同**：6000 row 的場景確實需要 virtualization，`react-window` 也是 Vivian 當時建議的方向。你本機的 perf 數字（8s → 1.5s）代表你找對了主要瓶頸。

不過這個 PR 我會先 **Request changes**，不是否定你的努力，而是有幾個會影響 **build / 正確性** 的點需要先修。修完之後我很有信心可以很快 approve。下面分 thread 說明。

---

## Thread 1 — `FormList.tsx`：`react-window` 依賴未加入

📍 `src/components/FormList.tsx`（import 區）

```ts
import { FixedSizeList } from 'react-window';
```

我看了一下 `package.json`，目前沒有 `react-window`（也沒有 `@types/react-window`）。這個 PR merge 之後 CI build 會直接掛。

**建議**：
```bash
npm install react-window
npm install -D @types/react-window
```

順便確認 bundle size — 我們 prod 已經超 budget 了（ARCHITECTURE.md 寫 ~340KB），加依賴前 worth 跟 David 對一下，但 perf 需求合理，我傾向先加。

---

## Thread 2 — `FormList.tsx`：filter 仍會覆寫原始資料（正確性 bug）

📍 `handleFilterChange`（約 L39–51，這段 PR 沒動但問題還在）

```ts
const filtered = forms.filter((f) => { ... });
setForms(filtered);
```

這是 BACKLOG-001 裡客戶抱怨「搜尋完清除，東西不見了」的根因之一。`forms` 被 filter 結果覆寫後，原始列表就丟了。

`atoms.ts` 其實有寫 hint：

> client filter 請用 useMemo 衍生，勿直接覆寫

**這不是這個 PR 新引入的**，但 Vivian 在 Teams 也提醒過：virtualization 解 perf 不代表正確性也解了。既然我們在動 FormList，我會希望這個 PR **順手修掉**，不然 merge 後客戶還是會回報同一個問題，perf 好了但功能壞著。

**建議方向**（概念，不用跟我一模一樣）：
- `formListAtom` 只存 API 回來的完整列表
- `filteredForms = useMemo(() => forms.filter(...), [forms, filter])`
- `FixedSizeList` 的 `itemCount` 用 `filteredForms.length`

如果你覺得 scope 太大，我們可以拆成 follow-up PR，但要在 description 裡明講「已知 filter bug 未修」，不然 Stacy 那邊會以為 BACKLOG-001 結案了。

---

## Thread 3 — `FormList.tsx`：`Row` 元件定義在 render 內

📍 `FormList` return 前

```ts
const Row = ({ index, style }) => { ... };
```

這個 pattern 每次 `FormList` re-render 都會建立新的 `Row` function reference。`react-window` 不一定會炸，但會讓 child reconciliation 變得難預測，也讓 `FormCard` 的 memo 效果打折。

我之前也這樣寫過，後來改成其中一種：
1. 把 `Row` 抽到檔案外層，透過 `itemData` prop 傳 `forms` + `handleCardClick`
2. 或用 `useCallback` 包 `renderRow`（注意 deps 要含 `forms`）

`react-window` 官方文件有 `itemData` 的範例，值得看一下。

---

## Thread 4 — `FormList.tsx`：`onClick` 仍是 inline arrow

📍 `Row` 內

```ts
onClick={() => handleCardClick(form.id)}
```

你已經把 `handleCardClick` 用 `useCallback` 包了 👍，但 Row 裡還是每次 render 產生新的 arrow function。搭配下面 Thread 5 的自訂 compare，目前「碰巧」不會造成大量 re-render，但這兩個改動疊在一起其實互相矛盾 — memo 的意圖是 skip re-render，inline callback 卻在製造新 reference。

**建議**：要嘛穩定 callback（`itemData` + 穩定 handler），要嘛先拿掉自訂 compare、讓 React 預設 shallow compare 幫你抓 — 二選一，不要兩個都做一半。

---

## Thread 5 — `FormCard.tsx`：自訂 `memo` compare 會漏掉欄位更新

📍 `export const FormCard = memo(FormCardImpl, (prev, next) => { ... })`

```ts
return (
  prev.form.id === next.form.id &&
  prev.form.updatedAt === next.form.updatedAt &&
  prev.form.status === next.form.status
);
```

這個 compare **沒比到** `name`、`version`、`description`、`activeSubmissionCount`。實際場景：有人改了表單名稱但 `updatedAt` 還沒變（或 cache 延遲），卡片會顯示舊資料。

另外 `onClick` 和 `renderedAt` 也沒比 — `renderedAt={Date.now()}` 在 parent 每次 render 都變，但 compare 會擋掉 re-render，所以時間戳其實永遠不會更新。如果 `renderedAt` 只是 debug 用，建議拿掉；如果是產品需求，就不能被 compare 擋住。

**我的建議**：這個 PR 先回到預設 `memo(FormCardImpl)` 就好。virtualization 已經解了 80% 的 perf 問題，自訂 compare 的複雜度 > 收益。等你對哪些 prop 會變有完整盤點再考慮加回來。

---

## Thread 6 — `FormCard.tsx`：IntersectionObserver + `console.log`（建議移除）

📍 `useEffect` + observer callback

```ts
useEffect(() => {
  ...
  console.log('card visible:', form.id);
  ...
}, []);
```

你 description 裡問的 cleanup deps — `disconnect()` 寫法是對的，這部分沒問題 👍

但這段 observer 目前只做 `console.log`，沒有實際的 lazy load 或埋點上報。在 production 6000 row 列表裡，每張可見卡片都打 log 反而可能拖慢 devtools。

**我的判斷**：這段像是 AI 建議的「perf pattern」但沒有對應的產品需求。如果未來要做 visibility tracking，建議另開 ticket，接上正式的 analytics SDK，不要在這個 perf PR 裡混進來。

另外 `useEffect` deps 是 `[]` 但 callback 用到 `form.id` — 目前是 stale closure（永遠 log mount 時的 id）。如果之後真的要留，deps 要加 `[form.id]`。

---

## Thread 7 — `FormCard.tsx`：description 顯示邏輯變了

📍 description 區塊

**Before**（main）：
```ts
{form.description.length > 60 ? `${form.description.slice(0, 60)}…` : form.description}
```

**After**（PR）：
```ts
{form.description || '（無描述）'}
```

truncation 拿掉了，但 `FixedSizeList` 的 `itemSize={92}` 是固定高度。描述變長的卡片會被裁切，使用者看不到完整內容，也沒有 tooltip。

你在 TODO 有寫「改成可變高度」— 同意那是正確方向，但在固定高度 merge 前，建議 **先保留 60 字 truncation**，或確認 92px 夠用。

順帶一提，如果 `description` 是 `null`/`undefined`，main 版的 `.length` 會 throw — 你加的 `|| '（無描述）'` 方向對，可以寫成 `(form.description ?? '').slice(0, 60)` 兩全其美。

---

## Thread 8 — Nice-to-have（不擋 merge，供參考）

| 項目 | 說明 |
|------|------|
| `height={600}` 寫死 | 小螢幕 / 大螢幕體驗不一致，之後可考慮 `useResizeObserver` 或 `calc(100vh - header)` |
| `tenantId` 未使用 | `useAtom(tenantIdAtom)` 讀了但沒反應切換，這是另一個已知 issue（Arthur #4801），可另開 PR |
| `useEffect` fetch deps `[]` | filter / tenant 變了不會 refetch，現有行為，不在這 PR scope |
| 重複 className | `flex items-center gap-2 mb-1 flex items-center` — 小 typo，順手修 |
| PR 測試表寫了 debounce 但 code 沒有 | description 自己也有注意到，誠實加分；建議從 test results 拿掉或補實作 |

---

## Review action

**Request changes** — 見 `review-decision.md`
