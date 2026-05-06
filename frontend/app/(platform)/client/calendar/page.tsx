'use client';

import ProfessionalCalendar from '@/components/platform/ProfessionalCalendar';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { AlertCircle } from 'lucide-react';

export default function ClientCalendarPage() {
  const { events, loading, error, setCurrentDate, setView } = useCalendarEvents();

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-3xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}
      {/* Client is read-only — no onAddEvent prop passed, so Add Event button is hidden */}
      <ProfessionalCalendar
        events={events}
        isLoading={loading}
        role="client"
        onDateChange={setCurrentDate}
        onViewChange={setView}
      />
    </div>
  );
}
