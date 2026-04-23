'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Send, 
  Filter, 
  Search, 
  MoreVertical, 
  ArrowUpRight, 
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MOCK_PROFESSIONAL_INVOICES } from './mock-data';
import { Badge, MetricCard, Panel, SearchBar } from './ui';

interface ProfessionalBillingHubProps {
  role?: 'super-admin' | 'admin';
  isLoading?: boolean;
}

const STATUS_MAP = {
  paid: { tone: 'success' as const, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  pending: { tone: 'warning' as const, icon: <Clock className="w-3.5 h-3.5" /> },
  overdue: { tone: 'danger' as const, icon: <AlertCircle className="w-3.5 h-3.5" /> },
  draft: { tone: 'info' as const, icon: <FileText className="w-3.5 h-3.5" /> },
};

export default function ProfessionalBillingHub({ role = 'admin', isLoading = false }: ProfessionalBillingHubProps) {
  const [query, setQuery] = useState('');

  const filteredInvoices = useMemo(() => {
    return MOCK_PROFESSIONAL_INVOICES.filter(inv => 
      inv.client.toLowerCase().includes(query.toLowerCase()) || 
      inv.id.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-50 rounded-2xl border border-gray-100" />)}
        </div>
        <div className="h-[400px] bg-white rounded-3xl border border-gray-100 shadow-sm" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard label="Total Revenue" value="Rs. 12.8L" hint="+12% from last month" accent="#0e2340" />
        <MetricCard label="Pending" value="Rs. 2.4L" hint="Across 8 invoices" accent="#f59e0b" />
        <MetricCard label="Overdue" value="Rs. 0.8L" hint="3 high priority" accent="#ef4444" />
        <MetricCard label="Collection Rate" value="94.2%" hint="Historical average" accent="#10b981" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8">
        {/* Main Ledger */}
        <div className="space-y-6">
          <Panel 
            title="Professional Invoice Ledger" 
            subtitle="Manage client billing, track payments, and export documentation."
            actions={
              <div className="flex items-center gap-3">
                <SearchBar placeholder="Search invoices or clients..." value={query} onChange={setQuery} />
                <button className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-500 transition-all">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            }
          >
            <div className="overflow-x-auto -mx-6">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-y border-gray-100">
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Invoice</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Entity</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Due Date</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredInvoices.map((inv) => (
                    <motion.tr 
                      key={inv.id} 
                      className="group hover:bg-gray-50/50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 group-hover:text-[#0e2340] transition-colors">{inv.id}</span>
                          <span className="text-[11px] text-gray-400 font-medium">Issue: {inv.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">{inv.client}</span>
                          <span className="text-[11px] text-gray-400 font-medium">{inv.matter || 'General Retainer'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-sm text-gray-700">{inv.amount}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <Badge label={inv.status.toUpperCase()} tone={STATUS_MAP[inv.status].tone} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-[13px] font-bold ${inv.status === 'overdue' ? 'text-red-500' : 'text-gray-500'}`}>
                            {inv.due}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 rounded-xl text-gray-400 hover:text-[#0e2340] hover:bg-white border border-transparent hover:border-gray-100 transition-all shadow-sm">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-xl text-gray-400 hover:text-[#0e2340] hover:bg-white border border-transparent hover:border-gray-100 transition-all shadow-sm">
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <Panel title="Quick Actions" subtitle="System controls">
            <div className="space-y-3">
              <button className="w-full p-4 rounded-2xl bg-[#0e2340] text-white flex items-center justify-between group hover:shadow-xl hover:shadow-[#0e2340]/20 transition-all">
                <span className="text-sm font-bold">Create Invoice</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <button className="w-full p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 text-gray-700 flex items-center justify-between group transition-all">
                <span className="text-sm font-bold">Remittance Report</span>
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </Panel>

          <Panel title="Remittance Guide" subtitle="Help Center">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Auto-Sync</span>
                </div>
                <p className="text-xs text-emerald-800/80 leading-relaxed font-medium">
                  Invoices are automatically generated for disposal matters every Friday.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50 space-y-2">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Compliance</span>
                </div>
                <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                  3 overdue payments have crossed the 30-day escalation threshold.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
