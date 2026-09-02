import { ReactNode } from 'react';

export default function FormsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <nav className="mb-6 flex items-center gap-4 text-sm">
        <a href="/forms" className="font-medium">表單管理</a>
        <a href="/approvals" className="text-gray-500 hover:text-gray-900">簽核管理</a>
        <a href="/settings" className="text-gray-500 hover:text-gray-900">設定</a>
      </nav>
      {children}
    </div>
  );
}
