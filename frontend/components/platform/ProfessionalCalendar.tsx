'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Clock,
  MapPin,
  Scale,
  LayoutGrid,
  List,
  User,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'hearing' | 'task' | 'deadline' | 'meeting' | 'consultation' | 'filing' | 'other';
  caseNumber?: string;
  clientName?: string;
  adminName: string;
  role: string;
}

interface ProfessionalCalendarProps {
  events: CalendarEvent[];
  isLoading?: boolean;
  role?: 'admin' | 'advocate' | 'client';
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: 'day' | 'week' | 'month') => void;
  onAddEvent?: (date: Date) => void;
  onEventClick?: (id: string) => void;
}

const EVENT_STYLES: Record<string, any> = {
  hearing: {
    bg: 'bg-red-50',
    border: 'border-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500',
    icon: <Scale className="w-3.5 h-3.5" />
  },
  task: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    icon: <List className="w-3.5 h-3.5" />
  },
  deadline: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    icon: <Clock className="w-3.5 h-3.5" />
  },
  meeting: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    icon: <User className="w-3.5 h-3.5" />
  },
  consultation: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
    icon: <User className="w-3.5 h-3.5" />
  },
  filing: {
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
    icon: <CalendarIcon className="w-3.5 h-3.5" />
  },
  other: {
    bg: 'bg-gray-50',
    border: 'border-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-500',
    icon: <MoreHorizontal className="w-3.5 h-3.5" />
  }
};

export default function ProfessionalCalendar({ 
  events, 
  isLoading, 
  role = 'advocate',
  onDateChange,
  onViewChange,
  onAddEvent,
  onEventClick
}: ProfessionalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 22)); 
  const [view, setView] = useState<'day' | 'week' | 'month'>('month');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const handleDateNavigation = (direction: 'next' | 'prev') => {
    let newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setCurrentDate(newDate);
      onDateChange?.(newDate);
    }
  };

  const monthDays = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[800px]">
      <div className="px-8 py-6 border-b border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 min-w-[180px]">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h1>
            <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
              <button onClick={() => handleDateNavigation('prev')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                onClick={() => {
                  const today = new Date(2026, 3, 22);
                  setCurrentDate(today);
                  onDateChange?.(today);
                }}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 font-bold"
              >
                Today
              </button>
              <button onClick={() => handleDateNavigation('next')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 transition-all">
             <CalendarIcon className="w-4 h-4 text-gray-400" />
             <input 
               type="date" 
               className="bg-transparent border-none outline-none text-sm font-bold text-gray-700"
               value={currentDate.toISOString().slice(0, 10)}
               onChange={handleDatePickerChange}
             />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
            {(['day', 'week', 'month'] as const).map((v) => (
              <button
                key={v}
                onClick={() => {
                  setView(v);
                  onViewChange?.(v);
                }}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                  view === v 
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-100' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <button onClick={() => onAddEvent?.(currentDate)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95">
            <Plus className="w-5 h-5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
             <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {view === 'month' && (
          <div className="h-full flex flex-col">
            <div className="grid grid-cols-7 border-b border-gray-100">
              {weekDays.map(day => (
                <div key={day} className="py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">{day}</div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7 grid-rows-6">
              {monthDays.map((day, idx) => {
                const dayEvents = events.filter(e => 
                  e.date.getDate() === day.date.getDate() && 
                  e.date.getMonth() === day.date.getMonth() &&
                  e.date.getFullYear() === day.date.getFullYear()
                );
                const isToday = day.date.getDate() === 22 && day.date.getMonth() === 3;
                return (
                  <div key={idx} onClick={() => onAddEvent?.(day.date)} className={`min-h-[120px] p-2 border-r border-b border-gray-100 flex flex-col gap-1 cursor-pointer hover:bg-gray-50 transition-colors ${!day.isCurrentMonth ? 'bg-gray-50/30' : 'bg-white'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-bold p-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-sm' : !day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}`}>
                        {day.date.getDate()}
                      </span>
                    </div>
                    {dayEvents.slice(0, 3).map((event, eventIdx) => {
                      const style = EVENT_STYLES[event.type] || EVENT_STYLES.other;
                      return (
                        <div key={`${event.id}-${idx}-${eventIdx}`} onClick={(e) => { e.stopPropagation(); onEventClick?.(event.id); }} className={`px-2 py-1 rounded-md border ${style.bg} ${style.border} ${style.text} text-[11px] font-medium truncate flex items-center gap-1 hover:brightness-95`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          <span className="truncate">{event.title}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && <span className="text-[10px] text-gray-400 font-bold ml-1">+{dayEvents.length - 3} more</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'week' && (
          <div className="h-full flex flex-col">
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
              {weekDays.map((day, idx) => {
                 const date = new Date(currentDate);
                 date.setDate(currentDate.getDate() - currentDate.getDay() + idx);
                 const isToday = date.getDate() === 22 && date.getMonth() === 3;
                 return (
                   <div key={day} className="py-6 flex flex-col items-center gap-2 border-r border-gray-100 last:border-0">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{day}</span>
                      <span className={`text-2xl font-black w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${
                        isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </span>
                   </div>
                 );
              })}
            </div>
            <div className="flex-1 grid grid-cols-7 overflow-y-auto custom-scrollbar bg-white">
              {weekDays.map((_, idx) => {
                const date = new Date(currentDate);
                date.setDate(currentDate.getDate() - currentDate.getDay() + idx);
                const dayEvents = events.filter(e => 
                  e.date.getDate() === date.getDate() && 
                  e.date.getMonth() === date.getMonth() &&
                  e.date.getFullYear() === date.getFullYear()
                );

                return (
                  <div key={idx} onClick={() => onAddEvent?.(date)} className="min-h-[500px] p-3 border-r border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors flex flex-col gap-3">
                    {dayEvents.map(event => {
                      const style = EVENT_STYLES[event.type] || EVENT_STYLES.other;
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={event.id} 
                          onClick={(e) => { e.stopPropagation(); onEventClick?.(event.id); }} 
                          className={`p-3 rounded-2xl border ${style.bg} ${style.border} ${style.text} cursor-pointer hover:shadow-md transition-all group`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-black uppercase tracking-wider opacity-60">{event.time}</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          </div>
                          <p className="text-xs font-bold leading-tight group-hover:underline line-clamp-2">{event.title}</p>
                          <div className="mt-2 flex items-center gap-1.5 opacity-40">
                             <User className="w-2.5 h-2.5" />
                             <span className="text-[9px] font-bold truncate">{event.adminName}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'day' && (
          <div className="p-12 h-full flex flex-col gap-8 max-w-4xl mx-auto overflow-y-auto custom-scrollbar">
             <div className="flex items-end justify-between border-b-2 border-gray-900 pb-6">
                <div>
                  <p className="text-gray-500 font-bold uppercase tracking-widest mb-2">{currentDate.toLocaleString('default', { weekday: 'long' })}</p>
                  <h2 className="text-5xl font-extrabold text-gray-900">{currentDate.getDate()} {currentDate.toLocaleString('default', { month: 'long' })}</h2>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Total Events</p>
                  <p className="text-4xl font-bold text-gray-900">{events.length}</p>
                </div>
             </div>
             <div className="space-y-4">
                {events.length === 0 ? <div className="py-20 text-center text-gray-300 font-bold tracking-widest uppercase">No events scheduled for today</div> : events.map(event => {
                    const style = EVENT_STYLES[event.type] || EVENT_STYLES.other;
                    return (
                      <div key={event.id} onClick={() => onEventClick?.(event.id)} className={`flex items-center gap-6 p-6 rounded-2xl border ${style.bg} ${style.border} transition-all hover:bg-white hover:shadow-xl cursor-pointer group`}>
                         <div className="w-24 text-center shrink-0">
                           <p className="text-xl font-bold text-gray-900">{event.time}</p>
                           <p className="text-[10px] font-bold text-gray-400 uppercase">Start Time</p>
                         </div>
                         <div className="w-px h-12 bg-gray-200" />
                         <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${style.border} ${style.text}`}>{event.type}</span>
                             <span className="text-xs text-gray-400 font-medium">#{event.id.slice(0, 4)}</span>
                           </div>
                           <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{event.title}</h3>
                           <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 font-medium">
                              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.caseNumber || 'N/A'}</span>
                              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{event.adminName}</span>
                           </div>
                         </div>
                         <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                      </div>
                    );
                })}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
