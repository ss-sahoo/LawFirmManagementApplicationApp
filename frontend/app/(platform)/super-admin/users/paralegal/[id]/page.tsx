import { UserDetailPage } from '@/components/platform/page-templates';

export default async function SuperAdminParalegalUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetailPage accent="#059669" userId={id} />;
}
