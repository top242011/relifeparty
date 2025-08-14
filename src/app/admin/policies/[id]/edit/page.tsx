// src/app/admin/policies/[id]/edit/page.tsx

import { cookies } from 'next/headers';
import { createClient } from '../../../../../../utils/supabase/server';
import { notFound } from 'next/navigation';
import { Policy } from '@/lib/definitions';
import EditPolicyForm from './EditPolicyForm'; // สร้าง Form Component แยกออกมา

export const dynamic = 'force-dynamic';

export default async function EditPolicyPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  const supabase = createClient(cookies());

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
