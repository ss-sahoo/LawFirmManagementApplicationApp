import { UserDetailPage } from '@/components/platform/page-templates';

export default async function PlatformOwnerPartnerDetailPage({ params }: { params: Promise<{ partnerId: string }> }) {
  const { partnerId } = await params;
  return <UserDetailPage accent="#0e2340" userId={partnerId} />;
}
