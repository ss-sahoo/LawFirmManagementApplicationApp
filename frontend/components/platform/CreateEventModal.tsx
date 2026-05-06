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
  role?: string;
}

export default function CreateEventModal({ isOpen, onClose, onSuccess, selectedDate, role }: CreateEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [firms, setFirms] = useState<any[]>([]);
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
    firm: '',
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
      const fetchPromises: Promise<any>[] = [
        customFetch(API.CASES.LIST).then(res => res.ok ? res.json() : null),
        customFetch(API.USERS.LIST).then(res => res.ok ? res.json() : null)
      ];
      
      if (role === 'platform-owner') {
        fetchPromises.push(customFetch(API.FIRMS.LIST).then(res => res.ok ? res.json() : null));
      }

      const [casesData, usersData, firmsData] = await Promise.all(fetchPromises);

      if (casesData) setCases(casesData.results || []);
      if (usersData) setUsers(usersData.results || []);
      if (firmsData) setFirms(firmsData.results || firmsData || []);
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
        ...(role === 'platform-owner' && formData.firm ? { firm: formData.firm } : {})
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
          firm: '',
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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10, x: '-50%' }}
        animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, scale: 0.95, y: 10, x: '-50%' }}
        style={{ left: '50%', top: '5%' }}
        className="fixed w-full max-w-3xl bg-white rounded-[10px] shadow-xl z-[101] overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-medium text-slate-900 tracking-tight">Create Firm Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar bg-slate-50/30 flex-1 flex flex-col gap-6">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-100 rounded-[8px] flex items-center gap-3 text-red-600 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
            {/* Title */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Event Title*</label>
              <input
                required
                type="text"
                placeholder="Enter a descriptive title..."
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Event Type & Priority */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Categorization</label>
              <div className="relative group">
                <select
                  value={formData.event_type}
                  onChange={e => setFormData(prev => ({ ...prev, event_type: e.target.value }))}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  {EVENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Priority Level</label>
              <div className="relative group">
                <select
                  value={formData.priority}
                  onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  {PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Datetime Section */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Start Timeline*</label>
              <input
                required
                type="datetime-local"
                value={formData.start_datetime}
                onChange={e => setFormData(prev => ({ ...prev, start_datetime: e.target.value }))}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all [color-scheme:light]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">End Timeline*</label>
              <input
                required
                type="datetime-local"
                value={formData.end_datetime}
                onChange={e => setFormData(prev => ({ ...prev, end_datetime: e.target.value }))}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all [color-scheme:light]"
              />
            </div>

            {/* Location & Court */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Physical Venue</label>
              <input
                type="text"
                placeholder="e.g. Room 5, Building B"
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Jurisdiction / Court</label>
              <input
                type="text"
                placeholder="e.g. Supreme Court of Justice"
                value={formData.court_name}
                onChange={e => setFormData(prev => ({ ...prev, court_name: e.target.value }))}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Firm */}
            {role === 'platform-owner' && (
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[13px] font-semibold text-slate-700 mb-2">Target Firm*</label>
                <div className="relative group">
                  <select
                    value={formData.firm}
                    onChange={e => setFormData(prev => ({ ...prev, firm: e.target.value }))}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select a Firm (Required)</option>
                    {firms.map(f => (
                      <option key={f.id} value={f.id}>{f.name || f.firm_name || f.id}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Case */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Associated Matter (Optional)</label>
              <div className="relative group">
                <select
                  value={formData.case}
                  onChange={e => setFormData(prev => ({ ...prev, case: e.target.value }))}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select a Case</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.case_title || c.title || c.id}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Users Assignment */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Resource Assignment</label>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Search personnel..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-[8px] text-[13px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-[8px] shrink-0">
                  {['all', 'admin', 'advocate'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUserFilterType(type)}
                      className={`px-3 py-1 text-[12px] font-medium rounded-md capitalize transition-all ${
                        userFilterType === type 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-[8px] bg-white max-h-[200px] overflow-y-auto overflow-x-hidden">
                {users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mb-2" />
                    <p className="text-xs font-medium">Loading personnel...</p>
                  </div>
                ) : (() => {
                  const filteredUsers = users.filter(u => {
                    const matchesSearch = `${u.first_name} ${u.last_name}`.toLowerCase().includes(userSearchTerm.toLowerCase());
                    const matchesType = userFilterType === 'all' || u.user_type === userFilterType;
                    return matchesSearch && matchesType;
                  });

                  if (filteredUsers.length === 0) {
                    return (
                      <div className="py-8 text-center text-slate-400 text-xs font-medium">
                        No matching personnel found
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
                        className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-medium text-xs text-slate-600">
                             {u.first_name[0]}{u.last_name[0]}
                           </div>
                           <div>
                              <p className="text-[13px] font-medium text-slate-900">{u.first_name} {u.last_name}</p>
                              <p className="text-[11px] text-slate-500 capitalize">{u.user_type}</p>
                           </div>
                        </div>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="flex justify-between items-center mt-2 px-1">
                <p className="text-[12px] text-slate-500 font-medium">{formData.assigned_to.length} selected</p>
                {formData.assigned_to.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, assigned_to: [] }))}
                    className="text-[12px] text-red-600 font-medium hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Description</label>
              <textarea
                rows={4}
                placeholder="Detail the objectives and agenda..."
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-4 border border-slate-200 rounded-[8px] text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 placeholder:text-slate-500 resize-none bg-white transition-all"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-[8px] hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-[8px] hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Event
          </button>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
