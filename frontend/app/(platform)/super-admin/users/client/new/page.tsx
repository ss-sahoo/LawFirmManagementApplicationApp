import { TeamMemberFormPage } from '@/components/platform/page-templates';

export default function SuperAdminNewClientPage() {
  return (
    <TeamMemberFormPage
      accent="#6366f1"
      fixedRole="client"
      title="Register Client"
      description="Add a new client to the system to track their matters and billing."
    />
  );
}
