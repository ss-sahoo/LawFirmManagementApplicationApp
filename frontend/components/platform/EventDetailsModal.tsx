'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Clock, 
  AlignLeft, 
  Scale, 
  User, 
  Briefcase,
  AlertCircle,
  Loader2,
  Trash2,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Edit3,
  Check,
  ChevronRight,
  Phone,
  Mail,
  Bell,
  StickyNote,
  History
} from 'lucide-react';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';

interface EventDetailsModalProps {
  eventId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function EventDetailsModal({ eventId, isOpen, onClose, onRefresh }: EventDetailsModalProps) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    start_datetime: '',
    end_datetime: '',
    location: '',
    court_name: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen && eventId) {
      fetchEventDetails();
    } else {
      setIsEditing(false);
    }
  }, [isOpen, eventId]);

  useEffect(() => {
    if (event) {
      setEditData({
        title: event.title || '',
        start_datetime: event.start_datetime ? new Date(event.start_datetime).toISOString().slice(0, 16) : '',
        end_datetime: event.end_datetime ? new Date(event.end_datetime).toISOString().slice(0, 16) : '',
        location: event.location || '',
        court_name: event.court_name || '',
        notes: event.notes || '',
      });
    }
  }, [event]);

  const fetchEventDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customFetch(API.CALENDAR.DETAIL(eventId!));
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        setError("Failed to load event details.");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setActionLoading(true);
    try {
      const payload = {
        title: editData.title,
        start_datetime: new Date(editData.start_datetime).toISOString(),
        end_datetime: new Date(editData.end_datetime).toISOString(),
        location: editData.location,
        court_name: editData.court_name,
        notes: editData.notes,
        status: 'rescheduled'
      };

      const response = await customFetch(API.CALENDAR.DETAIL(eventId!), {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchEventDetails();
        onRefresh();
      } else {
        alert("Failed to update event.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (action: 'complete' | 'cancel' | 'delete') => {
    if (action === 'delete' && !confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    
    setActionLoading(true);
    try {
      let endpoint = '';
      let method = 'POST';
      
      if (action === 'complete') endpoint = API.CALENDAR.MARK_COMPLETED(eventId!);
      else if (action === 'cancel') endpoint = API.CALENDAR.CANCEL(eventId!);
      else if (action === 'delete') {
        endpoint = API.CALENDAR.DETAIL(eventId!);
        method = 'DELETE';
      }

      const response = await customFetch(endpoint, { method });
      if (response.ok) {
        onRefresh();
        onClose();
      } else {
        const data = await response.json();
        alert(data.message || "Action failed.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
        exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
        className="fixed left-1/2 top-1/2 w-full max-w-2xl bg-white rounded-[10px] shadow-xl z-[101] overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
      >
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">Loading event details...</p>
          </div>
        ) : error || !event ? (
          <div className="p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-slate-900">Connection Failed</h3>
              <p className="text-sm text-slate-500">{error || "The event record could not be loaded."}</p>
            </div>
            <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white rounded-[8px] font-medium text-sm hover:bg-slate-800 transition-all">Close</button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                {isEditing ? (
                  <h2 className="text-xl font-medium text-slate-900 tracking-tight">Edit Event</h2>
                ) : (
                  <h2 className="text-xl font-medium text-slate-900 tracking-tight truncate max-w-[300px]" title={event.title}>{event.title}</h2>
                )}
                
                {!isEditing && (
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold uppercase tracking-wider ${
                      event.priority === 'high' ? 'bg-red-50 text-red-600' : 
                      event.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {event.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold uppercase tracking-wider ${
                      event.status === 'scheduled' ? 'bg-blue-50 text-blue-600' :
                      event.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-blue-600" title="Edit Event">
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-slate-600" title="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar bg-slate-50/30 flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2">Event Title</label>
                    <input 
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 mb-2">Start Time</label>
                      <input 
                        type="datetime-local"
                        value={editData.start_datetime}
                        onChange={(e) => setEditData({...editData, start_datetime: e.target.value})}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all [color-scheme:light]"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 mb-2">End Time</label>
                      <input 
                        type="datetime-local"
                        value={editData.end_datetime}
                        onChange={(e) => setEditData({...editData, end_datetime: e.target.value})}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all [color-scheme:light]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2">Court / Venue</label>
                    <input type="text" value={editData.court_name} onChange={(e) => setEditData({...editData, court_name: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400" placeholder="e.g. Supreme Court" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2">Exact Location</label>
                    <input type="text" value={editData.location} onChange={(e) => setEditData({...editData, location: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400" placeholder="e.g. Room 101" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2">Notes</label>
                    <textarea rows={3} value={editData.notes} onChange={(e) => setEditData({...editData, notes: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all resize-none placeholder:text-slate-400" placeholder="Add any tactical notes..." />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-white border border-slate-200 rounded-[8px] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Schedule Date</p>
                        <p className="text-sm font-semibold text-slate-900">{new Date(event.start_datetime).toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-[8px] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Time Window</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="mx-1 text-slate-400">—</span>
                          {new Date(event.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                        <Scale className="w-3.5 h-3.5" /> Court / Venue
                      </p>
                      <p className="text-[14px] text-slate-900 font-medium px-1">{event.court_name || 'Not Specified'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Exact Location
                      </p>
                      <p className="text-[14px] text-slate-900 font-medium px-1">{event.location || 'Not Specified'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                        <Bell className="w-3.5 h-3.5" /> Reminder Set
                      </p>
                      <p className="text-[14px] text-slate-900 font-medium px-1">{event.reminder_time ? new Date(event.reminder_time).toLocaleString() : 'No Reminder Active'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                        <History className="w-3.5 h-3.5" /> Last Synchronized
                      </p>
                      <p className="text-[14px] text-slate-900 font-medium px-1">{new Date(event.updated_at).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  {event.case_title && (
                    <div className="p-4 bg-white border border-slate-200 rounded-[8px] flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                          <Briefcase className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Associated Case Registry</p>
                          <h4 className="text-sm font-semibold text-slate-900">{event.case_title} <span className="text-slate-400 font-normal">({event.case_number})</span></h4>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Assigned Personnel Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {event.assigned_to_details?.map((u: any) => (
                        <div key={u.id} className="p-3 bg-white border border-slate-200 rounded-[8px] flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-medium text-xs shrink-0">
                            {u.first_name[0]}{u.last_name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-slate-900 truncate">{u.first_name} {u.last_name}</p>
                            <p className="text-[11px] text-slate-500 capitalize truncate">{u.user_type}</p>
                          </div>
                        </div>
                      ))}
                      {(!event.assigned_to_details || event.assigned_to_details.length === 0) && (
                        <p className="text-[13px] text-slate-500 px-1">No personnel assigned.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {event.description && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><AlignLeft className="w-3.5 h-3.5" /> Event Description</p>
                        <p className="text-[13px] text-slate-700 bg-white p-3 rounded-[8px] border border-slate-200">{event.description}</p>
                      </div>
                    )}
                    {event.notes && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><StickyNote className="w-3.5 h-3.5" /> Tactical Notes</p>
                        <p className="text-[13px] text-slate-700 bg-white p-3 rounded-[8px] border border-slate-200">{event.notes}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              {isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)} className="px-5 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-[8px] hover:bg-slate-50 transition-all">Cancel</button>
                  <button onClick={handleUpdate} disabled={actionLoading} className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-[8px] hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-70">
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Save Changes</>}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex gap-2">
                    <button onClick={() => handleAction('delete')} disabled={actionLoading} className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-[8px] transition-all flex items-center gap-2 disabled:opacity-70">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <button onClick={() => handleAction('cancel')} disabled={actionLoading || event.status === 'cancelled'} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-[8px] transition-all disabled:opacity-50">
                      Cancel Event
                    </button>
                  </div>
                  <button onClick={() => handleAction('complete')} disabled={actionLoading || event.status === 'completed'} className="px-5 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-[8px] shadow-sm transition-all flex items-center gap-2 disabled:opacity-50">
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Finalize</>}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
