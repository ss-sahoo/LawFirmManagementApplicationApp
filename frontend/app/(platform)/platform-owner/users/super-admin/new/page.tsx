import { TeamMemberFormPage } from '@/components/platform/page-templates';

export default function PlatformOwnerNewSuperAdminPage() {
  return (
    <TeamMemberFormPage
      accent="#0e2340"
      fixedRole="super_admin"
      title="Add Firm Owner"
      description="Create a new Super Admin (Firm Owner) to manage a legal practice."
    />
  );
}
