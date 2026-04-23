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
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[100]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
        exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
        className="fixed left-1/2 top-1/2 w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[95vh]"
      >
        {loading ? (
          <div className="p-32 flex flex-col items-center justify-center gap-6 text-gray-400">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="font-bold tracking-widest text-xs uppercase text-gray-400">Fetching Registry Data...</p>
          </div>
        ) : error || !event ? (
          <div className="p-20 text-center space-y-8">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Connection Failed</h3>
              <p className="text-gray-500">{error || "The event record could not be loaded."}</p>
            </div>
            <button onClick={onClose} className="px-8 py-3 bg-gray-900 text-white rounded-[1.2rem] font-bold shadow-xl">Close Dashboard</button>
          </div>
        ) : (
          <>
            <div className="px-10 py-10 bg-[#0f172a] text-white flex justify-between items-start shrink-0 relative">
              <div className="space-y-3 relative z-10 flex-1">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    event.priority === 'high' ? 'bg-red-500 border-red-500' : 
                    event.priority === 'medium' ? 'bg-amber-500/20 border-amber-500/30 text-amber-500' :
                    'bg-white/10 border-white/20 text-white/60'
                  }`}>
                    {event.priority} Priority
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    event.status === 'scheduled' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
                    event.status === 'completed' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                    'bg-red-500/20 border-red-500/30 text-red-400'
                  }`}>
                    {event.status}
                  </span>
                </div>
                {isEditing ? (
                  <input 
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className="text-3xl font-bold bg-white/10 border border-white/20 rounded-[1rem] px-5 py-2 w-full outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                ) : (
                  <h2 className="text-4xl font-bold tracking-tight">{event.title}</h2>
                )}
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2 font-bold">
                  <User className="w-3 h-3" /> Managed By: {event.created_by_name}
                </p>
              </div>
              <div className="flex items-center gap-3 relative z-10 ml-6">
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                    <Edit3 className="w-5 h-5" />
                  </button>
                )}
                <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar bg-white flex-1">
              {isEditing ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3 font-bold">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Start Time</label>
                      <input 
                        type="datetime-local"
                        value={editData.start_datetime}
                        onChange={(e) => setEditData({...editData, start_datetime: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-3 font-bold">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">End Time</label>
                      <input 
                        type="datetime-local"
                        value={editData.end_datetime}
                        onChange={(e) => setEditData({...editData, end_datetime: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-3 font-bold text-gray-800">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Court Name</label>
                    <input type="text" value={editData.court_name} onChange={(e) => setEditData({...editData, court_name: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-3 font-bold text-gray-800">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Location</label>
                    <input type="text" value={editData.location} onChange={(e) => setEditData({...editData, location: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-3 font-bold text-gray-800">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Notes</label>
                    <textarea rows={4} value={editData.notes} onChange={(e) => setEditData({...editData, notes: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={handleUpdate} disabled={actionLoading} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center gap-2">
                      {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Save Changes</>}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-[1.5rem] flex items-center gap-4">
                      <Calendar className="w-8 h-8 text-blue-600 opacity-40 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none mb-1 font-bold">Schedule Date</p>
                        <p className="text-lg font-bold text-gray-900">{new Date(event.start_datetime).toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="p-6 bg-amber-50 border border-amber-100 rounded-[1.5rem] flex items-center gap-4">
                      <Clock className="w-8 h-8 text-amber-600 opacity-40 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none mb-1 font-bold">Time Window</p>
                        <p className="text-lg font-bold text-gray-900">
                          {new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="mx-2 text-amber-200">—</span>
                          {new Date(event.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-4 font-bold">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Scale className="w-4 h-4" /> Court / Venue
                        </p>
                        <p className="text-gray-900 font-bold px-1">{event.court_name || 'Not Specified'}</p>
                      </div>
                      <div className="space-y-4 font-bold">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Exact Location
                        </p>
                        <p className="text-gray-900 font-bold px-1">{event.location || 'Not Specified'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-4 font-bold">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Bell className="w-4 h-4" /> Reminder Set
                        </p>
                        <p className="text-gray-900 font-bold px-1">{event.reminder_time ? new Date(event.reminder_time).toLocaleString() : 'No Reminder Active'}</p>
                      </div>
                      <div className="space-y-4 font-bold">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <History className="w-4 h-4" /> Last Synchronized
                        </p>
                        <p className="text-gray-900 font-bold px-1">{new Date(event.updated_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>

                  {event.case_title && (
                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Briefcase className="w-6 h-6" /></div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-0.5">Associated Case Registry</p>
                          <h4 className="text-xl font-bold text-gray-900">{event.case_title} <span className="text-gray-400 font-medium">({event.case_number})</span></h4>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-gray-600" />
                    </div>
                  )}

                  <div className="space-y-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 font-bold">Assigned Personnel Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {event.assigned_to_details?.map((u: any) => (
                        <div key={u.id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">{u.first_name[0]}{u.last_name[0]}</div>
                            <div>
                              <p className="font-bold text-gray-900 leading-none">{u.first_name} {u.last_name}</p>
                              <span className="text-[10px] font-black uppercase text-blue-500/60 tracking-wider font-bold">{u.user_type}</span>
                            </div>
                          </div>
                          <div className="space-y-1.5 pt-1">
                             <div className="flex items-center gap-2 text-xs text-gray-500 font-medium font-bold"><Mail className="w-3.5 h-3.5" /> {u.email}</div>
                             <div className="flex items-center gap-2 text-xs text-gray-500 font-medium font-bold"><Phone className="w-3.5 h-3.5" /> {u.phone_number}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                    {event.description && <div className="space-y-4"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 font-bold"><AlignLeft className="w-4 h-4" /> Event Description</p><p className="text-sm font-medium text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 font-bold">{event.description}</p></div>}
                    {event.notes && <div className="space-y-4"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 font-bold"><StickyNote className="w-4 h-4" /> Tactical Notes</p><p className="text-sm font-medium text-gray-600 leading-relaxed bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 font-bold">{event.notes}</p></div>}
                  </div>
                </>
              )}
            </div>

            {!isEditing && (
              <div className="px-10 py-10 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <button onClick={() => handleAction('delete')} disabled={actionLoading} className="flex items-center gap-2 px-6 py-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-bold transition-all"><Trash2 className="w-5 h-5" /><span>Delete Event</span></button>
                  <button onClick={() => handleAction('cancel')} disabled={actionLoading || event.status === 'cancelled'} className="px-6 py-4 text-gray-400 hover:text-gray-900 font-bold transition-all">Cancel Action</button>
                </div>
                <button onClick={() => handleAction('complete')} disabled={actionLoading || event.status === 'completed'} className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 transition-all active:scale-95 disabled:bg-emerald-200">
                  {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> Finalize & Complete</>}
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
