/**
 * Fetch wrapper
 *
 * 主要職責：
 *  1. 帶 X-Tenant-Id header（multi-tenant 必須）
 *  2. 401 → refresh token → retry
 *  3. 統一 error 格式
 *
 * — Vivian, 2026-03
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.tubehr.dev';

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

function getTenantId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tenantId');
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

async function refreshAccessToken(): Promise<void> {
  const refreshToken = localStorage.getItem('refreshToken');
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const data = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
}

export async function apiFetch<T = any>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const tenantId = getTenantId();
  const accessToken = getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(tenantId ? { 'X-Tenant-Id': tenantId } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(opts.headers || {}),
  };

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, { ...opts, headers });

  if (res.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        await refreshAccessToken();
      } catch (err) {
        // refresh 失敗，導回登入
        window.location.href = '/login';
        throw err;
      }
      isRefreshing = false;
      pendingRequests.forEach((cb) => cb());
      pendingRequests = [];
    } else {
      // 等待 refresh 完成
      await new Promise<void>((resolve) => {
        pendingRequests.push(resolve);
      });
    }
    // retry
    return apiFetch<T>(path, opts);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// ---- 業務層 API（thin wrapper）----

import type {
  FormListQuery,
  FormListResponse,
  FormTemplate,
  ApprovalStatus,
  ApprovalStatusUpdatePayload,
} from '@/types/api';

export async function fetchForms(query: FormListQuery): Promise<FormListResponse> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.set(k, String(v));
  });
  return apiFetch<FormListResponse>(`/api/forms?${params.toString()}`);
}

export async function fetchForm(formId: string): Promise<FormTemplate> {
  return apiFetch<FormTemplate>(`/api/forms/${formId}`);
}

export async function fetchApprovalStatus(submissionId: string): Promise<{
  status: ApprovalStatus;
  updatedAt: string;
}> {
  return apiFetch(`/api/approvals/${submissionId}/status`);
}

export async function updateApprovalStatus(
  submissionId: string,
  payload: ApprovalStatusUpdatePayload
): Promise<{ status: ApprovalStatus }> {
  return apiFetch(`/api/approvals/${submissionId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
