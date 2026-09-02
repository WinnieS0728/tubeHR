'use client';

import { useEffect, useState } from 'react';
import {
  fetchApprovalStatus,
  updateApprovalStatus,
} from '@/lib/api/client';
import type { ApprovalStatus as Status } from '@/types/api';

interface Props {
  submissionId: string;
  initialStatus: Status;
}

/**
 * 顯示與操作單一簽核單狀態
 *
 * 客服轉了 3 次「我明明按了同意，怎麼又變待簽？」
 * Reload 就好，所以一直擺著 — Vivian
 */
export function ApprovalStatus({ submissionId, initialStatus }: Props) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetchApprovalStatus(submissionId);
        setStatus(res.status);
      } catch (err) {
        console.warn('poll failed', err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [submissionId]);

  const handleApprove = async () => {
    setUpdating(true);
    setStatus('approved');
    try {
      await updateApprovalStatus(submissionId, { status: 'approved' });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    setUpdating(true);
    setStatus('rejected');
    try {
      await updateApprovalStatus(submissionId, { status: 'rejected' });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const isFinal = status === 'approved' || status === 'rejected' || status === 'withdrawn';

  return (
    <div className="border rounded p-4">
      <div className="text-sm text-gray-500 mb-2">當前狀態</div>
      <div className="text-lg font-medium mb-4">
        {labelOf(status)}
      </div>
      {!isFinal && (
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={updating}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            同意
          </button>
          <button
            onClick={handleReject}
            disabled={updating}
            className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            駁回
          </button>
        </div>
      )}
    </div>
  );
}

function labelOf(s: Status): string {
  switch (s) {
    case 'pending': return '待簽';
    case 'in_review': return '審核中';
    case 'approved': return '已同意';
    case 'rejected': return '已駁回';
    case 'withdrawn': return '已撤回';
  }
}
