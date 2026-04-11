import { TeamMemberFormPage } from '@/components/platform/page-templates';

export default function SuperAdminNewAdvocatePage() {
  return (
    <TeamMemberFormPage
      accent="#0284c7"
      fixedRole="advocate"
      title="Add Advocate"
      description="Register a new legal professional to manage cases and documents."
    />
  );
}
