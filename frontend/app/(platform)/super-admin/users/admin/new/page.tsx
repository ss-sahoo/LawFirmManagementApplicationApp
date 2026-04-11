import { TeamMemberFormPage } from '@/components/platform/page-templates';

export default function SuperAdminNewAdminPage() {
  return (
    <TeamMemberFormPage
      accent="#984c1f"
      fixedRole="admin"
      title="Add Firm Admin"
      description="Create a new administrator for your firm with full operational access."
    />
  );
}
