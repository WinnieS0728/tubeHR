# FormAdmin 模組架構（v0.7，2026-05-12 by Vivian — 已離職）

## TL;DR

TubeHR 的 FormAdmin 是讓 **企業 HR Admin** 管理「公司內表單模板」的後台。
員工填表單流（請假/加班/離職交接等）走另一個 App（CustomerWeb），這邊只管 **Admin 視角**：

- 列出公司所有表單模板
- 設計表單（拖拉）+ 發布版本
- 管理簽核流（誰簽 → 簽什麼條件）
- 監看執行中的簽核單

本模組是 **multi-tenant** — 每家公司一個 `tenantId`，**所有 API 必須帶 `X-Tenant-Id` header**。

---

## 技術棧

| 層 | 選型 | 備註 |
|---|---|---|
| Framework | **Next.js 14.2.x (App Router)** | RSC + Client mix |
| Language | **TypeScript 5.4** (strict) | 但 `any` 蔓延（debt） |
| 狀態管理 | **Jotai 2.8** | 全域 atom + 部分 hook scoped |
| 表單 | react-hook-form 7 + Zod | 跟主站對齊 |
| 樣式 | Tailwind 3 + 內部 `@mayo/mayo-ui` | |
| 後端介接 | 自製 `fetch` wrapper（含 401 refresh）| `src/lib/api/client.ts` |
| 測試 | Jest + Testing Library | coverage ~ 30%（debt） |
| Bundler | Next 內建（Webpack）| 還沒換 Turbopack |

---

## 模組分層

```
src/
├── app/
│   └── (admin)/
│       └── forms/                  # FormAdmin 主入口
│           ├── page.tsx            # 表單列表（RSC）
│           ├── layout.tsx
│           └── [formId]/
│               ├── page.tsx        # 表單編輯入口（RSC）
│               └── ApprovalPanel.tsx
│
├── components/
│   ├── FormList.tsx                # client — 列表 + filter
│   ├── FormCard.tsx                # client — 單一表單卡片
│   ├── FormEditor.tsx              # client — 表單編輯器（含 Markdown）
│   └── ApprovalStatus.tsx          # client — 簽核狀態顯示與操作
│
├── hooks/
│   ├── useFormList.ts
│   └── useApprovalSync.ts          # 同步簽核狀態（poll + push）
│
├── lib/
│   ├── api/
│   │   └── client.ts               # fetch wrapper
│   └── jotai/
│       └── atoms.ts                # 全域狀態
│
└── types/
    └── api.ts                      # 後端契約（很多 any，debt）
```

---

## 已知 debt（Vivian 離職前的便利貼，沒整理進票）

> 以下是我憑記憶寫的，可能漏 — 應該還有更多。

1. **`types/api.ts` 很多 `any`** — 後端 schema 沒給 OpenAPI，我臨時用 any 擋掉，準備找後端對 spec 但離職前沒做完。
2. **`FormList` 在 5000+ 列時卡** — 兩個月前客戶 reportlab 顧問抱怨，我加了一版 memo 沒解，最近 Kevin 開了 PR #142 嘗試。
3. **`api/client.ts` 的 401 refresh** — 我寫的，但有遇到「refresh 中又被 401」會無限套娃的疑似 case，沒復現出來。
4. **`ApprovalStatus` 偶爾顯示錯狀態** — 客服轉了 3 次「我明明按了同意，怎麼又變待簽？」，但前端 reload 就好，所以一直擺著。
5. **Build time 從 ~30s 變 ~3 min** — 上個月某次提交後就這樣，bisect 沒時間做。
6. **編輯頁有時候會閃一下** — 看起來是 hydration mismatch，但 console 沒明顯 error，沒去追。

---

## 跟其他系統的關係

- **後端 API**：`TubeHR-BackendApi`（.NET 8）— 同一家公司另一個 repo，**spec 經常變動，不通知前端**（這是日常痛點）
- **CustomerWeb**：員工填表單那邊，跟我們共用 `@mayo/mayo-ui` 但 fork 過、樣式 drift 嚴重
- **TubeHR-WebAdmin**（superadmin）：MAYO 自己的後台，看跨租戶資料，我們**不該**接到它的 API

---

## 部署

- Build 由 Azure DevOps Pipeline 跑（`/azure-pipelines.yml`）
- 環境：dev / staging / prod
- Bundle size budget：< 250KB initial JS（**目前 prod 已超標，~340KB**）

---

## 給接手的人

- 我來不及交接，很抱歉
- backlog 上的事項先做完最重要
- 任何問題請 ping Tech Lead (David)，他比較知道後端那邊的痛
- 不要 trust 後端給的 nullable 標記，永遠當 nullable 處理（被坑過）

— Vivian
