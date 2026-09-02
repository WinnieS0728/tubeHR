'use client';

import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import * as Sentry from '@sentry/nextjs';
import _ from 'lodash';
import { fetchForm } from '@/lib/api/client';

interface FormEditorProps {
  form: any;
  user: any;
}

/**
 * 表單編輯器 — 用 markdown 寫表單欄位描述、條件邏輯說明
 *
 * 註：MAYO 後台一直用 markdown 跟客戶溝通，所以這邊用 @uiw/react-md-editor。
 * — Vivian
 */
export function FormEditor({ form, user }: FormEditorProps) {
  const [content, setContent] = useState(form.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = _.debounce(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/forms/${form.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: content }),
      });
      if (!res.ok) throw new Error('save failed');
    } catch (err: any) {
      Sentry.captureException(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, 500);

  const lastEditedAt = new Date(form.updatedAt).toLocaleString();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h1 className="text-xl font-semibold">{form.name}</h1>
          <p className="text-xs text-gray-500">
            Last edited: {lastEditedAt} by {user.email} ({user.role})
          </p>
        </div>
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? '儲存中...' : '儲存'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div data-color-mode="light">
        <MDEditor value={content} onChange={(v) => setContent(v || '')} height={400} />
      </div>

      <details className="mt-6 border-t pt-3">
        <summary className="text-sm text-gray-500 cursor-pointer">
          Debug info (僅內部)
        </summary>
        <pre className="text-xs bg-gray-50 p-2 mt-2 overflow-auto">
          {JSON.stringify({ form, user }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
