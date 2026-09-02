import { atom } from 'jotai';
import type { FormTemplate, FormListQuery } from '@/types/api';

// 全域：當前 tenant
export const tenantIdAtom = atom<string | null>(null);

// 表單列表：永遠保存 API 回傳的完整原始資料；filter 僅為 derived view
export const formListAtom = atom<FormTemplate[]>([]);

// 列表 filter
export const formFilterAtom = atom<FormListQuery>({
  page: 1,
  pageSize: 50,
  sortBy: 'updatedAt',
  order: 'desc',
});

// 當前編輯中的表單
export const editingFormAtom = atom<FormTemplate | null>(null);

// 簽核狀態（formId → status）暫存，給多個 ApprovalStatus 元件共享
export const approvalStatusCacheAtom = atom<Record<string, string>>({});
