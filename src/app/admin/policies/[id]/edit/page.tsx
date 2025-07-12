// src/app/admin/policies/[id]/edit/page.tsx

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { notFound } from 'next/navigation';
import { Policy } from '@/lib/definitions';
import EditPolicyForm from './EditPolicyForm'; // สร้าง Form Component แยกออกมา

export const dynamic = 'force-dynamic';

export default async function EditPolicyPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
      },
    }
  );

  const { data: policy, error } = await supabase
    .from('policies')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !policy) {
    notFound();
  }

  return <EditPolicyForm policy={policy as Policy} />;
}
