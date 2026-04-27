'use client';

import React from 'react';
import { Search, Download, Filter, Eye } from 'lucide-react';

const mockPayouts = [
  { id: 'PAY-ADM-201', date: '2026-04-01', name: 'Alok Kumar', amount: '₹85,000', method: 'Direct Deposit', status: 'Completed' },
  { id: 'PAY-ADM-202', date: '2026-04-01', name: 'Sarita Varma', amount: '₹92,000', method: 'Direct Deposit', status: 'Completed' },
  { id: 'PAY-ADM-203', date: '2026-04-28', name: 'Alok Kumar', amount: '₹85,000', method: 'Direct Deposit', status: 'Processing' },
];

export default function AdminPaymentsPage() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col font-sans">
      {/* Header Info */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
        <div>
          <h2 className="text-xl font-black text-slate-900">Admin Distributions</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Review internal salary and administrative payouts.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right">
             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Distributed</p>
             <p className="text-xl font-black text-blue-600">₹2,62,000</p>
           </div>
        </div>
      </div>

      {/* Actions Toolbar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search admins..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction ID</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Administrator</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockPayouts.map((inv, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                <td className="py-4 px-6 text-sm font-medium text-slate-500">{new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</td>
                <td className="py-4 px-6 text-sm font-bold text-slate-900">{inv.id}</td>
                <td className="py-4 px-6 text-sm font-bold text-slate-700">{inv.name}</td>
                <td className="py-4 px-6 text-sm font-semibold text-slate-600">{inv.method}</td>
                <td className="py-4 px-6 text-sm font-black text-slate-900 text-right">{inv.amount}</td>
                <td className="py-4 px-6 flex justify-center">
                  <span className={`text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center justify-center w-24 tracking-wide uppercase ${
                    inv.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                    inv.status === 'Failed' ? 'bg-red-100 text-red-700' : 
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
