'use client';

import { useState, useEffect } from 'react';
import { Briefcase, PenTool, CheckCircle, FileText, Loader2, AlertCircle } from 'lucide-react';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';

interface DashboardData {
  role: string;
  role_display: string;
  user_name: string;
  cards: {
    cases_assigned: number;
    drafts_to_review: number;
    files_logged: number;
    tasks_done: number;
  };
}

export default function ParalegalDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await customFetch(API.DASHBOARD.GET);
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.detail || json.message || 'Failed to load dashboard');
        }
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0a6c74]" />
          <p className="text-sm text-gray-400 font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-12 text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-red-500 font-medium">{error || 'Failed to load dashboard'}</p>
        </div>
      </div>
    );
  }

  const { cards } = data;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Cases Assigned', val: cards?.cases_assigned || 0,    icon: Briefcase, color: 'bg-[#0a6c74]' },
          { label: 'Drafts to Review',val: cards?.drafts_to_review || 0, icon: PenTool,   color: 'bg-emerald-500' },
          { label: 'Files Logged',   val: cards?.files_logged || 0,      icon: FileText,  color: 'bg-blue-600' },
          { label: 'Tasks Done',     val: cards?.tasks_done || 0,        icon: CheckCircle,color: 'bg-teal-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-4 text-white shadow-sm`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.val}</p>
            <p className="text-sm font-medium text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center mt-6">
        <h2 className="text-lg font-bold text-[#0a6c74] mb-2">Welcome to your Paralegal Hub</h2>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">
          Here you will assist advocates with draft reviews and timeline tracking. Note that client communication and draft approvals are restricted out of your scope.
        </p>
      </div>
    </div>
  );
}
