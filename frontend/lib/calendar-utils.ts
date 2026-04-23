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
  const startDate = new Date(apiEvent.start_datetime);
  
  // Format time as "10:30 AM" for better precision
  const timeStr = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Map event_type to UI styles
  // We use the raw event_type string now as ProfessionalCalendar handles them
  const uiType = apiEvent.event_type as any;

  return {
    id: apiEvent.id,
    title: apiEvent.title,
    date: startDate,
    time: timeStr,
    type: uiType,
    caseNumber: apiEvent.case_number || apiEvent.court_name || '',
    clientName: apiEvent.case_title || '', 
    adminName: apiEvent.created_by_name || 'Admin',
    role: apiEvent.event_type.charAt(0).toUpperCase() + apiEvent.event_type.slice(1)
  };
};
