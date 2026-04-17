'use client';

import { CaseViewForm } from '@/components/platform/CaseViewEditForm';

export default function ClientCaseDetailPage() {
  return (
    <div className="space-y-6">
      <CaseViewForm 
        editBase="/client/cases" 
        showEdit={false} 
        backLink="/client/cases" 
      />
    </div>
  );
}
