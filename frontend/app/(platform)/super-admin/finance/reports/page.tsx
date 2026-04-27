'use client';

import React, { useState } from 'react';
import { useTopbarTitle } from '@/components/platform/TopbarContext';
import {
  Calendar, ChevronDown, Wallet, FileText, CreditCard,
  TrendingUp, TrendingDown, Eye, Download
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Data for Line Chart
const revenueTrendData = [
  { name: 'Dec 2024', uv: 5500000 },
  { name: 'Jan 2025', uv: 8500000 },
  { name: 'Feb 2025', uv: 5800000 },
  { name: 'Mar 2025', uv: 8800000 },
  { name: 'Apr 2025', uv: 12450000 },
  { name: 'May 2025', uv: 10800000 },
];

// Data for Donut Chart
const pieData = [
  { name: 'Case Fees', value: 780000, percentage: '62.7%', color: '#3b82f6' }, // Blue
  { name: 'Consultation Fees', value: 210000, percentage: '16.9%', color: '#22c55e' }, // Green
  { name: 'Retainer Fees', value: 175000, percentage: '14.1%', color: '#a855f7' }, // Purple
  { name: 'Other Income', value: 80000, percentage: '6.3%', color: '#f59e0b' }, // Orange/Yellow
];

// Data for Table
const reportsTable = [
  { type: 'Revenue Report', desc: 'Overview of all revenue received', date: 'May 1 – May 31, 2025', generated: 'May 31, 2025 10:30 AM', amount: '₹12,45,000' },
  { type: 'Invoice Report', desc: 'Summary of all invoices', date: 'May 1 – May 31, 2025', generated: 'May 31, 2025 10:30 AM', amount: '₹14,65,000' },
  { type: 'Payout Report', desc: 'Summary of all payouts', date: 'May 1 – May 31, 2025', generated: 'May 31, 2025 10:30 AM', amount: '₹4,20,000' },
  { type: 'Profit & Loss Report', desc: 'Net profit and loss summary', date: 'May 1 – May 31, 2025', generated: 'May 31, 2025 10:30 AM', amount: '₹8,25,000' },
];

export default function ReportsRedesignedPage() {
  useTopbarTitle('Financial Reports', 'Comprehensive master ledger of all platform transactions.');

  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'Revenue Report', 'Invoice Report', 'Payout Report'];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fafbfc] p-6 lg:p-1 font-sans">
      <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-10">

        {/* 1. Top Navigation Tabs */}
        <div className="flex items-center gap-8 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-[15px] font-semibold transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* 2. Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">

            <div className="w-full sm:w-[260px]">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Date Range</label>
              <div className="relative border border-slate-200 rounded-xl bg-white px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>May 1 - May 31, 2025</span>
                </div>
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="w-full sm:w-[220px]">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Report Type</label>
              <div className="relative border border-slate-200 rounded-xl bg-white px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors">
                <span className="text-sm font-semibold text-slate-800">All Reports</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
            <button className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-colors">
              Apply Filters
            </button>
            <button className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
              Reset
            </button>
          </div>
        </div>

        {/* 3. Metric Cards (4 in a row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Total Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-2">Total Revenue</p>
                <h3 className="text-[28px] font-black text-slate-900 tracking-tight leading-none">₹12,45,000</h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500">18.6%</span>
              <span className="text-xs font-medium text-slate-400">from Apr 1 - Apr 30, 2025</span>
            </div>
          </div>

          {/* Total Invoices */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-2">Total Invoices</p>
                <h3 className="text-[28px] font-black text-slate-900 tracking-tight leading-none">₹14,65,000</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500">16.2%</span>
              <span className="text-xs font-medium text-slate-400">from Apr 1 - Apr 30, 2025</span>
            </div>
          </div>

          {/* Total Payouts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-2">Total Payouts</p>
                <h3 className="text-[28px] font-black text-slate-900 tracking-tight leading-none">₹4,20,000</h3>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-red-500">5.3%</span>
              <span className="text-xs font-medium text-slate-400">from Apr 1 - Apr 30, 2025</span>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-2">Net Profit</p>
                <h3 className="text-[28px] font-black text-slate-900 tracking-tight leading-none">₹8,25,000</h3>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500">20.1%</span>
              <span className="text-xs font-medium text-slate-400">from Apr 1 - Apr 30, 2025</span>
            </div>
          </div>

        </div>

        {/* 4. Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Line Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-slate-900">Revenue Trend</h2>
              <div className="flex items-center gap-2 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer">
                <span className="text-xs font-bold text-slate-700">Monthly</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </div>
            </div>
            <div className="h-[280px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrendData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                    tickFormatter={(value) => `₹${(value / 100000).toFixed(0)},00,000`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    formatter={(value: any) => `₹${value.toLocaleString()}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="uv"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5, stroke: 'white' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <h2 className="text-lg font-black text-slate-900 mb-6">Revenue by Source</h2>

            <div className="flex flex-col items-center justify-center flex-1 py-4">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Inner Text for Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <h3 className="text-lg font-black text-slate-900 leading-none mb-1">₹12,45,000</h3>
                  <p className="text-xs font-semibold text-slate-500">Total</p>
                </div>
              </div>
            </div>

            {/* Custom Legend Layout ensuring correct right alignment of amount values */}
            <div className="w-full space-y-4 mt-2 px-2">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[13px] font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-[13px] font-bold text-slate-500">
                    ₹{(item.value).toLocaleString('en-IN')} <span className="text-slate-400 font-medium ml-1">({item.percentage})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 5. Report Summary Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">Report Summary</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-bold text-slate-900 bg-white tracking-wide">Report Type</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-900 bg-white tracking-wide">Description</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-900 bg-white tracking-wide">Date Range</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-900 bg-white tracking-wide">Generated On</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-900 bg-white tracking-wide text-right">Amount</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-900 bg-white tracking-wide text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportsTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                    <td className="py-4 px-6 text-[13px] font-bold text-slate-800">{row.type}</td>
                    <td className="py-4 px-6 text-[13px] font-semibold text-slate-500">{row.desc}</td>
                    <td className="py-4 px-6 text-[13px] font-semibold text-slate-500">{row.date}</td>
                    <td className="py-4 px-6 text-[13px] font-semibold text-slate-500">{row.generated}</td>
                    <td className="py-4 px-6 text-[13px] font-black text-slate-900 text-right">{row.amount}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <button className="p-1.5 text-blue-500 hover:bg-blue-50 border border-blue-100 rounded-md transition-colors shadow-sm" title="View Details">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 text-blue-500 hover:bg-blue-50 border border-blue-100 rounded-md transition-colors shadow-sm" title="Download Report">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
