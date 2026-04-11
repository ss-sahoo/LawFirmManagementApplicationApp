import { UserDetailPage } from '@/components/platform/page-templates';

export default async function PlatformOwnerSuperAdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetailPage accent="#0e2340" userId={id} />;
}
