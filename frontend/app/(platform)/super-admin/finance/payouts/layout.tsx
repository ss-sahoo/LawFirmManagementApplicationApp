'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTopbarTitle } from '@/components/platform/TopbarContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Settings, Users } from 'lucide-react';

export default function PayoutsLayout({ children }: { children: React.ReactNode }) {
  useTopbarTitle('Payouts & Distributions', 'Manage and track financial distributions to platform personnel.');

  const pathname = usePathname();

  const isAdvocate = pathname?.includes('/payouts/advocate') || pathname?.endsWith('/payouts');
  const isAdmin = pathname?.includes('/payouts/admin');
  const isParalegal = pathname?.includes('/payouts/paralegal');

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fafafa] p-4 md:p-6 lg:p-1 font-sans">
      <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-10">

        {/* Universal Payouts Text Navigation Tabs */}
        <div className="flex items-center gap-8 border-b border-slate-200 mb-6 px-2">
           <Link href="/super-admin/finance/payouts/advocate" className="block focus:outline-none">
             <button
               className={`py-3 text-[15px] font-semibold transition-all relative ${
                 isAdvocate ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
               }`}
             >
               Advocate Payments
               {isAdvocate && (
                 <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-blue-600 rounded-t-full" />
               )}
             </button>
           </Link>

           <Link href="/super-admin/finance/payouts/admin" className="block focus:outline-none">
             <button
               className={`py-3 text-[15px] font-semibold transition-all relative ${
                 isAdmin ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
               }`}
             >
               Admin Payments
               {isAdmin && (
                 <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-blue-600 rounded-t-full" />
               )}
             </button>
           </Link>

           <Link href="/super-admin/finance/payouts/paralegal" className="block focus:outline-none">
             <button
               className={`py-3 text-[15px] font-semibold transition-all relative ${
                 isParalegal ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
               }`}
             >
               Paralegal Payments
               {isParalegal && (
                 <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-blue-600 rounded-t-full" />
               )}
             </button>
           </Link>
        </div>

        {/* Content Area Rendering the specific payout page */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
