'use client';

import { useState } from 'react';
import ProfessionalCalendar from '@/components/platform/ProfessionalCalendar';
import CreateEventModal from '@/components/platform/CreateEventModal';
import EventDetailsModal from '@/components/platform/EventDetailsModal';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { AlertCircle } from 'lucide-react';

export default function PlatformOwnerCalendarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const { 
    events, 
    loading, 
    error, 
    setCurrentDate, 
    setView,
    refresh
  } = useCalendarEvents();

  const handleAddEvent = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleEventClick = (id: string) => {
    setSelectedEventId(id);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-3xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}
      
      <ProfessionalCalendar 
        events={events} 
        isLoading={loading} 
        role="platform-owner" 
        onDateChange={setCurrentDate}
        onViewChange={setView}
        onAddEvent={handleAddEvent}
        onEventClick={handleEventClick}
      />

      <CreateEventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refresh}
        selectedDate={selectedDate}
        role="platform-owner"
      />

      <EventDetailsModal 
        eventId={selectedEventId}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedEventId(null);
        }}
        onRefresh={refresh}
      />
    </div>
  );
}
