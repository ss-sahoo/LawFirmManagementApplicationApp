'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, IndianRupee, FileText, CreditCard,
  Activity, Loader2, AlertCircle, Lock, ChevronDown,
} from 'lucide-react';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';
import { useTopbarTitle } from '@/components/platform/TopbarContext';

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function fmtFull(n: number) {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface Props {
  role: 'platform_owner' | 'super_admin' | 'admin';
}

export default function FinanceReportsPage({ role }: Props) {
  useTopbarTitle('Financial Reports', 'Month-wise financial analysis and performance breakdown.');

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setUpgradeRequired(false);
    customFetch(API.BILLING.FINANCE_OVERVIEW.MONTHLY_REPORT(year))
      .then(async (res) => {
        const json = await res.json();
        if (res.status === 403 && json.upgrade_required) {
          setUpgradeRequired(true);
        } else if (!res.ok) {
          setError(json.error || 'Failed to load report');
        } else {
          setData(json);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [year]);

  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Report...</p>
      </div>
    );
  }

  if (upgradeRequired) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-amber-100 shadow-sm p-12 max-w-md text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Reports Not Available</h2>
          <p className="text-sm text-gray-500 mb-6">
            Financial reports are not included in your current subscription plan.
            Upgrade to <strong>Business</strong> or <strong>Enterprise</strong> to unlock this feature.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-left space-y-2">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Included in Business & Enterprise</p>
            {['Month-wise revenue analysis', 'Expense breakdown', 'Net profit trends', 'Invoice performance'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-amber-800">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
        <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-12 max-w-md">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <p className="text-sm text-gray-500 mb-4">{error || 'Unable to load report'}</p>
          <button onClick={() => setYear(y => y)} className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700">Retry</button>
        </div>
      </div>
    );
  }

  const { monthly, totals } = data;
  const isPlatformOwner = role === 'platform_owner';

  // Summary cards
  const cards = [
    { label: 'Total Revenue', value: fmtFull(totals.total_revenue), icon: IndianRupee, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Expenses', value: fmtFull(totals.expenses), icon: CreditCard, color: 'bg-red-50 text-red-500' },
    { label: 'Net Profit', value: fmtFull(totals.net_profit), icon: Activity, color: 'bg-emerald-50 text-emerald-600' },
    {
      label: 'Profit Margin',
      value: totals.total_revenue > 0 ? `${((totals.net_profit / totals.total_revenue) * 100).toFixed(1)}%` : '—',
      icon: TrendingUp,
      color: totals.net_profit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500',
    },
  ];

  // Best and worst month
  const nonZero = monthly.filter((m: any) => m.total_revenue > 0);
  const bestMonth = nonZero.length ? nonZero.reduce((a: any, b: any) => a.total_revenue > b.total_revenue ? a : b) : null;
  const worstMonth = nonZero.length ? nonZero.reduce((a: any, b: any) => a.total_revenue < b.total_revenue ? a : b) : null;

  return (
    <div className="bg-[#fafafa] min-h-screen font-sans">
      <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-6 pb-12">

        {/* Year selector */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">Financial Report — {year}</h2>
            <p className="text-sm text-gray-500">Month-wise breakdown of revenue, expenses and profit</p>
          </div>
          <div className="relative">
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}>
                  <c.icon className="w-5 h-5" />
                </div>
                {i === 2 && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${totals.net_profit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {totals.net_profit >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {totals.net_profit >= 0 ? 'Profit' : 'Loss'}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-500">{c.label}</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Best / Worst month */}
        {(bestMonth || worstMonth) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {bestMonth && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Best Month</p>
                  <p className="text-lg font-black text-emerald-900">{bestMonth.month} {year}</p>
                  <p className="text-sm font-semibold text-emerald-700">{fmtFull(bestMonth.total_revenue)} revenue</p>
                </div>
              </div>
            )}
            {worstMonth && worstMonth.month !== bestMonth?.month && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingDown className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Lowest Month</p>
                  <p className="text-lg font-black text-red-900">{worstMonth.month} {year}</p>
                  <p className="text-sm font-semibold text-red-700">{fmtFull(worstMonth.total_revenue)} revenue</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bar chart — monthly revenue vs expenses */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Monthly Revenue vs Expenses</h3>
          <p className="text-sm text-gray-500 mb-6">Full year comparison — {year}</p>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }}
                  tickFormatter={(v) => fmt(v)} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6', fontWeight: 600 }}
                  formatter={(value: any, name: string) => [fmtFull(Number(value)), name]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600, paddingTop: '16px' }} />
                <Bar dataKey="total_revenue" name="Revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
                {isPlatformOwner && <Bar dataKey="client_revenue" name="Client Revenue" fill="#7C3AED" radius={[4, 4, 0, 0]} />}
                <Bar dataKey="expenses" name="Expenses" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line chart — net profit trend */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Net Profit Trend</h3>
          <p className="text-sm text-gray-500 mb-6">Month-wise profit/loss — {year}</p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v) => fmt(v)} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6', fontWeight: 600 }}
                  formatter={(value: any) => [fmtFull(Number(value)), 'Net Profit']}
                />
                <Line type="monotone" dataKey="net_profit" name="Net Profit" stroke="#10B981" strokeWidth={3}
                  dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#10B981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly breakdown table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Month-wise Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Month</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  {isPlatformOwner && <th className="px-4 py-3 text-right">Client Rev.</th>}
                  <th className="px-4 py-3 text-right">Expenses</th>
                  <th className="px-4 py-3 text-right">Net Profit</th>
                  <th className="px-4 py-3 text-right">Invoices</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  {!isPlatformOwner && <th className="px-4 py-3 text-right">Pending</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {monthly.map((m: any, i: number) => {
                  const isProfit = m.net_profit >= 0;
                  const hasData = m.total_revenue > 0 || m.expenses > 0;
                  return (
                    <tr key={i} className={`transition-colors ${hasData ? 'hover:bg-gray-50/50' : 'opacity-40'}`}>
                      <td className="px-6 py-3.5 text-sm font-bold text-gray-900">{m.month}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 text-right">{m.total_revenue > 0 ? fmtFull(m.total_revenue) : '—'}</td>
                      {isPlatformOwner && <td className="px-4 py-3.5 text-sm font-semibold text-purple-700 text-right">{m.client_revenue > 0 ? fmtFull(m.client_revenue) : '—'}</td>}
                      <td className="px-4 py-3.5 text-sm font-semibold text-red-600 text-right">{m.expenses > 0 ? fmtFull(m.expenses) : '—'}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`text-sm font-black ${isProfit ? 'text-emerald-600' : 'text-red-500'}`}>
                          {m.net_profit !== 0 ? fmtFull(m.net_profit) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 text-right font-semibold">{m.invoice_count || '—'}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm font-bold text-emerald-600">{m.paid_count || '—'}</span>
                      </td>
                      {!isPlatformOwner && (
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-sm font-bold text-amber-600">{m.pending_count || '—'}</span>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {/* Totals row */}
                <tr className="bg-gray-900 text-white font-black">
                  <td className="px-6 py-4 text-sm">Total</td>
                  <td className="px-4 py-4 text-sm text-right">{fmtFull(totals.total_revenue)}</td>
                  {isPlatformOwner && <td className="px-4 py-4 text-sm text-right text-purple-300">{fmtFull(monthly.reduce((s: number, m: any) => s + m.client_revenue, 0))}</td>}
                  <td className="px-4 py-4 text-sm text-right text-red-300">{fmtFull(totals.expenses)}</td>
                  <td className="px-4 py-4 text-sm text-right">
                    <span className={totals.net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {fmtFull(totals.net_profit)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-right">{monthly.reduce((s: number, m: any) => s + m.invoice_count, 0)}</td>
                  <td className="px-4 py-4 text-sm text-right text-emerald-400">{monthly.reduce((s: number, m: any) => s + m.paid_count, 0)}</td>
                  {!isPlatformOwner && <td className="px-4 py-4 text-sm text-right text-amber-300">{monthly.reduce((s: number, m: any) => s + (m.pending_count || 0), 0)}</td>}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
