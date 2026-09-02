'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { useAtom } from 'jotai';
import { formListAtom, formFilterAtom, tenantIdAtom } from '@/lib/jotai/atoms';
import { fetchForms } from '@/lib/api/client';
import { FormCard } from './FormCard';
import type { FormTemplate } from '@/types/api';

const ROW_HEIGHT = 92;
const LIST_HEIGHT = 600;

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

  const filteredForms = useMemo(() => {
    return forms.filter((f) => {
      if (filter.status && f.status !== filter.status) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (!f.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [forms, filter.status, filter.search]);

  const handleFilterChange = (key: keyof typeof filter, value: any) => {
    setFilter({ ...filter, [key]: value });
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    handleFilterChange('search', value);
  };

  const handleCardClick = useCallback((formId: string) => {
    window.location.href = `/forms/${formId}`;
  }, []);

  const Row = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const form = filteredForms[index];
      return (
        <div style={style} className="px-0.5">
          <FormCard
            form={form}
            onClick={() => handleCardClick(form.id)}
          />
        </div>
      );
    },
    [filteredForms, handleCardClick]
  );

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
          共 {filteredForms.length} 筆
          {filteredForms.length !== forms.length && (
            <span className="text-gray-400"> / {forms.length}</span>
          )}
        </div>
      </div>

      <FixedSizeList
        height={LIST_HEIGHT}
        itemCount={filteredForms.length}
        itemSize={ROW_HEIGHT}
        width="100%"
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
