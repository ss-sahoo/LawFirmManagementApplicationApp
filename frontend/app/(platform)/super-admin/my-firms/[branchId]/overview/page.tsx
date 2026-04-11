'use client';

import { use, useEffect, useState } from 'react';
import { UserPlus, Shield, MapPin, Phone, Mail, Hash, Loader2 } from 'lucide-react';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';

export default function BranchOverviewPage({ params }: { params: Promise<{ branchId: string }> }) {
  const { branchId } = use(params);
  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        setLoading(true);
        const response = await customFetch(API.FIRMS.BRANCHES.DETAIL(branchId));
        if (response.ok) {
          const data = await response.json();
          setBranch(data);
        } else {
          setError('Failed to load branch details.');
        }
      } catch (err) {
        setError('A network error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchBranch();
  }, [branchId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl border border-gray-200 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-[#984c1f]" />
        <p className="mt-4 text-sm text-gray-400 font-medium tracking-wide">Loading branch details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{branch?.branch_name || 'Branch Overview'}</h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">Manage the core details and administrational access for this location.</p>
        </div>
        <button className="bg-[#984c1f]/5 text-[#984c1f] px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#984c1f] hover:text-white transition-all text-sm font-bold shadow-sm whitespace-nowrap">
          <UserPlus className="w-4 h-4" />
          Assign Manager
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm col-span-1 md:col-span-2">
          <h3 className="text-sm font-bold text-[#984c1f] uppercase tracking-[0.1em] mb-6 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#984c1f] rounded-full"></span>
            Branch Registry Details
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
            <div className="col-span-full">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Official Address
              </label>
              <div className="text-base text-gray-900 font-semibold leading-relaxed">
                {branch?.address || 'No street address provided'}<br />
                <span className="text-sm text-[#984c1f]/80">{branch?.city}, {branch?.state}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Professional Email
              </label>
              <span className="block text-base text-gray-900 font-semibold truncate bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                {branch?.email || 'Not configured'}
              </span>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Direct Contact
              </label>
              <span className="block text-base text-gray-900 font-semibold bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                {branch?.phone_number || 'Not provided'}
              </span>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" /> Unique Identifier
              </label>
              <span className="block text-base font-mono text-[#984c1f] font-bold bg-[#984c1f]/5 p-2.5 rounded-lg border border-[#984c1f]/10">
                {branch?.branch_code || '---'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
               Operational Status
             </h3>
             <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
               branch?.is_active 
                 ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' 
                 : 'bg-red-50/50 border-red-100 text-red-600'
             }`}>
               <div className={`w-3.5 h-3.5 rounded-full ${branch?.is_active ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
               <div>
                 <span className="block text-sm font-extrabold uppercase tracking-wide">{branch?.is_active ? 'Active' : 'Inactive'}</span>
                 <span className="block text-[10px] opacity-70 font-bold mt-0.5">Firm Connectivity: Normal</span>
               </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
               Local Administration
             </h3>
             <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg border border-dotted border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                    <Shield className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400 italic">No assigned admins</span>
                    <span className="block text-[10px] text-gray-400 mt-0.5">Inheriting firm permissions</span>
                  </div>
                </div>
                <button className="w-full py-2.5 text-xs font-bold text-[#984c1f] border border-[#984c1f]/20 rounded-xl hover:bg-[#984c1f]/5 transition-colors uppercase tracking-widest">
                  Configure Access
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
