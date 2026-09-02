# UI、API、狀態機

## 1. UI 結構

### 路由

```
/admin/offboarding                    → 總覽（列表 + 篩選 + 摘要卡片）
/admin/offboarding/[checklistId]      → 詳情（主操作頁）
```

掛在現有 `(admin)` layout，與 `/admin/forms` 並列。權限由後端 `capabilities` 決定，前端不 hardcode role。

### 總覽頁

- **Header**：篩選（狀態、部門）、搜尋、新增離職交接（HR）
- **SummaryCards**：進行中 / 卡住 / 今日截止 / 已凍結
- **列表**：員工、最後在職日、截止時間、進度（2/4）、狀態、操作
- 預設排序：`deadlineAt ASC`；凍結、卡住優先標紅

### 詳情頁（由上而下）

| 區塊 | 內容 |
|------|------|
| Header | 員工摘要、全局狀態 badge、整體進度 |
| Deadline Banner | 倒數 / 凍結警告（用 `serverNow` + `deadlineAt`） |
| Stepper | 四步進度，可點跳 anchor |
| 區塊一 | 下屬 → 指派新主管（SearchableSelect + 批次指派） |
| 區塊二 | 表單模板 → 重新指派負責人（含離職模板特殊 UI） |
| 區塊三 | 待簽核 → 指定代理人（PATCH + poll，沿用 BACKLOG-002 策略） |
| 區塊四 | 系統清單 → **MVP 唯讀** + HR 勾選確認 |
| Footer | 完成交接 / 延長截止（HR）/ 解凍（HR）/ 匯出 |

### 空狀態

- 無下屬 / 無待簽 / 無模板 → 區塊標 `not_applicable`
- 無系統紀錄 → info 提示「仍建議 HR 人工確認 SSO」
- 四區塊皆空 → stepper 全綠，但須 HR 確認區塊四後才能 POST complete

### UX 原則

- 倒數與凍結**只信後端**，client 不做 17:00 判斷
- mutation 成功後才更新 UI（合規優先，不做樂觀更新）
- tenant 切換時清空 cache（呼應 #4801）
- 新路由 lazy load，不 import FormEditor

---

## 2. API 契約（精簡）

> 所有 request 帶 `X-Tenant-Id`。時間欄位 ISO 8601 UTC，前端依 tenant 時區顯示。

### 核心型別

```typescript
type OffboardingChecklistStatus = 'in_progress' | 'blocked' | 'complete' | 'frozen';
type OffboardingSectionStatus = 'pending' | 'in_progress' | 'complete' | 'blocked' | 'not_applicable';

interface OffboardingChecklistSummary {
  id: string;
  employee: { id: string; displayName: string; lastWorkingDay: string; /* ... */ };
  status: OffboardingChecklistStatus;
  blockReason: string | null;
  deadlineAt: string;      // D 日 17:00 tenant TZ
  serverNow: string;       // 供前端倒數
  completedSections: number;  // 0–4
  totalSections: 4;
}

interface OffboardingChecklistDetail extends OffboardingChecklistSummary {
  sections: {
    directReports: { meta: SectionMeta; items: DirectReportItem[] };
    formTemplates: { meta: SectionMeta; items: FormTemplateItem[] };
    pendingApprovals: { meta: SectionMeta; items: ApprovalItem[] };
    systemAccess: { meta: SectionMeta; items: SystemAccessItem[] };
  };
  capabilities: {
    canEditLastWorkingDay: boolean;
    canComplete: boolean;
    canExtendDeadline: boolean;
    canUnfreeze: boolean;
    canExport: boolean;
  };
}
```

區塊二 `FormTemplateItem` 需含 `isOffboardingTemplate: boolean`；區塊三 `ApprovalItem` 需含 `etag: string | null`（If-Match 用）。

### Endpoints

| Method | Path | 說明 |
|--------|------|------|
| GET | `/api/offboarding/checklists` | 列表 + aggregates |
| POST | `/api/offboarding/checklists` | 建立清單 |
| GET | `/api/offboarding/checklists/{id}` | 詳情（四區塊聚合，一次拿齊） |
| POST | `/api/offboarding/checklists/{id}/complete` | 標記完成 |
| POST | `/api/offboarding/checklists/{id}/unfreeze` | HR 解凍 |
| POST | `/api/offboarding/checklists/{id}/extend-deadline` | HR 延長 |
| PATCH | `.../direct-reports/{reportId}` | 指派新主管 |
| PATCH | `.../form-templates/{formId}` | 指派模板負責人 |
| PATCH | `.../approvals/{approvalId}/delegate` | 指定簽核代理（If-Match） |
| PATCH | `.../system-access` | HR 確認 IT 通知 |

### 對後端的要求

1. 詳情頁一次 GET 拿齊四區塊，不要前端拼 4+ 支 API
2. 必回 `serverNow`；凍結由 cron 觸發，前端 poll 反映
3. 簽核 delegate 支援 `If-Match: {etag}`（與 BACKLOG-002 共用）
4. `capabilities` 驅動按鈕 visibility
5. 所有 nested object 當 nullable 處理

---

## 3. 狀態機

### 整體四態

```
建立 → in_progress
in_progress ↔ blocked（區塊 blocked 解除）
in_progress/blocked → complete（四區塊全完成 + POST /complete）
in_progress/blocked → frozen（deadlineAt 到達，後端 cron）
frozen → in_progress（HR POST /unfreeze）
```

**前端不自行做 `→ frozen` 轉換**，以 poll 收到後端 `status: frozen` 為準。

### 區塊狀態

每區塊獨立：`pending` → `in_progress` → `complete`，或 `not_applicable`（無項目），或 `blocked`（缺資料）。

全局推導（後端責任）：

```
任一區塊 blocked → checklist.blocked
全部 complete/not_applicable → 可 POST complete
deadline 到且未完成 → frozen（cron）
否則 → in_progress
```

### Deadline Banner（前端 display phase）

| Phase | 條件 | 樣式 |
|-------|------|------|
| normal | 剩餘 > 72h | 無 |
| warning | 72h ≥ 剩餘 > 24h | 黃 |
| critical | 剩餘 ≤ 24h | 紅 + 倒數 |
| expired | status = frozen | 灰 + 鎖 |
