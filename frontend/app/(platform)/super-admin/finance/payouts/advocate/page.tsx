'use client';

import React, { useState } from 'react';
import { Search, Download, Filter, Eye, DollarSign, CheckCircle2 } from 'lucide-react';

const mockPayouts = [
  { id: 'PAY-ADV-101', date: '2026-04-20', name: 'Ramesh Singh', amount: '₹14,500', method: 'Bank Transfer', status: 'Completed' },
  { id: 'PAY-ADV-102', date: '2026-04-22', name: 'Anita Desai', amount: '₹22,000', method: 'UPI', status: 'Processing' },
  { id: 'PAY-ADV-103', date: '2026-04-25', name: 'Vikram Malhotra', amount: '₹8,500', method: 'Bank Transfer', status: 'Completed' },
  { id: 'PAY-ADV-104', date: '2026-04-26', name: 'Priya Sharma', amount: '₹11,200', method: 'Cheque', status: 'Failed' },
];

export default function AdvocatePaymentsPage() {
  const [activeTab, setActiveTab] = useState('History');
  const tabs = ['Time Entries', 'Expenses', 'History'];

  return (
    <div className="space-y-6 font-sans">
      {/* Sub Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200 px-2 mt-2">
         {tabs.map((tab) => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`py-3 text-[14px] font-bold transition-all relative ${
               activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
             }`}
           >
             {tab}
             {activeTab === tab && (
               <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-blue-600 rounded-t-full" />
             )}
           </button>
         ))}
      </div>

      {activeTab === 'History' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Header Info */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
            <div>
              <h2 className="text-xl font-black text-slate-900">Advocate Distributions</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Review payouts to external and internal advocates securely.</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="text-right">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Distributed</p>
                 <p className="text-xl font-black text-blue-600">₹2,45,600</p>
               </div>
            </div>
          </div>

          {/* Actions Toolbar */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search transactions..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors">
                <Filter className="w-4 h-4" /> Filter
              </button>
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors">
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
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Advocate</th>
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
      )}

      {activeTab === 'Time Entries' && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
             <CheckCircle2 className="w-8 h-8 text-slate-400" />
           </div>
           <h3 className="text-xl font-black text-slate-800 mb-2">Time Entries Logging</h3>
           <p className="text-slate-500 max-w-md">Connect advocate logged billable hours. This module will allow you to generate precise advocate payouts instantly.</p>
        </div>
      )}

      {activeTab === 'Expenses' && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
             <DollarSign className="w-8 h-8 text-slate-400" />
           </div>
           <h3 className="text-xl font-black text-slate-800 mb-2">Advocate Expense Claims</h3>
           <p className="text-slate-500 max-w-md">Track out-of-pocket expenses requested by advocates for reimbursement during distribution cycles.</p>
        </div>
      )}

    </div>
  );
}
