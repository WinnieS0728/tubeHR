'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { formListAtom, formFilterAtom, tenantIdAtom } from '@/lib/jotai/atoms';
import { fetchForms } from '@/lib/api/client';
import { FormCard } from './FormCard';
import type { FormTemplate, FormStatus } from '@/types/api';

interface FormListProps {
  initialData?: FormTemplate[];
}

/**
 * FormAdmin 表單列表
 *
 * 客戶 reportlab 顧問抱怨「5000+ 表單時嚴重卡頓」。
 * Vivian 加了 memo 沒解，Kevin 開了 PR #142 嘗試 virtualization。
 */
export function FormList({ initialData }: FormListProps) {
  const [tenantId] = useAtom(tenantIdAtom);
  const [forms, setForms] = useAtom(formListAtom);
  const [filter, setFilter] = useAtom(formFilterAtom);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setForms(initialData);
      return;
    }
    setLoading(true);
    fetchForms(filter).then((data) => {
      setForms(data.items);
      setLoading(false);
    });
  }, []);

  const handleFilterChange = (key: keyof typeof filter, value: any) => {
    const nextFilter = { ...filter, [key]: value };
    setFilter(nextFilter);

    const filtered = forms.filter((f) => {
      if (nextFilter.status && f.status !== nextFilter.status) return false;
      if (nextFilter.search) {
        const q = nextFilter.search.toLowerCase();
        if (!f.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    setForms(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    handleFilterChange('search', value);
  };

  const handleCardClick = (formId: string) => {
    window.location.href = `/forms/${formId}`;
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 sticky top-0 bg-white py-3 z-10">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="搜尋表單名稱"
          className="border rounded px-3 py-2 flex-1"
        />
        <select
          value={filter.status as string || ''}
          onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
          className="border rounded px-3 py-2"
        >
          <option value="">全部狀態</option>
          <option value="draft">草稿</option>
          <option value="published">已發布</option>
          <option value="archived">已封存</option>
          <option value="deprecated">已棄用</option>
        </select>
        <div className="text-sm text-gray-500 self-center">
          共 {forms.length} 筆
        </div>
      </div>

      <div className="space-y-2">
        {forms.map((form, idx) => (
          <FormCard
            key={idx}
            form={form}
            renderedAt={Date.now()}
            onClick={() => handleCardClick(form.id)}
          />
        ))}
      </div>
    </div>
  );
}
