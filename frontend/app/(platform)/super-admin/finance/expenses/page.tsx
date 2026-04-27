'use client';

import React from 'react';
import { useTopbarTitle } from '@/components/platform/TopbarContext';
import { Search, Download, Filter, Plus, Receipt, User, ArrowUpRight, Tags } from 'lucide-react';

const mockExpenses = [
  { id: 'EXP-101', date: '2026-04-26', category: 'Software Subscriptions', description: 'Google Workspace (Monthly)', amount: '₹14,500', loggedBy: 'Admin - Ravi', status: 'Cleared' },
  { id: 'EXP-102', date: '2026-04-22', category: 'Office Space', description: 'Co-working Rent May 2026', amount: '₹42,000', loggedBy: 'Admin - Ravi', status: 'Cleared' },
  { id: 'EXP-103', date: '2026-04-20', category: 'Legal Fees', description: 'Consultation Overhead', amount: '₹18,500', loggedBy: 'Partner - Sanjay', status: 'Processing' },
  { id: 'EXP-104', date: '2026-04-18', category: 'Marketing', description: 'LinkedIn Ads Campaign', amount: '₹22,000', loggedBy: 'Marketing - Priya', status: 'Cleared' },
  { id: 'EXP-105', date: '2026-04-15', category: 'Miscellaneous', description: 'Client Dinner / Travel', amount: '₹7,400', loggedBy: 'Partner - Amit', status: 'Pending Approval' },
];

export default function ExpensesPage() {
  useTopbarTitle('Expenses Tracking', 'Monitor and securely trace platform overhead and operational outputs.');

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fafafa] p-4 md:p-6 lg:p-4 font-sans">
      <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-10">

        {/* Header Actions & Summary */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-100/50 rounded-2xl flex items-center justify-center shrink-0 border border-red-100">
              <ArrowUpRight className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Operational Output</p>
              <h3 className="text-3xl font-black text-slate-900">₹1,04,400</h3>
            </div>
          </div>

          <button className="flex justify-center items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm shadow-red-600/20 transition-all w-full md:w-auto hover:-translate-y-0.5">
            <Plus className="w-4 h-4" /> Log Expense
          </button>
        </div>

        {/* Expenses Tracking Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Actions Toolbar */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search expenses by category or desc..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors">
                <Tags className="w-4 h-4" /> Category Filter
              </button>
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors">
                <Filter className="w-4 h-4" /> Date Filter
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Expense ID</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Logged By</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockExpenses.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                    <td className="py-4 px-6 text-sm font-medium text-slate-500">{new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-900">{inv.id}</td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded whitespace-nowrap">
                        {inv.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-slate-700">{inv.description}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{inv.loggedBy}</td>
                    <td className="py-4 px-6 text-sm font-black text-slate-900 text-right">{inv.amount}</td>
                    <td className="py-4 px-6 flex justify-center">
                      <span className={`text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center justify-center w-[120px] tracking-wide uppercase ${inv.status === 'Cleared' ? 'bg-emerald-100/50 text-emerald-700' :
                        inv.status === 'Processing' ? 'bg-amber-100/50 text-amber-700' :
                          'bg-red-50 text-red-600'
                        }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="View Details">
                        <Receipt className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
