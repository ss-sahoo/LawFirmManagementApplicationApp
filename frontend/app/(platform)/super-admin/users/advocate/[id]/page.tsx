import { UserDetailPage } from '@/components/platform/page-templates';

export default async function SuperAdminAdvocateUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetailPage accent="#0284c7" userId={id} />;
}
