# API 契約草案

> 約定：所有 request 必須帶 `X-Tenant-Id` header（沿用 FormAdmin multi-tenant 慣例）。  
> 時間欄位一律 ISO 8601 UTC，前端依 `Accept-Language` / tenant timezone 顯示。

---

## 1. TypeScript 型別定義

```typescript
// ── 枚舉 ──────────────────────────────────────────

/** 整體交接清單狀態 */
export type OffboardingChecklistStatus =
  | 'in_progress'   // 進行中：至少一區塊未完成且未凍結
  | 'blocked'       // 卡住：有區塊無法繼續（缺資料、缺權限、等待外部）
  | 'complete'      // 完成：四區塊全部完成
  | 'frozen';       // 凍結：D 日 17:00 後仍有未完成項目（後端 cron 觸發）

/** 單一區塊狀態 */
export type OffboardingSectionStatus =
  | 'pending'       // 尚未開始
  | 'in_progress'   // 進行中（有未處理項目）
  | 'complete'      // 該區塊所有項目已處理
  | 'blocked'       // 無法繼續
  | 'not_applicable'; // 不適用（如無下屬）

export type OffboardingSectionKey =
  | 'direct_reports'
  | 'form_templates'
  | 'pending_approvals'
  | 'system_access';

// ── 核心資源 ──────────────────────────────────────

export interface OffboardingEmployee {
  id: string;
  employeeNo: string;
  displayName: string;
  email: string;
  department: string;
  jobTitle: string;
  avatarUrl: string | null;
  lastWorkingDay: string;       // date only, e.g. "2026-06-15"
}

export interface OffboardingChecklistSummary {
  id: string;
  tenantId: string;
  employee: OffboardingEmployee;
  status: OffboardingChecklistStatus;
  blockReason: string | null;   // 全局卡住原因（human-readable）
  deadlineAt: string;           // D 日 17:00 in tenant TZ, as ISO
  serverNow: string;            // 後端現在時間，供前端倒數
  completedSections: number;    // 0–4
  totalSections: number;      // 固定 4
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  frozenAt: string | null;
}

export interface OffboardingSectionMeta {
  key: OffboardingSectionKey;
  status: OffboardingSectionStatus;
  blockReason: string | null;
  totalItems: number;
  completedItems: number;
}

// ── 區塊一：下屬 ──────────────────────────────────

export interface DirectReportItem {
  id: string;                   // report relationship id
  employee: OffboardingEmployee;
  currentManagerId: string;     // 即離職者
  newManagerId: string | null;
  newManager: OffboardingEmployee | null;
  isComplete: boolean;
}

export interface DirectReportsSection {
  meta: OffboardingSectionMeta & { key: 'direct_reports' };
  items: DirectReportItem[];
}

// ── 區塊二：表單模板 ──────────────────────────────

export interface FormTemplateHandoverItem {
  formId: string;
  formName: string;
  formStatus: 'draft' | 'published' | 'archived' | 'deprecated';
  activeSubmissionCount: number;
  isOffboardingTemplate: boolean;  // true = 離職交接清單本身
  currentOwnerId: string;
  newOwnerId: string | null;
  newOwner: OffboardingEmployee | null;
  isComplete: boolean;
  /** 若 isOffboardingTemplate=true，後端指定轉移目標 */
  forcedTransferTarget?: {
    type: 'hr_admin_group';
    label: string;
  };
}

export interface FormTemplatesSection {
  meta: OffboardingSectionMeta & { key: 'form_templates' };
  items: FormTemplateHandoverItem[];
}

// ── 區塊三：待簽核 ────────────────────────────────

export interface PendingApprovalItem {
  approvalId: string;
  submissionId: string;
  formName: string;
  applicant: OffboardingEmployee;
  approvalStatus: 'pending' | 'in_review';
  pendingSince: string;
  expectedReturnAt: string | null;  // 若 D+1 才回到此節點
  delegateId: string | null;
  delegate: OffboardingEmployee | null;
  isComplete: boolean;
  /** 供 optimistic lock，呼應 Tina 承諾的 ETag 工作 */
  etag: string | null;
}

export interface PendingApprovalsSection {
  meta: OffboardingSectionMeta & { key: 'pending_approvals' };
  items: PendingApprovalItem[];
}

// ── 區塊四：系統權限 ──────────────────────────────

export interface SystemAccessItem {
  id: string;
  systemName: string;
  systemCode: string;
  lastUsedAt: string;
  accessLevel: string;
  source: 'sso_log' | 'manual' | 'hris';
  hrConfirmed: boolean;         // HR 勾選「已通知 IT」
  itTicketId: string | null;  // P1: IT 工單 id
}

export interface SystemAccessSection {
  meta: OffboardingSectionMeta & { key: 'system_access' };
  items: SystemAccessItem[];
  hrConfirmedAt: string | null;
}

// ── 詳情聚合 ──────────────────────────────────────

export interface OffboardingChecklistDetail extends OffboardingChecklistSummary {
  sections: {
    directReports: DirectReportsSection;
    formTemplates: FormTemplatesSection;
    pendingApprovals: PendingApprovalsSection;
    systemAccess: SystemAccessSection;
  };
  capabilities: {
    canEditLastWorkingDay: boolean;
    canComplete: boolean;
    canExtendDeadline: boolean;
    canUnfreeze: boolean;
    canExport: boolean;
  };
}

// ── Request / Response payloads ───────────────────

export interface OffboardingListQuery {
  page?: number;
  pageSize?: number;
  status?: OffboardingChecklistStatus | OffboardingChecklistStatus[];
  department?: string;
  search?: string;
  deadlineBefore?: string;
  sortBy?: 'deadlineAt' | 'updatedAt' | 'employeeName';
  order?: 'asc' | 'desc';
}

export interface OffboardingListResponse {
  items: OffboardingChecklistSummary[];
  total: number;
  page: number;
  pageSize: number;
  aggregates: {
    inProgress: number;
    blocked: number;
    dueToday: number;
    frozen: number;
  };
}

export interface CreateOffboardingChecklistPayload {
  employeeId: string;
  lastWorkingDay: string;
  /** 可選：若 CustomerWeb 離職單已存在，帶 sourceRef */
  sourceRef?: { type: 'resignation_form'; submissionId: string };
}

export interface ReassignDirectReportPayload {
  reportId: string;
  newManagerId: string;
}

export interface ReassignFormOwnerPayload {
  formId: string;
  newOwnerId: string;
}

export interface DelegateApprovalPayload {
  approvalId: string;
  delegateId: string;
  comment?: string;
}

export interface ConfirmSystemAccessPayload {
  itemIds: string[];
  hrConfirmed: boolean;
  note?: string;
}

export interface ExtendDeadlinePayload {
  newDeadlineAt: string;
  reason: string;
}

export interface UnfreezePayload {
  reason: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

---

## 2. Endpoint 一覽

| Method | Path | 說明 |
|--------|------|------|
| `GET` | `/api/offboarding/checklists` | 總覽列表 + aggregates |
| `POST` | `/api/offboarding/checklists` | HR 建立交接清單 |
| `GET` | `/api/offboarding/checklists/{id}` | 詳情（四區塊聚合） |
| `PATCH` | `/api/offboarding/checklists/{id}` | 更新 lastWorkingDay 等 metadata |
| `POST` | `/api/offboarding/checklists/{id}/complete` | 標記整體完成（後端再驗四區塊） |
| `POST` | `/api/offboarding/checklists/{id}/extend-deadline` | HR 延長截止 |
| `POST` | `/api/offboarding/checklists/{id}/unfreeze` | HR 解凍 |
| `GET` | `/api/offboarding/checklists/{id}/export` | 匯出 PDF/CSV |
| `PATCH` | `/api/offboarding/checklists/{id}/direct-reports/{reportId}` | 指派新主管 |
| `POST` | `/api/offboarding/checklists/{id}/direct-reports/batch` | 批次指派同一主管 |
| `PATCH` | `/api/offboarding/checklists/{id}/form-templates/{formId}` | 指派新模板負責人 |
| `PATCH` | `/api/offboarding/checklists/{id}/approvals/{approvalId}/delegate` | 指定簽核代理 |
| `PATCH` | `/api/offboarding/checklists/{id}/system-access` | HR 確認 IT 通知 |
| `GET` | `/api/offboarding/checklists/{id}/events` | SSE / long-poll 狀態變更（P1，含凍結事件） |

---

## 3. JSON 範例

### 3.1 GET `/api/offboarding/checklists/{id}` — 詳情（節錄）

```json
{
  "id": "ob-cl-20260527-001",
  "tenantId": "tenant-reportlab",
  "employee": {
    "id": "emp-vivian",
    "employeeNo": "E1024",
    "displayName": "Vivian Chen",
    "email": "vivian.chen@example.com",
    "department": "Foundation / Frontend",
    "jobTitle": "Senior Frontend Engineer",
    "avatarUrl": null,
    "lastWorkingDay": "2026-05-23"
  },
  "status": "blocked",
  "blockReason": "區塊二：「離職交接清單」模板需 HR Admin 群組接管，等待 HR 確認",
  "deadlineAt": "2026-05-23T09:00:00.000Z",
  "serverNow": "2026-05-23T07:30:00.000Z",
  "completedSections": 2,
  "totalSections": 4,
  "createdAt": "2026-05-20T01:00:00.000Z",
  "updatedAt": "2026-05-23T07:15:00.000Z",
  "completedAt": null,
  "frozenAt": null,
  "sections": {
    "directReports": {
      "meta": {
        "key": "direct_reports",
        "status": "not_applicable",
        "blockReason": null,
        "totalItems": 0,
        "completedItems": 0
      },
      "items": []
    },
    "formTemplates": {
      "meta": {
        "key": "form_templates",
        "status": "blocked",
        "blockReason": "含系統離職模板，需 HR Admin 群組確認",
        "totalItems": 3,
        "completedItems": 2
      },
      "items": [
        {
          "formId": "form-leave",
          "formName": "請假單",
          "formStatus": "published",
          "activeSubmissionCount": 12,
          "isOffboardingTemplate": false,
          "currentOwnerId": "emp-vivian",
          "newOwnerId": "emp-kevin",
          "newOwner": { "id": "emp-kevin", "displayName": "Kevin Liu" },
          "isComplete": true
        },
        {
          "formId": "form-offboarding",
          "formName": "離職交接清單",
          "formStatus": "published",
          "activeSubmissionCount": 0,
          "isOffboardingTemplate": true,
          "currentOwnerId": "emp-vivian",
          "newOwnerId": null,
          "newOwner": null,
          "isComplete": false,
          "forcedTransferTarget": {
            "type": "hr_admin_group",
            "label": "HR Admin 群組"
          }
        }
      ]
    },
    "pendingApprovals": {
      "meta": {
        "key": "pending_approvals",
        "status": "in_progress",
        "blockReason": null,
        "totalItems": 2,
        "completedItems": 1
      },
      "items": [
        {
          "approvalId": "appr-8821",
          "submissionId": "sub-9912",
          "formName": "請假單",
          "applicant": { "id": "emp-a", "displayName": "陳小華" },
          "approvalStatus": "pending",
          "pendingSince": "2026-05-20T03:00:00.000Z",
          "expectedReturnAt": "2026-05-24T01:00:00.000Z",
          "delegateId": "emp-david",
          "delegate": { "id": "emp-david", "displayName": "David Chang" },
          "isComplete": true,
          "etag": "W/\"abc123\""
        }
      ]
    },
    "systemAccess": {
      "meta": {
        "key": "system_access",
        "status": "pending",
        "blockReason": null,
        "totalItems": 4,
        "completedItems": 0
      },
      "items": [
        {
          "id": "sa-jira",
          "systemName": "Jira",
          "systemCode": "jira",
          "lastUsedAt": "2026-05-20T10:00:00.000Z",
          "accessLevel": "Admin",
          "source": "sso_log",
          "hrConfirmed": false,
          "itTicketId": null
        }
      ],
      "hrConfirmedAt": null
    }
  },
  "capabilities": {
    "canEditLastWorkingDay": true,
    "canComplete": false,
    "canExtendDeadline": true,
    "canUnfreeze": false,
    "canExport": true
  }
}
```

### 3.2 PATCH delegate — 錯誤回應（代理人無權限）

```json
{
  "code": "DELEGATE_LACKS_PERMISSION",
  "message": "指定的代理人沒有此簽核節點的簽核權限",
  "details": {
    "approvalId": "appr-8821",
    "delegateId": "emp-intern",
    "requiredPermission": "approve.leave.level2"
  }
}
```

### 3.3 POST complete — 整體完成失敗

```json
{
  "code": "CHECKLIST_INCOMPLETE",
  "message": "仍有未完成區塊，無法標記完成",
  "details": {
    "incompleteSections": ["form_templates", "system_access"]
  }
}
```

---

## 4. 前端對後端的明確要求

1. **聚合優先**：詳情頁一次 GET 拿齊四區塊；不要前端打 4+ 支 API 自己拼（避免 loading 不一致与 tenant 串資料）。
2. **`serverNow` 必回**：deadline 倒數以 server 時間為準。
3. **凍結由後端 cron 觸發**：前端 poll / SSE 接收 `status: frozen` 變更，不在 client 做 17:00 判斷。
4. **樂觀鎖**：簽核 delegate 的 PATCH 支援 `If-Match: {etag}`（與 Tina 在 team-chat 承諾的 ETag 方向一致）。
5. **capabilities 驅動 UI**：前端不 hardcode HR / Manager role，依後端回傳決定按鈕 visibility。
6. **可空可 null**：所有 nested object 當 nullable 處理（Vivian ARCHITECTURE 血淚提醒）。

---

## 5. 與現有 API 的關係

| 現有 | 離職交接用法 |
|------|-------------|
| `GET /api/forms` | **不直接呼叫**；模板列表由 offboarding 聚合 endpoint 提供 |
| `PATCH /api/approvals/{id}/status` | 簽核「同意/拒絕」仍走原 API；**跨權代理**走新 offboarding delegate endpoint |
| `FormTemplate.createdBy` | 後端需 normalize（現有 any drift），offboarding 區塊二依 `ownerId` 欄位為準 |
