import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { formListAtom, formFilterAtom } from '@/lib/jotai/atoms';
import { fetchForms } from '@/lib/api/client';

/**
 * 拉表單列表
 * （Vivian 寫了一半就拿到 FormList component 裡了，這個檔案有點冗）
 */
export function useFormList() {
  const [forms, setForms] = useAtom(formListAtom);
  const [filter] = useAtom(formFilterAtom);

  useEffect(() => {
    fetchForms(filter).then((data) => setForms(data.items));
  }, [filter]);

  return { forms };
}
