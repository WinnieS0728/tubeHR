import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { formListAtom, formFilterAtom, tenantIdAtom } from '@/lib/jotai/atoms';
import { fetchForms } from '@/lib/api/client';

/**
 * 拉表單列表
 * 租戶切換時清空 stale data 並 refetch；filter 僅 client-side，不觸發 API。
 */
export function useFormList() {
  const [forms, setForms] = useAtom(formListAtom);
  const [filter] = useAtom(formFilterAtom);
  const [tenantId] = useAtom(tenantIdAtom);

  useEffect(() => {
    if (!tenantId) return;

    setForms([]);
    fetchForms(filter).then((data) => setForms(data.items));
  }, [tenantId, setForms]);

  return { forms };
}
