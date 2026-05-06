import { CalendarEvent } from '@/components/platform/mock-data';

export interface ApiCalendarEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'hearing' | 'meeting' | 'deadline' | 'task' | 'consultation' | 'filing' | 'other';
  priority: 'low' | 'medium' | 'high';
  start_datetime: string;
  end_datetime: string;
  location?: string;
  court_name?: string;
  case?: string;
  case_title?: string;
  case_number?: string;
  assigned_to?: string[];
  status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  created_by_name?: string;
}

export const mapApiEventToCalendarEvent = (apiEvent: ApiCalendarEvent): CalendarEvent => {
  // Parse date from the ISO string without timezone shift
  // e.g. "2026-05-06T10:00:00Z" → use the date part directly
  const dtStr = apiEvent.start_datetime;
  let startDate: Date;
  if (dtStr) {
    // Extract YYYY-MM-DD and HH:MM from the string to avoid UTC→local shift
    const [datePart, timePart] = dtStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = (timePart || '00:00').split(':').map(Number);
    startDate = new Date(year, month - 1, day, hour, minute);
  } else {
    startDate = new Date();
  }

  const timeStr = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return {
    id: apiEvent.id,
    title: apiEvent.title,
    date: startDate,
    time: timeStr,
    type: apiEvent.event_type as any,
    caseNumber: apiEvent.case_number || apiEvent.court_name || '',
    clientName: apiEvent.case_title || '',
    adminName: apiEvent.created_by_name || 'Admin',
    role: apiEvent.event_type.charAt(0).toUpperCase() + apiEvent.event_type.slice(1),
  };
};
