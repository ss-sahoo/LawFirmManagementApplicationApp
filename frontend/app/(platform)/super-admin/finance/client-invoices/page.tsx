'use client';

import React, { useState } from 'react';
import { useTopbarTitle } from '@/components/platform/TopbarContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Search, Filter, Download,
  MoreHorizontal, Eye, Send, X, PlusCircle,
  Trash2, Mail, FileDown, Edit, DollarSign,
  AlertCircle, ChevronRight, CheckCircle2, ChevronLeft
} from 'lucide-react';

const mockInvoices = [
  { id: 'DI-INV-2026008', date: '2026-03-30', client: 'Anthem Global Technology Services Private Limited', amount: 'US$445.00', status: 'Overdue', age: '21d' },
  { id: 'DI-INV-2026007', date: '2026-03-30', client: 'Anthem Global Technology Services Private Limited', amount: 'US$2,345.00', status: 'Overdue', age: '21d' },
  { id: 'DI-INV-2026006', date: '2026-01-21', client: 'Anthem Global Technology Services Private Limited', amount: 'US$3,34,347.10', status: 'Overdue', age: '89d' },
  { id: 'INV-0009', date: '2025-12-30', client: 'Anthem Global Technology Services Private Limited', amount: '₹14,56,763.10', status: 'Overdue', age: '111d' },
  { id: 'DI-INV24063', date: '2025-12-29', client: 'Anthem Global Technology Services Private Limited', amount: 'US$23,600.00', status: 'Paid', age: '' },
  { id: 'DI-INV24062', date: '2025-12-29', client: 'Anthem Global Technology Services Private Limited', amount: 'US$23,600.00', status: 'Overdue', age: '' },
];

export default function ClientInvoicesPage() {
  useTopbarTitle('Client Invoices', 'Manage invoicing history and generate new client bills.');

  // Layout State: 'full' (tabs) or 'split' (master-detail)
  const [viewMode, setViewMode] = useState<'full' | 'split'>('full');
  
  // Tab State for when in 'full' mode
  const [activeTab, setActiveTab] = useState<'history' | 'create'>('history');
  
  // Selected Invoice for Split Mode
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // State for Invoice Creation Form
  const [lineItems, setLineItems] = useState([
    { id: 1, description: '', qty: 1, rate: 0 }
  ]);

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now(), description: '', qty: 1, rate: 0 }]);
  };

  const removeLineItem = (id: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
  };

  return (
    <div className={`font-sans ${viewMode === 'split' ? 'h-[calc(100vh-64px)] overflow-hidden flex' : 'min-h-[calc(100vh-64px)] bg-[#fafafa] p-2 md:p-4 lg:p-1'}`}>
      
      {/* -------------------- FULL MODE / INITIAL VIEW -------------------- */}
      {viewMode === 'full' && (
        <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-10">
          
          {/* Top Navigation Tabs */}
          <div className="flex items-center gap-8 border-b border-slate-200 mb-6 px-2">
             {[
               { id: 'history', label: 'Invoice History' },
               { id: 'create', label: 'Create Invoice' }
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as 'history' | 'create')}
                 className={`py-3 text-[15px] font-semibold transition-all relative ${
                   activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                 }`}
               >
                 {tab.label}
                 {activeTab === tab.id && (
                   <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-blue-600 rounded-t-full" />
                 )}
               </button>
             ))}
          </div>

          <div className="mt-6">
            <AnimatePresence mode="wait">

              {/* INVOICE HISTORY TAB */}
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search invoices or clients..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
                      />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                      </button>
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors">
                        <Download className="w-4 h-4" /> Export
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice #</th>
                          <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                          <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                          <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                          <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mockInvoices.map((inv, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                            <td className="py-4 px-6 text-sm font-medium text-slate-500">{new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                            <td className="py-4 px-6 text-sm font-bold text-slate-900">{inv.id}</td>
                            <td className="py-4 px-6 text-sm font-bold text-slate-700 max-w-[200px] truncate">{inv.client}</td>
                            <td className="py-4 px-6 text-sm font-black text-slate-900 text-right">{inv.amount}</td>
                            <td className="py-4 px-6 flex justify-center">
                              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center justify-center w-24 tracking-wide uppercase ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                inv.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                                  inv.status === 'Draft' ? 'bg-slate-100 text-slate-600' :
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2 transition-opacity">
                                <button 
                                  onClick={() => { setSelectedInvoice(inv); setViewMode('split'); }}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Invoice">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Send Email">
                                  <Send className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Download PDF">
                                  <FileDown className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <p className="text-sm font-medium text-slate-500">Showing <span className="font-bold text-slate-900">1</span> to <span className="font-bold text-slate-900">6</span> of <span className="font-bold text-slate-900">24</span> invoices</p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 text-slate-600">Previous</button>
                      <button className="px-3 py-1.5 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600">Next</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CREATE INVOICE TAB */}
              {activeTab === 'create' && (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900">New Invoice</h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">Fill out the details below to generate a new bill.</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Invoice Number</p>
                        <p className="text-xl font-black text-slate-900">INV-2026-093</p>
                      </div>
                    </div>

                    <div className="p-6 md:p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Billed To (Client)</label>
                          <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors">
                            <option value="">Select a client...</option>
                            <option value="1">Reliance Industries</option>
                            <option value="2">Maruti Suzuki</option>
                            <option value="3">Tata Consultancy</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Issue Date</label>
                            <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Due Date</label>
                            <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" /> Line Items
                        </h3>
                        <div className="grid grid-cols-12 gap-4 px-4 bg-slate-50 py-3 rounded-xl border border-slate-200">
                          <div className="col-span-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</div>
                          <div className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Qty / Hrs</div>
                          <div className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Rate (₹)</div>
                          <div className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</div>
                        </div>
                        <div className="space-y-3">
                          {lineItems.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-12 gap-4 items-center group">
                              <div className="col-span-6">
                                <input
                                  type="text"
                                  placeholder="Service description..."
                                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:border-blue-500"
                                  value={item.description}
                                  onChange={(e) => {
                                    const newItems = [...lineItems];
                                    newItems[index].description = e.target.value;
                                    setLineItems(newItems);
                                  }}
                                />
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="number"
                                  min="1"
                                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-center focus:outline-none focus:ring-2 focus:border-blue-500"
                                  value={item.qty}
                                  onChange={(e) => {
                                    const newItems = [...lineItems];
                                    newItems[index].qty = parseFloat(e.target.value) || 0;
                                    setLineItems(newItems);
                                  }}
                                />
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="number"
                                  min="0"
                                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-right focus:outline-none focus:ring-2 focus:border-blue-500"
                                  value={item.rate}
                                  onChange={(e) => {
                                    const newItems = [...lineItems];
                                    newItems[index].rate = parseFloat(e.target.value) || 0;
                                    setLineItems(newItems);
                                  }}
                                />
                              </div>
                              <div className="col-span-2 flex items-center justify-end gap-3">
                                <span className="text-sm font-bold text-slate-900">
                                  ₹{(item.qty * item.rate).toLocaleString('en-IN')}
                                </span>
                                <button
                                  onClick={() => removeLineItem(item.id)}
                                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={addLineItem}
                          className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 py-2 px-1 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4" /> Add Item
                        </button>
                      </div>

                      <div className="flex justify-end pt-6 border-t border-slate-100">
                        <div className="w-full md:w-1/2 lg:w-1/3 space-y-4">
                          <div className="flex justify-between items-center text-sm font-semibold text-slate-500">
                            <span>Subtotal</span>
                            <span>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-semibold text-slate-500">
                            <span>Tax (GST 18%)</span>
                            <span>₹{(calculateSubtotal() * 0.18).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                            <span className="text-lg font-bold text-slate-900">Total</span>
                            <span className="text-2xl font-black text-slate-900">₹{(calculateSubtotal() * 1.18).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-end items-center gap-3">
                      <button className="w-full md:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-100 transition-colors">
                        Save as Draft
                      </button>
                      <button className="w-full md:w-auto flex justify-center items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md transition-all">
                        <Mail className="w-4 h-4" /> Save & Send
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      )}

      {/* -------------------- SPLIT VIEW MODE -------------------- */}
      {viewMode === 'split' && (
        <>
          {/* LEFT PANEL - Master List */}
          <div className="w-[380px] shrink-0 border-r border-slate-200 flex flex-col bg-[#fdfdfd] z-10 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.05)] relative">
            <div className="p-4 border-b border-slate-100 bg-white">
              <button 
                onClick={() => { setViewMode('full'); setSelectedInvoice(null); }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors mb-3"
              >
                <ChevronLeft className="w-4 h-4"/> Back to Dashboard
              </button>
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-[22px] font-black text-slate-900 tracking-tight">Invoices</h2>
              </div>
              <p className="text-[13px] text-slate-500 font-semibold mb-4">{mockInvoices.length} invoices total</p>
              
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-slate-500">Sort:</span>
                <select className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option>Date</option>
                  <option>Amount</option>
                  <option>Status</option>
                </select>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-1.5 styled-scrollbars">
              {mockInvoices.map(inv => {
                 const isSelected = selectedInvoice?.id === inv.id;
                 return (
                   <div 
                     key={inv.id}
                     onClick={() => setSelectedInvoice(inv)}
                     className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                       isSelected 
                       ? 'bg-blue-50/50 border-blue-600/30 shadow-[inset_4px_0_0_0_#2563eb]' 
                       : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50/50'
                     }`}
                   >
                     <div className="flex justify-between items-start mb-1.5">
                        <h3 className={`text-[15px] font-black tracking-tight ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{inv.amount}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${inv.status === 'Paid' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {inv.status}
                        </span>
                     </div>
                     <p className="text-[13px] font-bold text-slate-700 leading-snug line-clamp-1 mb-1">{inv.client}</p>
                     <p className="text-[11px] font-semibold text-slate-400">{inv.id}</p>
                     <div className="flex justify-between items-end mt-2">
                       <p className="text-[11px] text-slate-400 font-semibold">{inv.date}</p>
                       {inv.age && (
                         <p className="text-[11px] font-bold text-red-500 flex items-center gap-0.5">
                           {inv.age} <ChevronRight className="w-3 h-3"/>
                         </p>
                       )}
                     </div>
                   </div>
                 )
              })}
            </div>
            
            <div className="p-3 border-t border-slate-200 flex justify-between items-center bg-white shadow-[0_-4px_10px_-10px_rgba(0,0,0,0.1)]">
              <span className="text-[11px] font-bold text-slate-400">Page 1 of 2</span>
              <div className="flex gap-1.5">
                <button className="px-2.5 py-1 text-[11px] font-bold border border-slate-200 rounded text-slate-400 bg-slate-50 cursor-not-allowed">Prev</button>
                <button className="px-2.5 py-1 text-[11px] font-bold border border-slate-200 rounded hover:bg-slate-50 text-slate-700 transition-colors">Next</button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - A4 Document Overlay */}
          <div className="flex-1 flex flex-col bg-[#f0f2f5] overflow-hidden relative">
             <AnimatePresence mode="wait">
                {selectedInvoice && (
                  <motion.div 
                    key="view"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col h-full absolute inset-0"
                  >
                    <div className="bg-white border-b border-slate-200 shrink-0 z-10 shadow-sm">
                       <div className="p-4 md:px-6 flex justify-between items-start border-b border-slate-100">
                          <div className="flex items-start gap-4">
                             <button 
                               onClick={() => { setViewMode('full'); setSelectedInvoice(null); }}
                               className="mt-1 p-1 hover:bg-slate-100 rounded-md text-slate-400 hidden lg:block" title="Close Preview">
                                <X className="w-5 h-5"/>
                             </button>
                             <div>
                               <div className="flex items-center gap-3">
                                 <h2 className="text-xl font-black text-slate-900 leading-none">{selectedInvoice.id}</h2>
                               </div>
                               <div className="flex items-center gap-3 mt-2">
                                  <p className="text-[13px] font-bold text-slate-600 leading-none">{selectedInvoice.client}</p>
                                  {selectedInvoice.status === 'Overdue' && (
                                     <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-600 rounded-md border border-red-100 flex items-center gap-1 leading-none">
                                        <AlertCircle className="w-3 h-3" /> Overdue by {selectedInvoice.age.replace('d','')} days
                                     </span>
                                  )}
                                  {selectedInvoice.status === 'Paid' && (
                                     <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 flex items-center gap-1 leading-none">
                                        <CheckCircle2 className="w-3 h-3" /> Paid in full
                                     </span>
                                  )}
                               </div>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                             <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-lg transition-colors">
                               <Edit className="w-3.5 h-3.5"/> Edit
                             </button>
                             <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300 rounded-lg transition-colors">
                               <DollarSign className="w-3.5 h-3.5"/> Payment
                             </button>
                             <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-colors">
                               <FileDown className="w-3.5 h-3.5"/> Save PDF
                             </button>
                             <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors">
                               <FileText className="w-3.5 h-3.5"/> CSV
                             </button>
                             <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-lg transition-colors">
                               <Trash2 className="w-3.5 h-3.5"/> Delete
                             </button>
                          </div>
                       </div>
                       
                       <div className="px-6 py-3 flex justify-between items-center text-xs bg-slate-50/50">
                          <div className="flex gap-6 text-slate-500 font-semibold tracking-wide">
                            <span>Created: <span className="text-slate-800">2026-03-30</span></span>
                            <span>Due: <span className="text-slate-800">2026-04-06</span></span>
                          </div>
                          <div className="flex gap-5 text-slate-500 font-bold tracking-wide items-center">
                            <span>Paid: <span className="text-emerald-600">US$0.00</span></span>
                            <span>Due: <span className="text-red-500">{selectedInvoice.amount}</span></span>
                            <span className="text-slate-900 border-l border-slate-300 pl-5 text-[14px]">Total: <span className="font-black">{selectedInvoice.amount}</span></span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center custom-scrollbar pb-20">
                       <div className="w-[850px] min-h-[1130px] bg-white shadow-2xl border border-slate-200/60 p-12 shrink-0 rounded-sm relative">
                           <div className="absolute inset-4 border border-slate-300 pointer-events-none rounded-[1px]"></div>
                           
                           <div className="relative z-10 p-4">
                             <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                                <div className="flex items-center gap-4">
                                   <div className="w-20 h-20 bg-[#1e40af] text-white flex items-center justify-center text-4xl font-black rounded-lg shadow-sm">Di</div>
                                   <div>
                                     <h1 className="text-xl font-black text-slate-900 leading-none mb-1.5">DiracAI Private Limited</h1>
                                     <p className="text-[11px] font-semibold text-slate-600 leading-snug">
                                       HIG-306, K-5, Kalinga Vihar, Bhubaneswar, Odisha, India<br/>
                                       GSTIN: 21AAJCD2715R1ZH<br/>
                                       bibhuprasad@gmail.com • 08847806814
                                     </p>
                                   </div>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-wider uppercase mt-1">Tax Invoice</h2>
                             </div>
                             
                             <div className="grid grid-cols-2 text-xs border border-slate-900 mb-8">
                               <div className="border-r border-slate-900 p-3.5 bg-slate-50/50">
                                 <p className="font-bold text-slate-500 uppercase text-[10px] mb-1.5 tracking-wider">Invoice Details</p>
                                 <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1 font-bold text-slate-800">
                                    <span className="text-slate-600">Invoice #:</span> <span>{selectedInvoice.id}</span>
                                    <span className="text-slate-600">Invoice Date:</span> <span>30-03-2026</span>
                                    <span className="text-slate-600">Due Date:</span> <span>06-04-2026</span>
                                 </div>
                               </div>
                               <div className="p-3.5">
                                 <p className="font-bold text-slate-500 uppercase text-[10px] mb-1.5 tracking-wider">Place of Supply</p>
                                 <p className="font-bold text-slate-800 text-[13px]">Odisha</p>
                               </div>
                               <div className="border-t border-r border-slate-900 p-3.5">
                                 <p className="font-bold text-slate-500 uppercase text-[10px] mb-1.5 tracking-wider">Bill To</p>
                                 <p className="font-black text-slate-800 mb-1 leading-snug tracking-tight text-[13px] pr-8">{selectedInvoice.client}</p>
                                 <p className="text-[11px] font-semibold text-slate-600 mb-1.5 max-w-[300px] leading-relaxed">Anthem Tower IDCO Plot No. N24, 25, 26 & 27, New IT Zone, Chandaka Industrial Estate, 751024</p>
                                 <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Phone: 987654321 • Email: anthem@global.com<br/>GSTIN: 21AAHCA9577G1ZJ<br/>State: Odisha</p>
                               </div>
                               <div className="border-t border-slate-900 p-3.5">
                                 <p className="font-bold text-slate-500 uppercase text-[10px] mb-1.5 tracking-wider">Ship To</p>
                                 <p className="font-black text-slate-800 mb-1 leading-snug tracking-tight text-[13px] pr-8">{selectedInvoice.client}</p>
                                 <p className="text-[11px] font-semibold text-slate-600 mb-1.5 max-w-[300px] leading-relaxed">Anthem Tower IDCO Plot No. N24, 25, 26 & 27, New IT Zone, Chandaka Industrial Estate, 751024</p>
                                 <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Phone: 987654321 • Email: anthem@global.com<br/>GSTIN: 21AAHCA9577G1ZJ<br/>State: Odisha</p>
                               </div>
                             </div>
                             
                             <table className="w-full text-xs text-left border-collapse border border-slate-900 mb-8">
                                <thead>
                                  <tr className="border-b border-slate-900 bg-slate-50/50">
                                    <th className="p-2.5 border-r border-slate-900 font-bold w-12 text-center tracking-wider">#</th>
                                    <th className="p-2.5 border-r border-slate-900 font-bold tracking-wider">Item & Description</th>
                                    <th className="p-2.5 border-r border-slate-900 font-bold w-24 text-center tracking-wider">HSN / SAC</th>
                                    <th className="p-2.5 border-r border-slate-900 font-bold w-16 text-center tracking-wider">Qty</th>
                                    <th className="p-2.5 border-r border-slate-900 font-bold w-28 text-right tracking-wider">Rate</th>
                                    <th className="p-2.5 font-bold w-32 text-right tracking-wider">Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-slate-900">
                                     <td className="p-3 border-r border-slate-900 text-center font-bold text-slate-700 font-mono">1</td>
                                     <td className="p-3 border-r border-slate-900 font-black text-slate-800 tracking-tight">
                                       ODISHA<br/>
                                       <span className="font-semibold text-slate-500 text-[10px] tracking-normal">Software services layout design UI testing</span>
                                     </td>
                                     <td className="p-3 border-r border-slate-900 text-center font-bold text-slate-600">—</td>
                                     <td className="p-3 border-r border-slate-900 text-center font-bold text-slate-900">1</td>
                                     <td className="p-3 border-r border-slate-900 text-right font-bold text-slate-900">{selectedInvoice.amount}</td>
                                     <td className="p-3 text-right font-black text-slate-900">{selectedInvoice.amount}</td>
                                  </tr>
                                </tbody>
                             </table>
                             
                             <div className="flex">
                               <div className="flex-1 pr-12 pt-1">
                                 <p className="font-bold text-slate-500 uppercase text-[10px] mb-1 tracking-wider">Amount (in words):</p>
                                 <p className="text-[13px] font-bold italic text-slate-800 mb-8 border-b border-slate-200 pb-2">Four Hundred and Forty Five Dollars Only</p>
                                 <p className="font-bold text-slate-500 uppercase text-[10px] mb-1 tracking-wider">Notes</p>
                                 <p className="text-[11px] font-bold text-slate-700 mb-5">Thanks for your business!</p>
                                 <p className="font-bold text-slate-500 uppercase text-[10px] mb-1 tracking-wider">Terms & Conditions</p>
                                 <p className="text-[11px] font-bold text-slate-700">Payment due within 7 days.</p>
                               </div>
                               
                               <div className="w-[300px] text-xs">
                                  <div className="flex justify-between py-2 border-b border-slate-300 font-bold text-slate-700">
                                     <span className="text-slate-600 tracking-wide uppercase text-[10px]">Sub Total</span><span>{selectedInvoice.amount}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b border-slate-300 font-bold text-slate-700">
                                     <span className="text-slate-600 tracking-wide uppercase text-[10px]">Discount</span><span>- US$0.00</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b border-slate-300 font-black text-slate-900 text-[13px]">
                                     <span className="tracking-wide uppercase text-[11px]">Total</span><span>{selectedInvoice.amount}</span>
                                  </div>
                                  <div className="flex justify-between items-center py-4 font-black text-slate-900 bg-slate-100/50 px-3 mt-2 border border-slate-900">
                                     <span className="tracking-widest uppercase text-xs">Balance Due</span>
                                     <span className="text-lg">{selectedInvoice.amount}</span>
                                  </div>
                               </div>
                             </div>
                             
                           </div>
                       </div>
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </>
      )}

    </div>
  );
}
