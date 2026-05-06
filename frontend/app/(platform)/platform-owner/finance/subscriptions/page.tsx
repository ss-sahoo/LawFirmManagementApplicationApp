'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, X, Zap, Briefcase, Building2, Crown,
  Users, HardDrive, Calendar, CreditCard, Activity, Clock, ShieldCheck, Loader2, AlertCircle, Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTopbarTitle } from '@/components/platform/TopbarContext';
import { customFetch } from '@/lib/fetch';
import { API, SUBSCRIPTION_PLANS } from '@/lib/api';

const planMeta: Record<string, { icon: any; color: string; bg: string; features: string[] }> = {
  Trial: {
    icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50',
    features: ['Up to 5 Clients', 'Basic Case Management', 'Community Support', '1 GB Storage'],
  },
  Basic: {
    icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50',
    features: ['Up to 50 Clients', 'Full Case Management', 'Email Support', '10 GB Storage', 'Basic Invoicing'],
  },
  Business: {
    icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50',
    features: ['Unlimited Clients', 'Advanced Case Management', 'Priority Support', '100 GB Storage', 'Automated Billing', 'Advanced Reporting'],
  },
  Enterprise: {
    icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50',
    features: ['Unlimited Everything', 'Dedicated Account Manager', 'Unlimited Storage', 'Full API Access', 'White-labeling', 'Custom Domain'],
  },
};

export default function PlatformOwnerSubscriptionsPage() {
  useTopbarTitle('Subscriptions', 'View all subscription plans and firm-wise subscription status.');

  const [plans, setPlans] = useState<any[]>([]);
  const [firmSubs, setFirmSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'plans' | 'firms'>('firms');

  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, firmSubsRes] = await Promise.all([
          customFetch(API.SUBSCRIPTIONS.PLANS.LIST),
          customFetch('/api/subscriptions/firm-subscriptions/'),
        ]);
        if (plansRes.ok) {
          const d = await plansRes.json();
          setPlans(Array.isArray(d) ? d : (d.results || []));
        }
        if (firmSubsRes.ok) {
          const d = await firmSubsRes.json();
          setFirmSubs(Array.isArray(d) ? d : (d.results || []));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredFirms = firmSubs.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.firm_name?.toLowerCase().includes(q) || s.plan_name?.toLowerCase().includes(q);
  });

  const getStatusStyle = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'bg-emerald-100 text-emerald-700';
    if (s === 'expired' || s === 'suspended') return 'bg-red-100 text-red-700';
    if (s === 'trial') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-600';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fafafa] font-sans pb-10">
      <div className="w-full max-w-[1600px] mx-auto space-y-6">

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => setActiveTab('firms')}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'firms' ? 'bg-[#071526] text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Firm Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'plans' ? 'bg-[#071526] text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            All Plans
          </button>
        </div>

        {/* FIRM SUBSCRIPTIONS TAB */}
        {activeTab === 'firms' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Firm Subscriptions</h2>
                <p className="text-sm text-slate-400 font-medium">{firmSubs.length} firms on platform</p>
              </div>
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text" placeholder="Search firm or plan..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Firm</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFirms.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400 text-sm font-medium">
                        {search ? 'No firms match your search' : 'No firm subscriptions found'}
                      </td>
                    </tr>
                  ) : filteredFirms.map((sub, i) => (
                    <tr key={sub.id || i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="text-sm font-bold text-slate-900">{sub.firm_name || sub.firm || '—'}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-semibold text-slate-700">{sub.plan_name || sub.plan || '—'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${getStatusStyle(sub.status)}`}>
                          {sub.status || '—'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600 font-medium">{sub.start_date || '—'}</td>
                      <td className="py-4 px-6 text-sm text-slate-600 font-medium">{sub.end_date || '—'}</td>
                      <td className="py-4 px-6 text-sm font-black text-slate-900 text-right">
                        {sub.amount ? `₹${parseFloat(sub.amount).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/platform-owner/firms/${sub.firm}?tab=billing`}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ALL PLANS TAB */}
        {activeTab === 'plans' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Subscription Plans</h2>
              <p className="text-sm text-slate-400 font-medium">All available plans on the platform</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {(plans.length > 0 ? plans : SUBSCRIPTION_PLANS).map((plan: any, idx: number) => {
                const meta = planMeta[plan.name] || planMeta['Basic'];
                const Icon = meta.icon;
                const isPremium = plan.name === 'Enterprise';
                return (
                  <motion.div
                    key={plan.id || idx}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                    className={`relative rounded-2xl p-7 flex flex-col ${isPremium ? 'bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white' : 'bg-white border border-slate-100 shadow-sm'}`}
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <h3 className={`text-lg font-black ${isPremium ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                        <p className={`text-xs font-medium mt-1 ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>
                          {plan.description || meta.features[0]}
                        </p>
                      </div>
                      <div className={`p-2.5 rounded-xl ${isPremium ? 'bg-white/10' : meta.bg}`}>
                        <Icon className={`w-5 h-5 ${isPremium ? 'text-white' : meta.color}`} />
                      </div>
                    </div>

                    <div className="mb-5">
                      <span className={`text-3xl font-black ${isPremium ? 'text-white' : 'text-slate-900'}`}>
                        {isPremium || parseFloat(plan.price) === 0 && plan.name?.toLowerCase() === 'enterprise'
                          ? 'Custom'
                          : parseFloat(plan.price) === 0
                            ? 'Free'
                            : plan.price != null
                              ? `₹${parseFloat(plan.price).toLocaleString('en-IN')}`
                              : 'Custom'}
                      </span>
                      {(!isPremium && parseFloat(plan.price) > 0) && (
                        <span className="text-xs font-medium ml-1.5 text-slate-400">
                          /{plan.billing_cycle || 'month'}
                        </span>
                      )}
                      {isPremium && (
                        <p className="text-xs text-slate-400 mt-1">Contact us for pricing</p>
                      )}
                    </div>

                    <div className="space-y-2.5 flex-1">
                      {/* Real limits from API */}
                      {[
                        { label: `Max Advocates`, value: plan.max_advocates != null ? (plan.max_advocates >= 999 ? 'Unlimited' : plan.max_advocates) : null },
                        { label: `Max Paralegals`, value: plan.max_paralegals != null ? (plan.max_paralegals >= 999 ? 'Unlimited' : plan.max_paralegals) : null },
                        { label: `Max Admins`, value: plan.max_admins != null ? (plan.max_admins >= 999 ? 'Unlimited' : plan.max_admins) : null },
                        { label: `Max Users`, value: plan.max_users != null ? (plan.max_users >= 999 ? 'Unlimited' : plan.max_users) : null },
                        { label: `Max Clients`, value: plan.max_clients != null ? (plan.max_clients >= 999 ? 'Unlimited' : plan.max_clients) : null },
                        { label: `Max Cases`, value: plan.max_cases != null ? (plan.max_cases >= 999 ? 'Unlimited' : plan.max_cases) : null },
                        { label: `Max Branches`, value: plan.max_branches != null ? (plan.max_branches >= 999 ? 'Unlimited' : plan.max_branches) : null },
                        { label: `Storage`, value: plan.max_storage_gb != null ? (plan.max_storage_gb >= 999 ? 'Unlimited' : `${plan.max_storage_gb} GB`) : null },
                      ].filter(r => r.value !== null).map((row, fi) => (
                        <div key={fi} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isPremium ? 'text-emerald-400' : 'text-emerald-500'}`} />
                            <span className={`text-xs font-medium ${isPremium ? 'text-slate-300' : 'text-slate-600'}`}>{row.label}</span>
                          </div>
                          <span className={`text-xs font-black ${isPremium ? 'text-white' : 'text-slate-900'}`}>{row.value}</span>
                        </div>
                      ))}

                      {/* Feature toggles */}
                      <div className={`mt-3 pt-3 border-t ${isPremium ? 'border-white/10' : 'border-slate-100'} grid grid-cols-2 gap-1.5`}>
                        {[
                          { label: 'Billing', on: plan.enable_billing },
                          { label: 'Calendar', on: plan.enable_calendar },
                          { label: 'Documents', on: plan.enable_documents },
                          { label: 'Reports', on: plan.enable_reports },
                          { label: 'API Access', on: plan.enable_api_access },
                        ].map((f, fi) => (
                          <div key={fi} className="flex items-center gap-1.5">
                            {f.on
                              ? <CheckCircle2 className={`w-3 h-3 shrink-0 ${isPremium ? 'text-emerald-400' : 'text-emerald-500'}`} />
                              : <X className={`w-3 h-3 shrink-0 ${isPremium ? 'text-slate-600' : 'text-slate-300'}`} />
                            }
                            <span className={`text-[11px] font-medium ${f.on ? (isPremium ? 'text-slate-200' : 'text-slate-700') : (isPremium ? 'text-slate-500' : 'text-slate-400')}`}>
                              {f.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`mt-6 pt-5 border-t ${isPremium ? 'border-white/10' : 'border-slate-100'}`}>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className={isPremium ? 'text-slate-400' : 'text-slate-500'}>Active firms</span>
                        <span className={isPremium ? 'text-white' : 'text-slate-900'}>
                          {firmSubs.filter(s => (s.plan_name || s.plan) === plan.name && s.status === 'active').length}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}