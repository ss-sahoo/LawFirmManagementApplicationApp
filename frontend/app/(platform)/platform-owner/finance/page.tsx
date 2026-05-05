'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  Download, Calendar, CreditCard, ArrowUpRight, ArrowDownRight,
  AlertCircle, ChevronDown, IndianRupee, Activity, Loader2,
  Building2, FileText, Briefcase,
} from 'lucide-react';
import { useTopbarTitle } from '@/components/platform/TopbarContext';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';

interface InvoiceStat {
  total: number;
  paid: number;
  paid_amount: number;
  pending: number;
  pending_amount: number;
  draft: number;
}

interface RecentInvoice {
  invoice_id: string;
  invoice_number: string;
  client_name: string;
  invoice_type: 'platform' | 'client' | 'advocate';
  amount: number;
  invoice_date: string;
  status: string;
}

interface OutstandingInvoice {
  invoice_id: string;
  invoice_number: string;
  client_name: string;
  invoice_type: string;
  amount: number;
  due_date: string;
  days_overdue: number;
  status: string;
}

interface FinanceData {
  summary: {
    total_revenue: { amount: number; change_percentage: number; trend: string };
    net_profit: { amount: number; margin_percentage: number };
    pending_invoices: { amount: number; count: number };
    outstanding_payouts: { amount: number; count: number };
  };
  charts: {
    revenue_expenses: {
      revenue: { month: string; amount: number }[];
      expenses: { month: string; amount: number }[];
    };
  };
  top_clients: { client_id: string; client_name: string; revenue: number; percentage: number }[];
  outstanding_invoices: OutstandingInvoice[];
  recent_invoices: RecentInvoice[];
  recent_payouts: { payout_id: string; advocate_name: string; amount: number; date: string; status: string }[];
  invoice_stats: {
    platform: InvoiceStat;
    client: InvoiceStat;
    advocate: InvoiceStat;
  };
}

const TYPE_BADGE: Record<string, string> = {
  platform: 'bg-purple-100 text-purple-700',
  client: 'bg-blue-100 text-blue-700',
  advocate: 'bg-amber-100 text-amber-700',
};

const STATUS_BADGE: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  sent: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-600',
  submitted: 'bg-amber-100 text-amber-700',
  approved: 'bg-indigo-100 text-indigo-700',
  partially_paid: 'bg-orange-100 text-orange-700',
  viewed: 'bg-sky-100 text-sky-700',
};

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function PlatformOwnerFinanceDashboard() {
  useTopbarTitle('Finance Overview', 'Complete financial summary across all firms, clients and advocates.');
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'platform' | 'advocate'>('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await customFetch(API.BILLING.FINANCE_OVERVIEW.DASHBOARD);
        if (!res.ok) throw new Error('Failed to fetch');
        setData(await res.json());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Financial Records...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
        <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-12 max-w-md">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Sync Error</h2>
          <p className="text-sm text-gray-500 mb-6">{error || 'Unable to load data'}</p>
          <button onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, charts, top_clients, outstanding_invoices, recent_invoices, recent_payouts, invoice_stats } = data;

  const chartData = (charts.revenue_expenses.revenue || []).map((item, i) => ({
    name: item.month,
    revenue: item.amount,
    expenses: charts.revenue_expenses.expenses[i]?.amount || 0,
  }));

  const stats = invoice_stats || { platform: null, client: null, advocate: null };

  // Filter recent invoices by tab
  const filteredRecent = activeTab === 'all'
    ? recent_invoices
    : recent_invoices.filter(inv => inv.invoice_type === activeTab);

  return (
    <div className="bg-[#fafafa] min-h-screen font-sans">
      <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-6 pb-12">

        {/* Top bar */}
        <div className="flex justify-end gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-50 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" /> Current Period <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-sm hover:bg-blue-700 text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        {/* Summary KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              label: 'Total Revenue', value: fmt(summary.total_revenue.amount),
              icon: IndianRupee, color: 'bg-blue-50 text-blue-600',
              badge: summary.total_revenue.change_percentage !== 0
                ? { text: `${Math.abs(summary.total_revenue.change_percentage).toFixed(1)}%`, up: summary.total_revenue.trend === 'up' }
                : null,
            },
            {
              label: 'Net Profit', value: fmt(summary.net_profit.amount),
              icon: Activity, color: 'bg-emerald-50 text-emerald-600',
              badge: { text: `Margin ${summary.net_profit.margin_percentage.toFixed(1)}%`, up: true },
            },
            {
              label: 'Pending Invoices', value: fmt(summary.pending_invoices.amount),
              icon: FileText, color: 'bg-amber-50 text-amber-500',
              badge: { text: `${summary.pending_invoices.count} invoices`, up: null },
            },
            {
              label: 'Outstanding Payouts', value: fmt(summary.outstanding_payouts.amount),
              icon: CreditCard, color: 'bg-indigo-50 text-indigo-600',
              badge: { text: `${summary.outstanding_payouts.count} pending`, up: null },
            },
          ].map((card, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                {card.badge && (
                  <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
                    card.badge.up === true ? 'text-emerald-600 bg-emerald-50' :
                    card.badge.up === false ? 'text-red-600 bg-red-50' :
                    'text-gray-500 bg-gray-100'
                  }`}>
                    {card.badge.up === true && <ArrowUpRight className="w-3 h-3" />}
                    {card.badge.up === false && <ArrowDownRight className="w-3 h-3" />}
                    {card.badge.text}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-500">{card.label}</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Invoice type breakdown */}
        {stats.platform && stats.client && stats.advocate && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label: 'Platform Invoices', icon: Building2, color: 'text-purple-600 bg-purple-50', stat: stats.platform, type: 'platform' },
              { label: 'Advocate Invoices', icon: Briefcase, color: 'text-amber-600 bg-amber-50', stat: stats.advocate, type: 'advocate' },
            ].map((card) => (
              <div key={card.type} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                    <card.icon className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{card.label}</p>
                  <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{card.stat.total} total</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <p className="text-lg font-black text-emerald-700">{card.stat.paid}</p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Paid</p>
                    <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">{fmt(card.stat.paid_amount)}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-lg font-black text-amber-700">{card.stat.pending}</p>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending</p>
                    <p className="text-[11px] font-semibold text-amber-600 mt-0.5">{fmt(card.stat.pending_amount)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-lg font-black text-gray-600">{card.stat.draft}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Draft</p>
                    <p className="text-[11px] font-semibold text-gray-400 mt-0.5">—</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chart + Top Firms */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.2fr] gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Revenue & Expenses</h3>
              <p className="text-sm text-gray-500">Last 6 months — all invoice types</p>
            </div>
            <div className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(v) => `₹${v >= 100000 ? (v / 100000).toFixed(1) + 'L' : v.toLocaleString('en-IN')}`} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6', fontWeight: 600 }}
                      formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, undefined]}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600, paddingTop: '16px' }} />
                    <Line type="monotone" name="Revenue" dataKey="revenue" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="Expenses" dataKey="expenses" stroke="#94A3B8" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm">No chart data yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Top Firms</h3>
              <p className="text-sm text-gray-500">By subscription revenue</p>
            </div>
            <div className="space-y-4">
              {top_clients.length > 0 ? top_clients.map((firm, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-400 w-4">#{i + 1}</span>
                      <span className="text-sm font-bold text-gray-900 truncate max-w-[140px]">{firm.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{fmt(firm.revenue)}</span>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{firm.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(firm.percentage, 100)}%` }} />
                  </div>
                </div>
              )) : (
                <p className="text-center py-10 text-gray-300 text-sm italic">No paid invoices yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Invoices — all types with tab filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Invoices</h3>
              <p className="text-sm text-gray-500">All invoice types across all firms</p>
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
              {(['all', 'platform', 'advocate'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-4 py-3">Firm / Client</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRecent.length > 0 ? filteredRecent.map((inv, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-bold text-gray-800">{inv.invoice_number}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-700 max-w-[160px] truncate">{inv.client_name}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${TYPE_BADGE[inv.invoice_type] || 'bg-gray-100 text-gray-600'}`}>
                        {inv.invoice_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{inv.invoice_date}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">{fmt(inv.amount)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${STATUS_BADGE[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-300 text-sm italic">No invoices found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Outstanding + Recent Payouts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-gray-900">Outstanding Invoices</h3>
            </div>
            <div className="space-y-3">
              {outstanding_invoices.length > 0 ? outstanding_invoices.map((inv, i) => (
                <div key={i} className="flex items-start justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-gray-200 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-bold text-gray-500">{inv.invoice_number}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${TYPE_BADGE[inv.invoice_type] || 'bg-gray-100 text-gray-500'}`}>
                        {inv.invoice_type}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">{inv.client_name}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {inv.days_overdue > 0 ? `${inv.days_overdue}d overdue` : `Due ${inv.due_date}`}
                    </p>
                  </div>
                  <div className="text-right ml-4 flex flex-col items-end gap-1.5">
                    <p className="text-sm font-bold text-gray-900">{fmt(inv.amount)}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${STATUS_BADGE[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-center py-10 text-gray-300 text-sm italic">All clear</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Recent Advocate Payouts</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Advocate</th>
                  <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                  <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent_payouts.length > 0 ? recent_payouts.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 text-sm font-bold text-gray-700">
                      <span className="block truncate max-w-[140px]">{p.advocate_name}</span>
                      <span className="block text-xs text-gray-400 mt-0.5">{p.date}</span>
                    </td>
                    <td className="py-3.5 text-sm font-bold text-gray-900 text-right">{fmt(p.amount)}</td>
                    <td className="py-3.5 text-right">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${STATUS_BADGE[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="text-center py-10 text-gray-300 text-xs italic">No payouts</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
