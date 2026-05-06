'use client';

import { useState, useEffect } from 'react';
import { useTopbarTitle } from '@/components/platform/TopbarContext';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';
import InvoiceViewModal from '@/components/InvoiceViewModal';
import {
  FileText, Search, IndianRupee, Clock, CheckCircle2,
  AlertCircle, ChevronLeft, ChevronRight, Loader2, CreditCard,
} from 'lucide-react';

const STATUS_STYLE: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-sky-100 text-sky-700',
  overdue: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-500',
  partially_paid: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-gray-200 text-gray-500',
};

function fmt(n: number) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

export default function ClientInvoicesPage() {
  useTopbarTitle('My Invoices', 'View and pay your invoices.');

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid' | 'overdue'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const openInvoice = async (inv: any) => {
    setSelected(inv);
    setSelectedDetail(null);
    setDetailLoading(true);
    try {
      const res = await customFetch(API.BILLING.INVOICES.DETAIL(inv.id));
      if (res.ok) setSelectedDetail(await res.json());
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      let url = `${API.BILLING.INVOICES.LIST}?page=${page}`;
      if (filter === 'paid') url += '&status=paid';
      else if (filter === 'overdue') url = API.BILLING.INVOICES.OVERDUE;
      else if (filter === 'unpaid') url = API.BILLING.INVOICES.UNPAID;

      const res = await customFetch(url);
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data) ? data : (data.results || []);
        setInvoices(results);
        setTotal(data.count || results.length);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, [page, filter]);

  const displayed = invoices.filter(inv => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return inv.invoice_number?.toLowerCase().includes(q) || inv.client_name?.toLowerCase().includes(q);
  });

  // Summary stats
  const totalDue = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((s, i) => s + parseFloat(i.balance_due || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid')
    .reduce((s, i) => s + parseFloat(i.total_amount || 0), 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  const handlePayNow = async (inv: any) => {
    const method = prompt('Payment method (e.g. upi, bank_transfer, card):', 'upi');
    if (!method) return;
    const txn = prompt('Transaction / Reference ID:', '') || '';
    setPaying(true);
    try {
      const res = await customFetch(`${API.BILLING.INVOICES.DETAIL(inv.id)}mark_paid/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(inv.balance_due),
          payment_method: method,
          transaction_id: txn,
          payment_date: new Date().toISOString().split('T')[0],
        }),
      });
      if (res.ok) {
        alert('Payment recorded successfully!');
        fetchInvoices();
        if (selected?.id === inv.id) setSelected({ ...selected, status: 'paid' });
      } else {
        const err = await res.json();
        alert(err.error || 'Payment failed');
      }
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Due', value: fmt(totalDue), icon: IndianRupee, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
          { label: 'Total Paid', value: fmt(totalPaid), icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
          { label: 'Overdue', value: `${overdueCount} invoice${overdueCount !== 1 ? 's' : ''}`, icon: AlertCircle, color: 'bg-red-50 text-red-600', border: 'border-red-100' },
        ].map((c, i) => (
          <div key={i} className={`bg-white rounded-2xl border ${c.border} p-5 flex items-center gap-4 shadow-sm`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{c.label}</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between bg-gray-50/50">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search invoices..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-400" />
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 text-xs font-bold">
            {(['all', 'unpaid', 'paid', 'overdue'] as const).map(f => (
              <button key={f} onClick={() => { setFilter(f); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${filter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page}</span>
            <button disabled={invoices.length < 10} onClick={() => setPage(p => p + 1)}
              className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="ml-1">{total} total</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Balance Due</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-semibold text-sm">No invoices found</p>
                  </td>
                </tr>
              ) : displayed.map(inv => (
                <tr key={inv.id} onClick={() => openInvoice(inv)}
                  className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${selected?.id === inv.id ? 'bg-blue-50/40' : ''}`}>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{inv.invoice_number}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{inv.invoice_date}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{inv.due_date}</td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-900 text-right">{fmt(parseFloat(inv.total_amount || 0))}</td>
                  <td className="px-4 py-4 text-sm font-bold text-right">
                    <span className={parseFloat(inv.balance_due) > 0 ? 'text-red-600' : 'text-emerald-600'}>
                      {fmt(parseFloat(inv.balance_due || 0))}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${STATUS_STYLE[inv.status] || 'bg-gray-100 text-gray-500'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                      <button onClick={e => { e.stopPropagation(); handlePayNow(inv); }}
                        disabled={paying}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all ml-auto disabled:opacity-50">
                        <CreditCard className="w-3.5 h-3.5" /> Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice view modal */}
      {selected && (
        <InvoiceViewModal
          invoice={selectedDetail || selected}
          loading={detailLoading}
          type="client"
          onClose={() => { setSelected(null); setSelectedDetail(null); }}
        />
      )}
    </div>
  );
}
