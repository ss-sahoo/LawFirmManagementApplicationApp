'use client';

import React, { useRef } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import InvoiceDefaultTemplate from './InvoiceDefaultTemplate';

interface InvoiceViewModalProps {
  invoice: any;          // full detail object from API
  onClose: () => void;
  loading?: boolean;
  /** 'client' invoice or 'advocate' invoice */
  type?: 'client' | 'advocate';
}

function buildInvoiceData(invoice: any, type: 'client' | 'advocate') {
  if (type === 'advocate') {
    // AdvocateInvoice — bill from advocate to firm
    const items = invoice.time_entries_detail?.length
      ? invoice.time_entries_detail.map((e: any, i: number) => ({
          id: e.id || i,
          name: e.activity_type || 'Service',
          desc: e.description,
          qty: Number(e.hours),
          price: Number(e.hourly_rate),
        }))
      : [{
          id: 1,
          name: 'Professional Services',
          desc: `Billing Period: ${invoice.period_start} to ${invoice.period_end}`,
          qty: 1,
          price: Number(invoice.subtotal || invoice.total_amount || 0),
        }];

    return {
      data: {
        number: invoice.invoice_number,
        date: invoice.invoice_date,
        due: invoice.period_end,
        currency: 'INR',
        to: {
          name: invoice.firm_name || '—',
          email: invoice.firm_email || '',
        },
        taxTypes: {},
        discountMode: 'AMOUNT',
        discountAmountManual: 0,
        notes: invoice.notes || '',
        terms: 'Please process payment upon approval.',
        placeOfSupply: 'India',
        items,
      },
      profile: {
        company: invoice.advocate_name || 'Advocate',
        email: invoice.advocate_email || '',
        address: '',
      },
      subtotal: Number(invoice.subtotal || 0),
      taxOverride: Number(invoice.tax_amount || 0),
      taxLabelOverride: `Tax (${Number(invoice.tax_percentage || 0)}%)`,
      totalAmountOverride: Number(invoice.total_amount || 0),
      paymentInfo: {
        paid_amount: invoice.status === 'paid' ? Number(invoice.total_amount || 0) : 0,
        outstanding_amount: invoice.status === 'paid' ? 0 : Number(invoice.total_amount || 0),
      },
    };
  }

  // Client Invoice
  const timeItems = invoice.time_entries_detail?.map((e: any, i: number) => ({
    id: e.id || i,
    name: e.activity_type || 'Legal Service',
    desc: e.description,
    qty: Number(e.hours),
    price: Number(e.hourly_rate),
  })) || [];

  const expenseItems = invoice.expenses_detail?.map((e: any, i: number) => ({
    id: `exp-${i}`,
    name: e.expense_type || 'Expense',
    desc: e.description,
    qty: 1,
    price: Number(e.billable_amount || e.amount || 0),
  })) || [];

  const items = [...timeItems, ...expenseItems].length
    ? [...timeItems, ...expenseItems]
    : [{
        id: 1,
        name: invoice.case_title || 'Legal Services',
        desc: `Invoice for ${invoice.client_name || 'Client'}`,
        qty: 1,
        price: Number(invoice.subtotal || invoice.total_amount || 0),
      }];

  return {
    data: {
      number: invoice.invoice_number,
      date: invoice.invoice_date,
      due: invoice.due_date,
      currency: 'INR',
      to: {
        name: invoice.client_name || '—',
        email: invoice.client_email || '',
      },
      taxTypes: {},
      discountMode: 'AMOUNT',
      discountAmountManual: Number(invoice.discount_amount || 0),
      notes: invoice.notes || '',
      terms: invoice.terms_and_conditions || 'Please pay within 30 days.',
      placeOfSupply: 'India',
      items,
    },
    profile: {
      company: invoice.firm_name || invoice.branch_name || 'Law Firm',
      email: invoice.firm_email || '',
      address: invoice.firm_address || '',
    },
    subtotal: Number(invoice.subtotal || 0),
    taxOverride: Number(invoice.tax_amount || 0),
    taxLabelOverride: `Tax (${Number(invoice.tax_percentage || 0)}%)`,
    totalAmountOverride: Number(invoice.total_amount || 0),
    paymentInfo: {
      paid_amount: Number(invoice.paid_amount || 0),
      outstanding_amount: Number(invoice.balance_due || 0),
    },
  };
}

export default function InvoiceViewModal({ invoice, onClose, loading = false, type = 'client' }: InvoiceViewModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = printRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${invoice.invoice_number}</title>
          <meta charset="utf-8" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: white; font-family: Arial, sans-serif; }
            @page { size: A4; margin: 0; }
            @media print {
              body { width: 210mm; }
              .invoice-page { width: 210mm !important; min-height: 297mm !important; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const invoiceProps = invoice ? buildInvoiceData(invoice, type) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-gray-50">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {type === 'advocate' ? 'Advocate Invoice' : 'Tax Invoice'}
            </p>
            <h2 className="text-lg font-black text-gray-900">{invoice?.invoice_number}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={loading || !invoice}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Invoice preview */}
        <div className="flex-1 overflow-y-auto bg-[#f0f2f5] p-6">
          {loading || !invoiceProps ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div ref={printRef} className="flex justify-center">
              <InvoiceDefaultTemplate
                data={invoiceProps.data}
                profile={invoiceProps.profile}
                subtotal={invoiceProps.subtotal}
                perLineTax={[]}
                taxOverride={invoiceProps.taxOverride as any}
                taxLabelOverride={invoiceProps.taxLabelOverride as any}
                totalAmountOverride={invoiceProps.totalAmountOverride as any}
                fmt={(v: number) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                previewOpen={true}
                showTotals={true}
                paymentInfo={invoiceProps.paymentInfo}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
