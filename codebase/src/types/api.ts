/**
 * 後端 API 型別定義
 *
 * 注意：後端沒提供 OpenAPI spec，這些型別是 Vivian 看 response 手刻的。
 * 很多地方用 any 是因為後端 nullable 不一致 + schema drift 嚴重。
 * — Vivian, 2026-04
 */

export type FormStatus = 'draft' | 'published' | 'archived' | 'deprecated';

export type ApprovalStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'withdrawn';

export interface FormTemplate {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  status: FormStatus;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string;
  publishedAt: string | null;

  createdBy: any; // 後端有時回 string (userId)，有時回 object，沒對齊
  fields: any[]; // 表單欄位 schema，後端持續調整中
  metadata: any; // 雜物袋

  approvalFlowId: string | null;
  activeSubmissionCount: number; // 進行中的簽核單數
}

export interface ApprovalFlow {
  id: string;
  formId: string;
  steps: any[]; // 後端最近改了 3 次，先 any
}

export interface FormListResponse {
  items: FormTemplate[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FormListQuery {
  page?: number;
  pageSize?: number;
  status?: FormStatus | FormStatus[];
  search?: string;
  createdBy?: string;
  sortBy?: 'name' | 'updatedAt' | 'activeSubmissionCount';
  order?: 'asc' | 'desc';
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApprovalStatusUpdatePayload {
  status: ApprovalStatus;
  comment?: string;
}

// FIXME(vivian): User 從後端來經常有不同欄位，先這樣
export type User = any;
