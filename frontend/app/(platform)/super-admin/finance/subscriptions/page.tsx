'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, X, ChevronRight, Zap, Briefcase, Building2, Crown,
  Sparkles, Users, HardDrive, Calendar, CreditCard, Activity, Clock, ShieldCheck, Loader2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTopbarTitle } from '@/components/platform/TopbarContext';
import { customFetch } from '@/lib/fetch';
import { API, SUBSCRIPTION_PLANS } from '@/lib/api';

const planDetails = {
  'Trial': {
    description: 'Perfect to explore and test the platform features.',
    icon: Zap,
    features: ['Up to 5 Clients limit', 'Basic Case Management', 'Community Support', '1 GB secure storage'],
    missingFeatures: ['Automated Billing', 'Advanced Reporting', 'API Access', 'White-labeling'],
    buttonVariant: 'outline',
    highlighted: false,
    isPremium: false,
  },
  'Basic': {
    description: 'Essential tools for independent advocates.',
    icon: Briefcase,
    features: ['Up to 50 Clients', 'Full Case Management', 'Email Support', '10 GB secure storage', 'Basic Invoicing'],
    missingFeatures: ['Advanced Reporting', 'API Access', 'White-labeling'],
    buttonVariant: 'secondary',
    highlighted: false,
    isPremium: false,
  },
  'Business': {
    description: 'Comprehensive suite for growing law firms.',
    icon: Building2,
    features: ['Unlimited Clients', 'Advanced Case Management', 'Priority 24/7 Support', '100 GB secure storage', 'Automated Billing', 'Advanced Reporting'],
    missingFeatures: ['White-labeling'],
    buttonVariant: 'primary',
    highlighted: true,
    isPremium: false,
  },
  'Enterprise': {
    description: 'Custom solutions for large legal enterprises.',
    icon: Crown,
    features: ['Unlimited Everything', 'Dedicated Account Manager', 'Unlimited secure storage', 'Automated Billing', 'Advanced Custom Reporting', 'Full API Access', 'White-labeling & Custom Domain'],
    missingFeatures: [],
    buttonVariant: 'premium',
    highlighted: false,
    isPremium: true,
  }
};

const mergedPlans = SUBSCRIPTION_PLANS.map(plan => ({
  ...plan,
  ...(planDetails[plan.name as keyof typeof planDetails] || planDetails['Basic'])
}));

interface CurrentSubscription {
  plan_name: string;
  price: string;
  status: string;
  renewal_date: string;
  days_left: number;
  users_added: number;
  max_users: number;
  storage_gb: number;
  max_storage_gb: number;
}

export default function SubscriptionsPage() {
  useTopbarTitle('Subscription Management', 'Manage your active plan, monitor usage metrics, and upgrade your scale.');

  const [activeTab, setActiveTab] = useState<'current' | 'upgrade'>('current');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      setLoading(true);
      const res = await customFetch(API.SUBSCRIPTIONS.STATUS).catch(() => null);
      
      if (res && res.ok) {
        const statusData = await res.json();
        
        // Find price from static plans
        const matchedPlan = SUBSCRIPTION_PLANS.find(p => p.name === statusData.plan_name);
        const priceString = matchedPlan ? matchedPlan.price : '₹2,499';
        
        // Calculate days left
        let daysLeft = 0;
        if (statusData.end_date) {
            const endDate = new Date(statusData.end_date);
            const today = new Date();
            const diffTime = Math.max(0, endDate.getTime() - today.getTime());
            daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        const renewalDateStr = statusData.end_date 
            ? new Date(statusData.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : 'N/A';

        setCurrentSub({
          plan_name: statusData.plan_name || 'Unknown',
          price: priceString,
          status: statusData.status === 'active' ? 'Active' : (statusData.status || 'Inactive'),
          renewal_date: renewalDateStr,
          days_left: daysLeft,
          users_added: statusData.usage?.total_users || 0,
          max_users: statusData.limits?.total_users || 120,
          storage_gb: statusData.usage?.storage_gb || 0,
          max_storage_gb: statusData.limits?.storage_gb || 100
        });
      } else {
        // Fallback dummy data if no endpoint yet
        setCurrentSub({
          plan_name: 'Business',
          price: '₹2,499',
          status: 'Active',
          renewal_date: 'May 12, 2026',
          days_left: 14,
          users_added: 45,
          max_users: 120,
          storage_gb: 42.5,
          max_storage_gb: 100
        });
      }
    } catch (error) {
      console.error(error);
      // Fallback if JSON parse or other error occurs
      setCurrentSub({
        plan_name: 'Business',
        price: '₹2,499',
        status: 'Active',
        renewal_date: 'May 12, 2026',
        days_left: 14,
        users_added: 45,
        max_users: 120,
        storage_gb: 42.5,
        max_storage_gb: 100
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    setUpgradeLoading(true);
    setUpgradeError('');

    try {
      const payload = {
        plan_id: selectedPlan.id,
        duration_months: billingCycle === 'annually' ? 12 : 1,
        payment_method: paymentMethod,
        payment_reference: paymentRef || 'TXN123456' // Provide fallback if empty
      };

      const res = await customFetch(API.SUBSCRIPTIONS.UPGRADE, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Upgrade failed');
      }

      // Success
      setSelectedPlan(null);
      setActiveTab('current');
      fetchCurrentSubscription();
    } catch (error: any) {
      setUpgradeError(error.message || 'An error occurred during upgrade');
    } finally {
      setUpgradeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">
          Loading Subscription...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fafafa] p-4 md:p-4 lg:p-1 font-sans">
      <div className="w-full max-w-[1600px] mx-auto space-y-12 pb-10 relative">

        {/* Modal Overlay */}
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900">Upgrade to {selectedPlan.name}</h3>
                <button onClick={() => setSelectedPlan(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3">
                  <Activity className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Plan Details</p>
                    <p className="text-sm opacity-90">Duration: {billingCycle === 'annually' ? '12 Months' : '1 Month'}</p>
                    <p className="text-sm opacity-90">Price: {selectedPlan.price} {billingCycle === 'annually' ? '/ year' : '/ month'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 font-medium outline-none"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="upi">UPI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Payment Reference</label>
                    <input
                      type="text"
                      placeholder="e.g. TXN123456"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 font-medium outline-none"
                    />
                  </div>
                </div>

                {upgradeError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{upgradeError}</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpgrade}
                  disabled={upgradeLoading || !paymentRef.trim()}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {upgradeLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Upgrade'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-6 pt-4">
          {/* Centered Pill Tab navigation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center p-1.5 bg-slate-200/50 backdrop-blur-sm rounded-full shadow-inner"
          >
            <button
              onClick={() => setActiveTab('current')}
              className={`px-8 py-2.5 rounded-full text-[15px] font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'current' ? 'bg-white text-slate-900 shadow-md transform scale-[1.02]' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <Activity className="w-4 h-4" />
              Current Plan
            </button>
            <button
              onClick={() => setActiveTab('upgrade')}
              className={`px-8 py-2.5 rounded-full text-[15px] font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'upgrade' ? 'bg-white text-slate-900 shadow-md transform scale-[1.02]' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <Sparkles className="w-4 h-4" />
              Upgrade Plan
            </button>
          </motion.div>
        </div>

        {/* Main View Area */}
        <div className="mt-8">
          <AnimatePresence mode="wait">

            {/* CURRENT PLAN VIEW */}
            {activeTab === 'current' && currentSub && (
              <motion.div
                key="current"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                {/* Hero Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-8 md:p-10 shadow-2xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Building2 className="w-48 h-48 rotate-12" />
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/20 text-white rounded-full text-xs font-bold tracking-wide uppercase mb-3">
                        <ShieldCheck className="w-3.5 h-3.5" /> {currentSub.status} Status
                      </div>
                      <h2 className="text-3xl font-black mb-1">{currentSub.plan_name} Tier <span className="text-blue-200">Plan</span></h2>
                      <p className="text-blue-100 font-medium">Billed {currentSub.price} monthly. Renews on {currentSub.renewal_date}.</p>
                    </div>

                    <button onClick={() => setActiveTab('upgrade')} className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-slate-50 transition-colors">
                      Change Plan
                    </button>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  {/* Days Left Metric */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-2xl font-black text-slate-900">{currentSub.days_left}<span className="text-base font-bold text-slate-400"> days</span></span>
                        <span className="text-sm font-semibold text-slate-500">out of 30</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (currentSub.days_left/30)*100)}%` }}></div>
                      </div>
                      <p className="text-xs font-semibold text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Cycle resets soon</p>
                    </div>
                  </div>

                  {/* Users Metric */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-emerald-50 rounded-xl">
                        <Users className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-2xl font-black text-slate-900">{currentSub.users_added}<span className="text-base font-bold text-slate-400"> added</span></span>
                        <span className="text-sm font-semibold text-slate-500">out of {currentSub.max_users}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(100, (currentSub.users_added / currentSub.max_users) * 100)}%` }}></div>
                      </div>
                      <p className="text-xs font-semibold text-slate-400">You are using {Math.round((currentSub.users_added / currentSub.max_users) * 100)}% of your limit</p>
                    </div>
                  </div>

                  {/* Storage Metric */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-amber-50 rounded-xl">
                        <HardDrive className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-2xl font-black text-slate-900">{currentSub.storage_gb}<span className="text-base font-bold text-slate-400"> GB</span></span>
                        <span className="text-sm font-semibold text-slate-500">of {currentSub.max_storage_gb} GB</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min(100, (currentSub.storage_gb / currentSub.max_storage_gb) * 100)}%` }}></div>
                      </div>
                      <p className="text-xs font-semibold text-slate-400">Plenty of space remaining</p>
                    </div>
                  </div>

                </div>

                {/* Billing Summary Box */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden relative">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><CreditCard className="w-5 h-5 text-slate-400" /> Payment Information</h3>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border border-slate-100 bg-slate-50 rounded-xl p-4 mb-4 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-white border border-slate-200 rounded flex items-center justify-center font-bold text-[10px] text-blue-900 shadow-sm">VISA</div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">•••• •••• •••• 4242</p>
                        <p className="text-xs font-medium text-slate-400">Expires 09/28</p>
                      </div>
                    </div>
                    <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Edit Payment Method</button>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button className="text-sm font-semibold text-red-500 hover:text-red-700 hover:underline transition-colors mt-2">
                      Cancel Subscription
                    </button>
                  </div>
                </div>

              </motion.div>
            )}


            {/* UPGRADE VIEW */}
            {activeTab === 'upgrade' && (
              <motion.div
                key="upgrade"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-10"
              >
                {/* Secondary billing toggle just for the upgrade view */}
                <div className="flex justify-center -mt-6 mb-4">
                  <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'
                        }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('annually')}
                      className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-1.5 ${billingCycle === 'annually' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'
                        }`}
                    >
                      Annually <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 rounded uppercase tracking-wider">Save 20%</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 items-start">
                  {mergedPlans.map((plan, idx) => {
                    const Icon = plan.icon;
                    return (
                      <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`relative rounded-[2rem] p-8 flex flex-col h-full bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${plan.highlighted
                          ? 'ring-2 ring-blue-600 shadow-blue-900/5 shadow-2xl scale-[1.02] z-10'
                          : plan.isPremium
                            ? 'bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white shadow-xl'
                            : 'border border-slate-100 shadow-sm'
                          }`}
                      >
                        {/* Popular Badge */}
                        {plan.highlighted && (
                          <div className="absolute -top-4 left-0 right-0 flex justify-center">
                            <span className="bg-blue-600 text-white text-xs font-black uppercase tracking-widest py-1.5 px-4 rounded-full flex items-center gap-1 shadow-lg shadow-blue-600/30">
                              <Sparkles className="w-3.5 h-3.5" /> Most Popular
                            </span>
                          </div>
                        )}

                        <div className="mb-6 flex justify-between items-start">
                          <div>
                            <h3 className={`text-xl font-black ${plan.isPremium ? 'text-white' : 'text-slate-900'}`}>
                              {plan.name}
                            </h3>
                            <p className={`text-sm mt-2 leading-relaxed ${plan.isPremium ? 'text-slate-400' : 'text-slate-500 font-medium'}`}>
                              {plan.description}
                            </p>
                          </div>
                          <div className={`p-3 rounded-2xl ${plan.highlighted ? 'bg-blue-50 text-blue-600' :
                            plan.isPremium ? 'bg-slate-800 text-slate-300' :
                              'bg-slate-50 text-slate-400'
                            }`}>
                            <Icon className="w-6 h-6" />
                          </div>
                        </div>

                        <div className="mb-8">
                          <div className="flex items-end gap-1.5">
                            <span className={`text-4xl font-black tracking-tight ${plan.isPremium ? 'text-white' : 'text-slate-900'}`}>
                              {plan.price}
                            </span>
                            <span className={`text-sm font-bold pb-1 ${plan.isPremium ? 'text-slate-400' : 'text-slate-400'}`}>
                              /{plan.period}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 space-y-4 mb-8">
                          {plan.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.isPremium ? 'text-emerald-400' : 'text-emerald-500'}`} />
                              <span className={`text-sm font-semibold ${plan.isPremium ? 'text-slate-200' : 'text-slate-700'}`}>
                                {feature}
                              </span>
                            </div>
                          ))}

                          {plan.missingFeatures.map((feature, i) => (
                            <div key={`missing-${i}`} className="flex items-start gap-3 opacity-50">
                              <X className="w-5 h-5 shrink-0 text-slate-300" />
                              <span className={`text-sm font-semibold line-through ${plan.isPremium ? 'text-slate-400' : 'text-slate-400'}`}>
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            if (plan.name === currentSub?.plan_name) {
                              setActiveTab('current');
                            } else {
                              setSelectedPlan(plan);
                            }
                          }}
                          className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]
                            ${plan.buttonVariant === 'primary' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20' : ''}
                            ${plan.buttonVariant === 'secondary' ? 'bg-slate-100 hover:bg-slate-200 text-slate-900' : ''}
                            ${plan.buttonVariant === 'outline' ? 'bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700' : ''}
                            ${plan.buttonVariant === 'premium' ? 'bg-white hover:bg-slate-100 text-slate-900 shadow-xl' : ''}
                          `}
                        >
                          {plan.name === currentSub?.plan_name ? 'Current Plan' : `Get ${plan.name}`}
                          <ChevronRight className={`w-4 h-4 ${plan.buttonVariant === 'outline' ? 'text-slate-400' : ''}`} />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
