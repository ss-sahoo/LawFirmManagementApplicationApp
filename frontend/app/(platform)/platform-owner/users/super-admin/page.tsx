import { TeamPage } from '@/components/platform/page-templates';

export default function PlatformOwnerSuperAdminUserPage() {
  return (
    <TeamPage
      accent="#0e2340"
      role="super_admin"
      viewBase="/platform-owner/users/super-admin"
    />
  );
}
