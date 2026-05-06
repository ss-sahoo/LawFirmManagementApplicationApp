'use client';

import { useState, useEffect, useCallback } from 'react';
import ProfessionalCalendar from '@/components/platform/ProfessionalCalendar';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';
import {
  AlertCircle, X, Loader2, Calendar, Clock, MapPin,
  User, FileText, ChevronDown,
} from 'lucide-react';

const EVENT_TYPES = [
  { value: 'hearing', label: 'Court Hearing' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'task', label: 'Task' },
  { value: 'consultation', label: 'Client Consultation' },
  { value: 'filing', label: 'Document Filing' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

function toLocalDateTimeValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AdvocateCalendarPage() {
  const { events, loading, error, setCurrentDate, setView, refresh } = useCalendarEvents();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  const defaultStart = () => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    return toLocalDateTimeValue(d);
  };
  const defaultEnd = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return toLocalDateTimeValue(d);
  };

  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: 'meeting',
    priority: 'medium',
    start_datetime: defaultStart(),
    end_datetime: defaultEnd(),
    all_day: false,
    location: '',
    court_name: '',
    notes: '',
    client: '' as string,
  });

  const fetchClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      const res = await customFetch(API.CLIENTS.MY_CLIENTS);
      if (res.ok) {
        const data = await res.json();
        setClients(Array.isArray(data) ? data : (data.results || []));
      }
    } finally {
      setClientsLoading(false);
    }
  }, []);

  const openModal = (date?: Date) => {
    const start = date ? (() => {
      const d = new Date(date);
      d.setHours(9, 0, 0, 0);
      return toLocalDateTimeValue(d);
    })() : defaultStart();
    const end = date ? (() => {
      const d = new Date(date);
      d.setHours(10, 0, 0, 0);
      return toLocalDateTimeValue(d);
    })() : defaultEnd();

    setForm(f => ({ ...f, start_datetime: start, end_datetime: end, title: '', description: '', location: '', court_name: '', notes: '', client: '' }));
    setSaveError(null);
    setShowModal(true);
    fetchClients();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const payload: any = {
        title: form.title,
        description: form.description,
        event_type: form.event_type,
        priority: form.priority,
        start_datetime: new Date(form.start_datetime).toISOString(),
        end_datetime: new Date(form.end_datetime).toISOString(),
        all_day: form.all_day,
        location: form.location,
        court_name: form.court_name,
        notes: form.notes,
      };
      if (form.client) payload.client = form.client;

      const res = await customFetch(API.CALENDAR.EVENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        refresh();
      } else {
        const err = await res.json();
        setSaveError(err.detail || JSON.stringify(err));
      }
    } catch (err: any) {
      setSaveError(err.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-3xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <ProfessionalCalendar
        events={events}
        isLoading={loading}
        role="advocate"
        onDateChange={setCurrentDate}
        onViewChange={setView}
        onAddEvent={(date) => openModal(date)}
      />

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">New Event</h2>
                  <p className="text-xs text-gray-400 font-medium">Add to your calendar</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {saveError && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700 font-medium">
                  {saveError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title" value={form.title} onChange={handleChange} required
                  placeholder="e.g. Client Consultation, Court Hearing..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400"
                />
              </div>

              {/* Type + Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
                  <div className="relative">
                    <select name="event_type" value={form.event_type} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 appearance-none bg-white">
                      {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Priority</label>
                  <div className="relative">
                    <select name="priority" value={form.priority} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 appearance-none bg-white">
                      {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Start + End datetime */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    <Clock className="w-3 h-3 inline mr-1" />Start
                  </label>
                  <input type="datetime-local" name="start_datetime" value={form.start_datetime} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    <Clock className="w-3 h-3 inline mr-1" />End
                  </label>
                  <input type="datetime-local" name="end_datetime" value={form.end_datetime} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* All day toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-10 h-6 rounded-full transition-colors ${form.all_day ? 'bg-blue-600' : 'bg-gray-200'}`}
                  onClick={() => setForm(f => ({ ...f, all_day: !f.all_day }))}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm mt-0.5 transition-transform ${form.all_day ? 'translate-x-4.5 ml-4.5' : 'ml-0.5'}`} style={{ transform: form.all_day ? 'translateX(18px)' : 'translateX(2px)' }} />
                </div>
                <span className="text-sm font-semibold text-gray-700">All day event</span>
              </label>

              {/* Client */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  <User className="w-3 h-3 inline mr-1" />Link to Client (optional)
                </label>
                <div className="relative">
                  <select name="client" value={form.client} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 appearance-none bg-white">
                    <option value="">— No client —</option>
                    {clientsLoading
                      ? <option disabled>Loading clients...</option>
                      : clients.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.first_name} {c.last_name}
                          </option>
                        ))
                    }
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  <MapPin className="w-3 h-3 inline mr-1" />Location
                </label>
                <input name="location" value={form.location} onChange={handleChange}
                  placeholder="e.g. District Court, Room 3..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 placeholder:text-gray-400" />
              </div>

              {/* Court name (shown for hearing/filing) */}
              {(form.event_type === 'hearing' || form.event_type === 'filing') && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Court Name</label>
                  <input name="court_name" value={form.court_name} onChange={handleChange}
                    placeholder="e.g. High Court of Delhi..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 placeholder:text-gray-400" />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  <FileText className="w-3 h-3 inline mr-1" />Description
                </label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                  placeholder="Brief description of the event..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 resize-none placeholder:text-gray-400" />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                  placeholder="Internal notes..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 resize-none placeholder:text-gray-400" />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
