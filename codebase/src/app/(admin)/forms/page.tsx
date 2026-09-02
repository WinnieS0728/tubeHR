import { cookies } from 'next/headers';
import { FormList } from '@/components/FormList';
import type { FormListResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

async function getInitialForms(): Promise<FormListResponse> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE!;
  const res = await fetch(`${apiBase}/api/forms?page=1&pageSize=50&sortBy=updatedAt&order=desc`, {
    cache: 'no-store',
  });
  return res.json();
}

export default async function FormsPage() {
  const cookieStore = cookies();
  const tenantId = cookieStore.get('tenantId')?.value;

  const data = await getInitialForms();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">表單管理</h1>
        <a
          href="/forms/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          新增表單
        </a>
      </div>
      <p className="text-xs text-gray-400 mb-3">tenant: {tenantId || '（未設定）'}</p>
      <FormList initialData={data.items} serverTenantId={tenantId} />
    </div>
  );
}
