'use client';

import { useState, useEffect } from 'react';
import ProfessionalBillingHub from '@/components/platform/ProfessionalBillingHub';

export default function FirmAdminBillingPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <ProfessionalBillingHub 
        role="admin" 
        isLoading={loading} 
      />
    </div>
  );
}
