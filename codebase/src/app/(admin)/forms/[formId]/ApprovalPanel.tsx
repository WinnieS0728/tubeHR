'use client';

import { useEffect, useState } from 'react';
import { ApprovalStatus } from '@/components/ApprovalStatus';

interface Props {
  formId: string;
}

export function ApprovalPanel({ formId }: Props) {
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/forms/${formId}/active-submissions`)
      .then((r) => r.json())
      .then(setSubmissions);
  }, [formId]);

  if (submissions.length === 0) {
    return <div className="text-sm text-gray-400">沒有進行中的簽核單</div>;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-gray-600">進行中的簽核 ({submissions.length})</h2>
      {submissions.map((s) => (
        <ApprovalStatus
          key={s.id}
          submissionId={s.id}
          initialStatus={s.status}
        />
      ))}
    </div>
  );
}
