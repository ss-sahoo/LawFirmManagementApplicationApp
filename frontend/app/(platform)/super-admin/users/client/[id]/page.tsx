import { UserDetailPage } from '@/components/platform/page-templates';

export default async function SuperAdminClientUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetailPage accent="#6366f1" userId={id} />;
}
