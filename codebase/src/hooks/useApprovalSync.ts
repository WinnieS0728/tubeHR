import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { approvalStatusCacheAtom } from '@/lib/jotai/atoms';
import { fetchApprovalStatus } from '@/lib/api/client';

/**
 * 同步單個 submission 的狀態到 jotai cache
 * 多個元件可以共用同一個狀態，避免重複 poll
 *
 * 註：寫了但只有 1 個地方在用，先不刪，可能未來需要 — Vivian
 */
export function useApprovalSync(submissionId: string) {
  const [cache, setCache] = useAtom(approvalStatusCacheAtom);

  useEffect(() => {
    const tick = async () => {
      try {
        const res = await fetchApprovalStatus(submissionId);
        setCache((prev) => ({ ...prev, [submissionId]: res.status }));
      } catch (err) {
        console.warn(err);
      }
    };
    tick();
    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  });

  return cache[submissionId];
}
