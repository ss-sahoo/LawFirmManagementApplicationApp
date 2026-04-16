'use client';

import CaseAddForm from '@/components/platform/CaseAddForm';
import { useTopbarTitle } from '@/components/platform/TopbarContext';

export default function AddCasePage() {
  useTopbarTitle('Register New Matter', 'Assign legal classification, personnel, and branch allocation.');

  return (
    <div className="space-y-6">
      <CaseAddForm />
    </div>
  );
}
