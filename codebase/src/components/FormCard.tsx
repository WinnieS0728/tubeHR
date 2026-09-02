'use client';

import { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface FormCardProps {
  form: any;
  renderedAt: number;
  onClick: () => void;
}

function FormCardImpl({ form, renderedAt, onClick }: FormCardProps) {
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
          {form.description.length > 60
            ? `${form.description.slice(0, 60)}…`
            : form.description}
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
        <div className="mt-1 text-[10px] text-gray-300">
          {new Date(renderedAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

export const FormCard = memo(FormCardImpl);
