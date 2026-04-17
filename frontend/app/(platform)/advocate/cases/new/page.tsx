'use client';

import CaseAddForm from '@/components/platform/CaseAddForm';

export default function AdvocateCaseNewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Case</h1>
          <p className="text-sm text-gray-500 mt-1">Register a new matter and assign it to your team</p>
        </div>
      </div>
      
      <CaseAddForm />
    </div>
  );
}
