'use client';

import { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { FormTemplate } from '@/types/api';

interface FormCardProps {
  form: FormTemplate;
  onClick: () => void;
}

function FormCardImpl({ form, onClick }: FormCardProps) {
  const statusColor: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-700',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-yellow-100 text-yellow-700',
    deprecated: 'bg-red-100 text-red-700',
  };

  const lastEdited = formatDistanceToNow(new Date(form.updatedAt), {
    addSuffix: true,
    locale: zhTW,
  });

  const description = form.description ?? '';

  return (
    <div
      className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow flex items-center justify-between bg-white"
      onClick={onClick}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{form.name}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              statusColor[form.status] || 'bg-gray-100'
            }`}
          >
            {form.status}
          </span>
          <span className="text-xs text-gray-400">v{form.version}</span>
        </div>
        <div className="text-sm text-gray-500">
          {description.length > 60
            ? `${description.slice(0, 60)}…`
            : description || '（無描述）'}
        </div>
      </div>
      <div className="text-right text-xs text-gray-400 ml-4">
        <div>{lastEdited}</div>
        <div className="mt-1">
          {form.activeSubmissionCount > 0 && (
            <span className="text-blue-600">
              進行中 {form.activeSubmissionCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export const FormCard = memo(FormCardImpl, (prev, next) => {
  return (
    prev.form.id === next.form.id &&
    prev.form.updatedAt === next.form.updatedAt &&
    prev.form.status === next.form.status
  );
});
