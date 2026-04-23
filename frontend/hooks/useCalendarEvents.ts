import { useState, useEffect, useCallback } from 'react';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';
import { mapApiEventToCalendarEvent, ApiCalendarEvent } from '@/lib/calendar-utils';

export function useCalendarEvents(initialDate: Date = new Date(2026, 3, 22), initialView: 'day' | 'week' | 'month' = 'month') {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState(initialView);

  const fetchEvents = useCallback(async (date: Date, currentView: 'day' | 'week' | 'month') => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '';
      if (currentView === 'month') {
        endpoint = API.CALENDAR.MONTH_VIEW(date.getFullYear(), date.getMonth() + 1);
      } else if (currentView === 'week') {
        endpoint = API.CALENDAR.WEEK_VIEW;
      } else if (currentView === 'day') {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        endpoint = API.CALENDAR.DAY_VIEW(`${year}-${month}-${day}`);
      }

      const response = await customFetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        const apiEvents: ApiCalendarEvent[] = Array.isArray(data) 
          ? data 
          : (data.events || data.results || []);
        setEvents(apiEvents.map(mapApiEventToCalendarEvent));
      } else {
        throw new Error('Failed to fetch calendar events');
      }
    } catch (err: any) {
      console.error('Calendar Fetch Error:', err);
      setError('Connection to calendar service lost. Displaying offline data if available.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(currentDate, view);
  }, [fetchEvents, currentDate, view]);

  return {
    events,
    loading,
    error,
    currentDate,
    setCurrentDate,
    view,
    setView,
    refresh: () => fetchEvents(currentDate, view)
  };
}
