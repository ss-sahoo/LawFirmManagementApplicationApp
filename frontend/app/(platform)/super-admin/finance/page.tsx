'use client';

import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  LayoutDashboard, FileText, Download, Calendar,
  CreditCard, ArrowUpRight, ArrowDownRight,
  PieChart, Settings, CheckCircle2, AlertCircle,
  Briefcase, UserCheck, Search, Users, ChevronDown,
  Building, IndianRupee, Crown, Activity
} from 'lucide-react';
import Link from 'next/link';
import { useTopbarTitle } from '@/components/platform/TopbarContext';

const chartData = [
  { name: 'Jan', revenue: 900000, expenses: 150000 },
  { name: 'Feb', revenue: 1050000, expenses: 180000 },
  { name: 'Mar', revenue: 850000, expenses: 140000 },
  { name: 'Apr', revenue: 1200000, expenses: 200000 },
  { name: 'May', revenue: 1400000, expenses: 250000 },
  { name: 'Jun', revenue: 1245000, expenses: 210000 },
];

const topClients = [
  { id: 1, name: 'Reliance Industries', revenue: 450000, percentage: 36 },
  { id: 2, name: 'Tata Consultancy', revenue: 320000, percentage: 25 },
  { id: 3, name: 'HDFC Bank Ltd', revenue: 210000, percentage: 16 },
  { id: 4, name: 'Infosys Corp', revenue: 150000, percentage: 12 },
  { id: 5, name: 'Bharti Airtel', revenue: 115000, percentage: 11 },
];

const outstandingInvoices = [
  { id: 'INV-2026-081', client: 'Future Retail', amount: '₹1,25,000', status: 'Overdue', days: 5 },
  { id: 'INV-2026-085', client: 'Wipro tech', amount: '₹45,000', status: 'Due Soon', days: 2 },
  { id: 'INV-2026-088', client: 'Mahindra & M', amount: '₹18,000', status: 'Due Soon', days: 3 },
];

const recentInvoices = [
  { id: 'INV-2026-089', client: 'Maruti Suzuki', amount: '₹95,000', status: 'Paid', date: '25 Apr 2026' },
  { id: 'INV-2026-090', client: 'ITC Limited', amount: '₹1,10,000', status: 'Pending', date: '24 Apr 2026' },
  { id: 'INV-2026-091', client: 'Sun Pharma', amount: '₹60,000', status: 'Partial', date: '23 Apr 2026' },
];

const recentPayouts = [
  { id: 'PAY-1102', name: 'Rajiv Sharma', role: 'Advocate', amount: '₹45,000', status: 'Completed' },
  { id: 'PAY-1103', name: 'Priya Patel', role: 'Paralegal', amount: '₹18,000', status: 'Processing' },
  { id: 'PAY-1104', name: 'Amit Desai', role: 'Admin', amount: '₹25,000', status: 'Completed' },
];

export default function FinanceDashboard() {
  useTopbarTitle('Overview', 'Your financial summary for this period.');

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] bg-[#fafafa] font-sans">
      {/* Main Content Area */}
      <div className="flex-1 p-1 md:p-1 lg:p-1 overflow-y-auto w-full">
        <div className="w-full max-w-[1600px] mx-auto space-y-6 md:space-y-8 pb-10">

          {/* Header */}
          <div className="flex justify-end items-center gap-4 mb-2">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-all text-sm flex-1 md:flex-none justify-center">
                <Calendar className="w-4 h-4 text-gray-500" />
                This Month
                <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-sm shadow-blue-600/20 hover:bg-blue-700 hover:shadow-md transition-all text-sm flex-1 md:flex-none justify-center">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Revenue */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-blue-600" />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <ArrowUpRight className="w-3 h-3" /> +12.5%
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-500">Total Revenue</h3>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">₹12,45,000</p>
            </div>

            {/* Net Profit */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <ArrowUpRight className="w-3 h-3" /> +8.2%
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-500">Net Profit</h3>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">₹8,13,000</p>
            </div>

            {/* Pending Invoices */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-500" />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                  <ArrowUpRight className="w-3 h-3" /> +3.1%
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-500">Pending Invoices</h3>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">₹2,18,000</p>
            </div>

            {/* Outstanding Payouts */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  Same as last
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-500">Outstanding Payouts</h3>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">₹85,000</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.2fr] gap-6">

            {/* Revenue vs Expenses Line Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Revenue & Expenses</h3>
                  <p className="text-sm text-gray-500 font-medium">Performance over the last 6 months</p>
                </div>
              </div>

              <div className="flex-1 w-full h-[320px] min-h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
                      tickFormatter={(value) => `₹${value / 100000}L`}
                    />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                      formatter={(value: any) => [`₹${value?.toLocaleString('en-IN')}`, undefined]}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#4B5563', paddingTop: '20px' }}
                    />
                    <Line
                      type="monotone"
                      name="Revenue"
                      dataKey="revenue"
                      stroke="#2563EB"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      name="Expenses"
                      dataKey="expenses"
                      stroke="#94A3B8"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Clients by Revenue */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Top Clients by Revenue</h3>
                  <p className="text-sm text-gray-500 font-medium">Highest contributing clients</p>
                </div>
              </div>

              <div className="space-y-5 flex-1">
                {topClients.map((client) => (
                  <div key={client.id} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-400 w-4">#{client.id}</span>
                        <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {client.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">₹{client.revenue.toLocaleString('en-IN')}</span>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md min-w-[36px] text-center">
                          {client.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${client.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Middle Section: 3 Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Outstanding Invoices */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-gray-900">Outstanding Invoices</h3>
              </div>
              <div className="space-y-4">
                {outstandingInvoices.map((inv, idx) => (
                  <div key={idx} className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors bg-gray-50/50">
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-0.5">{inv.id}</p>
                      <p className="text-sm font-semibold text-gray-900">{inv.client}</p>
                      <p className="text-xs font-medium text-gray-500 mt-1.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Due in {inv.days} days
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-sm font-bold text-gray-900">{inv.amount}</p>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                View All Defaulters
              </button>
            </div>

            {/* Recent Invoices Panel */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Invoices</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice ID</th>
                      <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Client</th>
                      <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                      <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right pr-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentInvoices.map((inv, idx) => (
                      <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 text-sm font-semibold text-gray-900">{inv.id}</td>
                        <td className="py-3.5 text-sm font-bold text-gray-700">
                          {inv.client}
                          <span className="block text-xs font-medium text-gray-400 mt-0.5">{inv.date}</span>
                        </td>
                        <td className="py-3.5 text-sm font-bold text-gray-900 text-right">{inv.amount}</td>
                        <td className="py-3.5 text-right flex justify-end">
                          <span className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center justify-center w-16 ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                            inv.status === 'Partial' ? 'bg-indigo-100 text-indigo-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <button className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 group">
                  View Full Report <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Recent Payouts Panel */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Payouts</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Payout ID</th>
                      <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                      <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right pr-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentPayouts.map((pay, idx) => (
                      <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 text-sm font-semibold text-gray-900">{pay.id}</td>
                        <td className="py-3.5 text-sm font-bold text-gray-700">
                          {pay.name}
                          <span className="block text-xs font-medium text-gray-400 mt-0.5">{pay.role}</span>
                        </td>
                        <td className="py-3.5 text-sm font-bold text-gray-900 text-right">{pay.amount}</td>
                        <td className="py-3.5 text-right flex justify-end">
                          <span className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center justify-center w-20 ${pay.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                            {pay.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <button className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 group">
                  View Full Report <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Section: Active Subscription */}
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <Crown className="w-64 h-64 rotate-12 text-white" />
            </div>

            <div className="relative z-10 space-y-2 text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full text-xs font-bold tracking-wide uppercase mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Plan
              </div>
              <h3 className="text-2xl font-extrabold text-white">Business Enterprise Plan</h3>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-slate-300 pt-2">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Clients</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Matters</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> API Access</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Priority Support</span>
              </div>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col items-center min-w-[240px]">
              <p className="text-slate-300 text-sm font-bold uppercase tracking-wider mb-1">Current Billing</p>
              <div className="flex items-end gap-1 mb-5">
                <span className="text-4xl font-black text-white">₹2,499</span>
                <span className="text-slate-400 font-bold mb-1">/ month</span>
              </div>
              <button className="w-full py-3 px-4 bg-white text-slate-900 rounded-xl font-bold shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" /> Manage Subscription
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
