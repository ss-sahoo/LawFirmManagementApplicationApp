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
  Type,
  ChevronDown,
  Calendar,
  Sparkles,
  Check,
  Search
} from 'lucide-react';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';

const EVENT_TYPES = [
  { value: 'hearing', label: 'Court Hearing' },
  { value: 'meeting', label: 'Client Meeting' },
  { value: 'deadline', label: 'Statutory Deadline' },
  { value: 'task', label: 'Administrative Task' },
  { value: 'consultation', label: 'Legal Consultation' },
  { value: 'filing', label: 'Document Filing' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low Frequency' },
  { value: 'medium', label: 'Standard Priority' },
  { value: 'high', label: 'Critical Action' },
];

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: Date;
}

export default function CreateEventModal({ isOpen, onClose, onSuccess, selectedDate }: CreateEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilterType, setUserFilterType] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'hearing',
    priority: 'medium',
    start_datetime: '',
    end_datetime: '',
    location: '',
    court_name: '',
    case: '',
    assigned_to: [] as string[]
  });

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
      if (selectedDate) {
        const dateStr = selectedDate.toISOString().slice(0, 10);
        setFormData(prev => ({
          ...prev,
          start_datetime: `${dateStr}T09:00`,
          end_datetime: `${dateStr}T10:00`,
        }));
      }
    }
  }, [isOpen, selectedDate]);

  const fetchInitialData = async () => {
    try {
      const [casesRes, usersRes] = await Promise.all([
        customFetch(API.CASES.LIST),
        customFetch(API.USERS.LIST)
      ]);

      if (casesRes.ok) setCases((await casesRes.json()).results || []);
      if (usersRes.ok) setUsers((await usersRes.json()).results || []);
    } catch (err) {
      console.error("Failed to fetch initial data", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        start_datetime: new Date(formData.start_datetime).toISOString(),
        end_datetime: new Date(formData.end_datetime).toISOString(),
        case: formData.case || null,
      };

      const response = await customFetch(API.CALENDAR.EVENTS, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setFormData({
          title: '',
          description: '',
          event_type: 'hearing',
          priority: 'medium',
          start_datetime: '',
          end_datetime: '',
          location: '',
          court_name: '',
          case: '',
          assigned_to: []
        });
      } else {
        const data = await response.json();
        setError(data.message || "Failed to create event. Please verify all fields.");
      }
    } catch (err) {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
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
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30, x: '-50%' }}
        animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, scale: 0.9, y: 30, x: '-50%' }}
        style={{ left: '50%', top: '5%' }}
        className="fixed w-full max-w-4xl bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.25)] z-[101] overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
      >
        {/* Luxury Header */}
        <div className="px-12 py-10 bg-[#0f172a] text-white relative flex items-center justify-between shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-3 text-orange-500 font-black tracking-[0.3em] text-[10px] uppercase">
              <Sparkles className="w-4 h-4" /> Professional Scheduler
            </div>
            <h2 className="text-4xl font-black tracking-tight">Create Firm Event</h2>
          </div>
          <button
            onClick={onClose}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
          >
            <X className="w-6 h-6 text-white/50 group-hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-12 overflow-y-auto custom-scrollbar bg-white flex-1 flex flex-col gap-10">
          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600 text-sm font-black">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-x-12 gap-y-10">
            {/* Title */}
            <div className="col-span-2 space-y-4">
              <label className="text-[10px] font-black text-gray-800 uppercase tracking-[0.3em] flex items-center gap-3 px-1">
                <Type className="w-4 h-4 text-orange-600" /> Event Title
              </label>
              <input
                required
                type="text"
                placeholder="Enter a descriptive title for this event..."
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-8 py-6 bg-gray-50 border border-gray-800 rounded-[2rem] focus:ring-4 focus:ring-orange-500/10 focus:bg-white focus:border-orange-500/30 transition-all outline-none text-xl font-black placeholder:text-gray-300 text-black"
              />
            </div>

            {/* Event Type & Priority */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 px-1">
                <Briefcase className="w-4 h-4 text-orange-600" /> Categorization
              </label>
              <div className="relative group">
                <select
                  value={formData.event_type}
                  onChange={e => setFormData(prev => ({ ...prev, event_type: e.target.value }))}
                  className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-orange-500/10 outline-none appearance-none text-lg font-black shrink-0 text-black cursor-pointer"
                >
                  {EVENT_TYPES.map(type => (
                    <option key={type.value} value={type.value} className="font-bold">{type.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-5 h-5 text-gray-400 absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-orange-500 transition-colors" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 px-1">
                <AlertCircle className="w-4 h-4 text-orange-600" /> Priority Level
              </label>
              <div className="relative group">
                <select
                  value={formData.priority}
                  onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-orange-500/10 outline-none appearance-none text-lg font-black text-black cursor-pointer"
                >
                  {PRIORITIES.map(p => (
                    <option key={p.value} value={p.value} className="font-bold">{p.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-5 h-5 text-gray-400 absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-orange-500 transition-colors" />
              </div>
            </div>

            {/* Datetime Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 px-1">
                <Clock className="w-4 h-4 text-orange-600" /> Start Timeline
              </label>
              <input
                required
                type="datetime-local"
                value={formData.start_datetime}
                onChange={e => setFormData(prev => ({ ...prev, start_datetime: e.target.value }))}
                className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-orange-500/10 outline-none text-lg font-black text-black [color-scheme:light]"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 px-1">
                <Clock className="w-4 h-4 text-orange-600" /> End Timeline
              </label>
              <input
                required
                type="datetime-local"
                value={formData.end_datetime}
                onChange={e => setFormData(prev => ({ ...prev, end_datetime: e.target.value }))}
                className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-orange-500/10 outline-none text-lg font-black text-black [color-scheme:light]"
              />
            </div>

            {/* Location & Court */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 px-1">
                <MapPin className="w-4 h-4 text-orange-600" /> Physical Venue
              </label>
              <input
                type="text"
                placeholder="e.g. Room 5, Building B"
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-orange-500/10 outline-none text-lg font-black text-black placeholder:text-gray-300"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 px-1">
                <Scale className="w-4 h-4 text-orange-600" /> Jurisdiction / Court
              </label>
              <input
                type="text"
                placeholder="e.g. Supreme Court of Justice"
                value={formData.court_name}
                onChange={e => setFormData(prev => ({ ...prev, court_name: e.target.value }))}
                className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-orange-500/10 outline-none text-lg font-black text-black placeholder:text-gray-300"
              />
            </div>

            {/* Case & Assignment */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 px-1">
                <Briefcase className="w-4 h-4 text-orange-600" /> Associated Matter
              </label>
              <div className="relative group">
                <select
                  value={formData.case}
                  onChange={e => setFormData(prev => ({ ...prev, case: e.target.value }))}
                  className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-orange-500/10 outline-none appearance-none text-lg font-black text-black cursor-pointer"
                >
                  <option value="" className="font-bold italic">Select a Case (Optional)</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id} className="font-bold">{c.case_title || c.title || c.id}</option>
                  ))}
                </select>
                <ChevronDown className="w-5 h-5 text-gray-400 absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-orange-500 transition-colors" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 px-1">
                <User className="w-4 h-4 text-orange-600" /> Resource Assignment
              </label>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-2">
                <div className="flex-[1] focus-within:flex-[2] transition-all duration-500 relative group">
                  <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Search personnel by name..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-black"
                  />
                </div>
                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-1 shrink-0">
                  {['all', 'admin', 'advocate'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUserFilterType(type)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        userFilterType === type 
                          ? 'bg-white text-gray-900 shadow-sm shadow-gray-200' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] p-4 flex flex-col gap-2 min-h-[200px] max-h-[300px] overflow-y-auto custom-scrollbar">
                {users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 text-gray-300 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Loading Personnel...</p>
                  </div>
                ) : (() => {
                  const filteredUsers = users.filter(u => {
                    const matchesSearch = `${u.first_name} ${u.last_name}`.toLowerCase().includes(userSearchTerm.toLowerCase());
                    const matchesType = userFilterType === 'all' || u.user_type === userFilterType;
                    return matchesSearch && matchesType;
                  });

                  if (filteredUsers.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center p-10 text-gray-300 animate-in fade-in zoom-in-95">
                        <Search className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No matching personnel found</p>
                      </div>
                    );
                  }

                  return filteredUsers.map((u, uIdx) => {
                    const isSelected = formData.assigned_to.includes(u.id);
                    return (
                      <div 
                        key={u.id || `user-${uIdx}`}
                        onClick={() => {
                          const newSelection = isSelected 
                            ? formData.assigned_to.filter(id => id !== u.id)
                            : [...formData.assigned_to, u.id];
                          setFormData(prev => ({ ...prev, assigned_to: newSelection }));
                        }}
                        className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                            : 'bg-white border-gray-100 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                             isSelected ? 'bg-white/20' : 'bg-gray-100 text-gray-400'
                           }`}>
                             {u.first_name[0]}{u.last_name[0]}
                           </div>
                           <div>
                              <p className="font-bold text-sm leading-none mb-1">{u.first_name} {u.last_name}</p>
                              <p className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
                                {u.user_type}
                              </p>
                           </div>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-white" />}
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="flex justify-between items-center px-4">
                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Select one or more team members</p>
                <div className="flex items-center gap-2">
                   <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">
                    {formData.assigned_to.length} Selected
                   </p>
                   {formData.assigned_to.length > 0 && (
                     <button 
                       type="button"
                       onClick={() => setFormData(prev => ({ ...prev, assigned_to: [] }))}
                       className="text-[10px] text-red-500 font-black uppercase tracking-widest hover:underline"
                     >
                       Clear All
                     </button>
                   )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="col-span-2 space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 px-1">
                <AlignLeft className="w-4 h-4 text-orange-600" /> Tactical Description
              </label>
              <textarea
                rows={4}
                placeholder="Detail the objectives and agenda for this event..."
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[3rem] focus:ring-4 focus:ring-orange-500/10 outline-none resize-none text-lg font-black text-black placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Luxury Action Toolbar */}
          <div className="mt-6 flex items-center gap-8 py-10 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-10 py-6 border border-gray-100 rounded-[2rem] font-black text-gray-400 uppercase tracking-[0.2em] hover:bg-gray-50 hover:text-gray-600 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] px-10 py-6 bg-[#0f172a] hover:bg-black text-white rounded-[2.5rem] font-black text-lg uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(15,23,42,0.3)] hover:shadow-[0_25px_60px_rgba(15,23,42,0.4)] transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Initialize Event
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <ChevronDown className="w-6 h-6 -rotate-90 text-orange-500" />
                  </motion.div>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
