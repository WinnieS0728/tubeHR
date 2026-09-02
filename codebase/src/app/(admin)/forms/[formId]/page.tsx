import { cookies } from 'next/headers';
import { FormEditor } from '@/components/FormEditor';
import { ApprovalPanel } from './ApprovalPanel';

interface PageProps {
  params: { formId: string };
}

async function getForm(formId: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE!;
  const res = await fetch(`${apiBase}/api/forms/${formId}`, {
    cache: 'no-store',
  });
  return res.json();
}

async function getSession() {
  return {
    user: {
      id: 'u-1',
      email: 'demo.user@tubehr.dev',
      role: 'admin',
      tenantId: 't-1',
      permissions: ['form.read', 'form.write', 'approval.manage'],
      lastLoginAt: '2026-05-30T10:00:00Z',
      profile: {
        name: 'Demo User',
        avatarUrl: null,
        phone: '+886-912-345-678',
      },
    },
  };
}

export default async function FormEditPage({ params }: PageProps) {
  const session = await getSession();
  const form = await getForm(params.formId);

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <FormEditor form={form} user={session.user} />
      </div>
      <div>
        <ApprovalPanel formId={params.formId} />
      </div>
    </div>
  );
}
