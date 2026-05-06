'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfessionalBillingHub from '@/components/platform/ProfessionalBillingHub';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';
import InvoiceViewModal from '@/components/InvoiceViewModal';
import {
  AlertCircle, List, User, FileText, Receipt,
  CheckCircle2, Clock, IndianRupee, Search,
} from 'lucide-react';

type ViewType = 'all' | 'my_entries' | 'unbilled';

const STATUS_STYLE: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  approved: 'bg-indigo-100 text-indigo-700',
  submitted: 'bg-amber-100 text-amber-700',
  draft: 'bg-gray-100 text-gray-500',
  rejected: 'bg-red-100 text-red-700',
};

function fmt(n: number) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

export default function AdvocateBillingPage() {
  const router = useRouter();
  const [viewType, setViewType] = useState<ViewType>('all');
  const [activeSection, setActiveSection] = useState<'timesheet' | 'my_invoices'>('timesheet');
  const { entries, loading, error } = useTimeEntries(viewType);

  // Advocate invoices state — combines AdvocateInvoices + client Invoices assigned to this advocate
  const [advInvoices, setAdvInvoices] = useState<any[]>([]);
  const [advLoading, setAdvLoading] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'paid' | 'sent'>('all');

  const openInvoice = async (inv: any) => {
    setSelected(inv);
    setSelectedDetail(null);
    setDetailLoading(true);
    try {
      // inv._type tells us which endpoint to hit
      const url = inv._type === 'client'
        ? API.BILLING.INVOICES.DETAIL(inv.id)
        : API.BILLING.ADVOCATE_INVOICES.DETAIL(inv.id);
      const res = await customFetch(url);
      if (res.ok) setSelectedDetail(await res.json());
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchAdvInvoices = async () => {
    setAdvLoading(true);
    try {
      // Fetch both advocate invoices and client invoices in parallel
      const [advRes, clientRes] = await Promise.all([
        customFetch(API.BILLING.ADVOCATE_INVOICES.MY_INVOICES),
        customFetch(API.BILLING.INVOICES.MY_INVOICES),
      ]);
      const advData = advRes.ok ? await advRes.json() : [];
      const clientData = clientRes.ok ? await clientRes.json() : [];

      const advList = (Array.isArray(advData) ? advData : (advData.results || []))
        .map((i: any) => ({ ...i, _type: 'advocate' }));
      const clientList = (Array.isArray(clientData) ? clientData : (clientData.results || []))
        .map((i: any) => ({ ...i, _type: 'client' }));

      // Merge and sort by invoice_date descending
      const merged = [...advList, ...clientList].sort(
        (a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime()
      );
      setAdvInvoices(merged);
    } finally {
      setAdvLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'my_invoices') fetchAdvInvoices();
  }, [activeSection]);

  const displayed = advInvoices.filter(inv => {
    const matchSearch = !search.trim() ||
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalEarned = advInvoices.filter(i => i.status === 'paid')
    .reduce((s, i) => s + parseFloat(i.total_amount || 0), 0);
  const totalPending = advInvoices.filter(i => ['submitted', 'approved', 'sent'].includes(i.status))
    .reduce((s, i) => s + parseFloat(i.total_amount || 0), 0);

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Top nav */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <button onClick={() => { setActiveSection('timesheet'); setViewType('all'); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeSection === 'timesheet' && viewType === 'all' ? 'bg-[#0f172a] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <List className="w-4 h-4" /> Firm Ledger
          </button>
          <button onClick={() => { setActiveSection('timesheet'); setViewType('my_entries'); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeSection === 'timesheet' && viewType === 'my_entries' ? 'bg-[#0f172a] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <User className="w-4 h-4" /> My Timesheet
          </button>
          <button onClick={() => { setActiveSection('timesheet'); setViewType('unbilled'); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeSection === 'timesheet' && viewType === 'unbilled' ? 'bg-[#0f172a] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FileText className="w-4 h-4" /> Unbilled (Ready to Invoice)
          </button>
        </div>
        <button onClick={() => setActiveSection('my_invoices')}
          className={`px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all border shadow-sm ${activeSection === 'my_invoices' ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
          <Receipt className="w-4 h-4" /> My Invoices
          {advInvoices.filter(i => i.status === 'approved').length > 0 && (
            <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {advInvoices.filter(i => i.status === 'approved').length}
            </span>
          )}
        </button>
      </div>

      {/* Error */}
      {error && activeSection === 'timesheet' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-3xl flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Timesheet section */}
      {activeSection === 'timesheet' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <ProfessionalBillingHub
            role="advocate"
            isLoading={loading}
            entries={entries}
            onAddEntry={() => router.push('/advocate/billing/log-time')}
            onEntryClick={(id) => router.push(`/advocate/billing/entries/${id}`)}
          />
        </div>
      )}

      {/* My Invoices section */}
      {activeSection === 'my_invoices' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Earned', value: fmt(totalEarned), icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
              { label: 'Pending Payment', value: fmt(totalPending), icon: Clock, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
              { label: 'Total Invoices', value: String(advInvoices.length), icon: Receipt, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
            ].map((c, i) => (
              <div key={i} className={`bg-white rounded-2xl border ${c.border} p-5 flex items-center gap-4 shadow-sm`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.color}`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{c.label}</p>
                  <p className="text-xl font-black text-gray-900 mt-0.5">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between bg-gray-50/50">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search invoices..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-400" />
              </div>
              <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 text-xs font-bold">
                {(['all', 'draft', 'submitted', 'approved', 'sent', 'paid'] as const).map(f => (
                  <button key={f} onClick={() => setStatusFilter(f)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-all ${statusFilter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-3">Invoice #</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Period / Client</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-6 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {advLoading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {[...Array(5)].map((_, j) => (
                          <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                        ))}
                      </tr>
                    ))
                  ) : displayed.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-semibold text-sm">No invoices found</p>
                      </td>
                    </tr>
                  ) : displayed.map(inv => (
                    <tr key={inv.id} onClick={() => openInvoice(inv)}
                      className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${selected?.id === inv.id ? 'bg-blue-50/40' : ''}`}>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{inv.invoice_number}</td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inv._type === 'client' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {inv._type === 'client' ? 'Client' : 'Advocate'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {inv._type === 'advocate' ? (
                          <><span>{inv.period_start}</span><span className="text-gray-400 mx-1">→</span><span>{inv.period_end}</span></>
                        ) : (
                          <span>{inv.client_name || inv.case_title || '—'}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-gray-900 text-right">{fmt(parseFloat(inv.total_amount || 0))}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${STATUS_STYLE[inv.status] || 'bg-gray-100 text-gray-500'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">{inv.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invoice view modal */}
      {selected && activeSection === 'my_invoices' && (
        <InvoiceViewModal
          invoice={selectedDetail || selected}
          loading={detailLoading}
          type={selected._type === 'advocate' ? 'advocate' : 'client'}
          onClose={() => { setSelected(null); setSelectedDetail(null); }}
        />
      )}
    </div>
  );
}
