import { UserDetailPage } from '@/components/platform/page-templates';

export default async function SuperAdminAdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetailPage accent="#984c1f" userId={id} />;
}
