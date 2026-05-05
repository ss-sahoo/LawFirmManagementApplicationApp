'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Scale, LayoutDashboard, Users,
  Settings, ChevronRight, LogOut, Briefcase, FileText, CreditCard, BarChart2, ChevronDown, UserCheck, Store, X, Calendar, PieChart, Activity, Crown, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTopbar } from '@/components/platform/TopbarContext';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';

const topNavItems = [
  { label: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
  { label: 'Calendar', path: '/super-admin/calendar', icon: Calendar },
];

const casesSubItems = [
  { label: 'Pre-litigation', path: '/super-admin/cases/pre-litigation', icon: FileText },
  { label: 'Court Cases', path: '/super-admin/cases/court-case', icon: Scale },
];

const userSubItems = [
  { label: 'Admin', path: '/super-admin/users/admin', icon: UserCheck },
  { label: 'Advocate', path: '/super-admin/users/advocate', icon: Briefcase },
  { label: 'Paralegal', path: '/super-admin/users/paralegal', icon: FileText },
  { label: 'Client', path: '/super-admin/users/client', icon: Users },
];

const financeSubItems = [
  { label: 'Overview', path: '/super-admin/finance', icon: Activity },
  { label: 'Client Invoices', path: '/super-admin/finance/client-invoices', icon: FileText },
  { label: 'My Bills', path: '/super-admin/finance/my-bills', icon: FileText },
  { label: 'Payouts', path: '/super-admin/finance/payouts', icon: CreditCard },
  { label: 'Expenses', path: '/super-admin/finance/expenses', icon: Wallet },
  { label: 'Reports', path: '/super-admin/finance/reports', icon: PieChart },
  { label: 'Subscriptions', path: '/super-admin/finance/subscriptions', icon: Crown },
];

const bottomNavItems = [
  { label: 'Documents', path: '/super-admin/documents', icon: FileText },
  { label: 'Billing', path: '/super-admin/billing', icon: CreditCard },
  { label: 'Reports', path: '/super-admin/reports', icon: BarChart2 },
];

const mockFirmBranches = [
  { id: 'branch-1', name: 'Downtown Branch' },
  { id: 'branch-2', name: 'Uptown Branch' },
];

export default function SuperAdminSidebar() {
  const router = useRouter();
  const { isSidebarOpen, closeSidebar } = useTopbar();

  const handleLogout = async () => {
    try {
      await customFetch(API.AUTH.LOGOUT, { method: 'POST' });
    } catch (e) {
      console.error('Logout failed on backend:', e);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_details');
      router.push('/login');
    }
  };

  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(
    () => pathname.startsWith('/super-admin/users')
  );
  const [firmMenuOpen, setFirmMenuOpen] = useState(
    () => pathname.startsWith('/super-admin/my-firms')
  );
  const [casesMenuOpen, setCasesMenuOpen] = useState(
    () => pathname.startsWith('/super-admin/cases')
  );
  const [financeMenuOpen, setFinanceMenuOpen] = useState(
    () => pathname.startsWith('/super-admin/finance')
  );

  useEffect(() => {
    if (pathname.startsWith('/super-admin/users')) {
      setUserMenuOpen(true);
    }
    if (pathname.startsWith('/super-admin/my-firms')) {
      setFirmMenuOpen(true);
    }
    if (pathname.startsWith('/super-admin/cases')) {
      setCasesMenuOpen(true);
    }
    if (pathname.startsWith('/super-admin/finance')) {
      setFinanceMenuOpen(true);
    }
  }, [pathname]);

  const isActive = (path: string) => pathname.startsWith(path);
  const userSectionActive = pathname.startsWith('/super-admin/users');
  const myFirmsActive = pathname.startsWith('/super-admin/my-firms');

  const navRow = (active: boolean) =>
    `group relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${active ? 'bg-[#5c2d12]/10 text-[#5c2d12]' : 'text-gray-900 hover:bg-gray-50 hover:text-black'
    }`;
  const iconBox = (active: boolean) =>
    `w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${active ? 'bg-[#5c2d12]/15' : 'bg-gray-100 group-hover:bg-gray-200'
    }`;
  const iconColor = (active: boolean) =>
    `w-4 h-4 ${active ? 'text-[#5c2d12]' : 'text-gray-700 group-hover:text-gray-900'}`;

  const sidebarContent = (
    <aside className="w-64 h-full bg-white border-r border-gray-100 flex flex-col overflow-hidden font-sans">
      <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#5c2d12] rounded-lg flex items-center justify-center shadow-md">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-950 tracking-tight">
            Firm<span className="text-[#5c2d12]">Manage</span>
          </span>
        </div>
        <button onClick={closeSidebar} className="lg:hidden p-2 text-gray-700 hover:text-gray-950">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <div className="px-3 mb-3 lg:hidden">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-800">
            Super Admin (Owner)
          </span>
        </div>

        {/* Top Navigation Items (Dashboard, Calendar, etc.) */}
        {topNavItems.map(({ label, path, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link key={path} href={path} onClick={closeSidebar}>
              <div className={navRow(active)}>
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full bg-[#5c2d12]" />
                )}
                <div className="flex items-center gap-3">
                  <div className={iconBox(active)}>
                    <Icon className={iconColor(active)} />
                  </div>
                  <span className="text-sm font-semibold">{label}</span>
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 text-[#5c2d12]/40" />}
              </div>
            </Link>
          );
        })}

        {/* Cases */}
        <div>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setCasesMenuOpen((o) => !o); }}
            className={navRow(pathname.startsWith('/super-admin/cases')) + ' w-full'}
          >
            {pathname.startsWith('/super-admin/cases') && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full bg-[#5c2d12]" />
            )}
            <div className="flex items-center gap-3">
              <div className={iconBox(pathname.startsWith('/super-admin/cases'))}>
                <Briefcase className={iconColor(pathname.startsWith('/super-admin/cases'))} />
              </div>
              <span className="text-sm font-semibold">Cases</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${casesMenuOpen ? 'rotate-180 text-[#5c2d12]' : 'text-gray-500'}`} />
          </button>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${casesMenuOpen ? 'max-h-52 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="ml-[22px] mt-1 mb-1 border-l-2 border-[#5c2d12]/15 pl-3.5 space-y-0.5">
              {casesSubItems.map(({ label, path, icon: Icon }) => {
                const active = pathname.startsWith(path);
                return (
                  <Link key={path} href={path} onClick={closeSidebar}>
                    <div className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer ${active ? 'bg-[#5c2d12]/10 text-[#5c2d12]' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-950'
                      }`}>
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-[#5c2d12]' : 'text-gray-600 group-hover:text-gray-900'}`} />
                      <span className={`text-[13px] font-semibold ${active ? 'text-[#5c2d12]' : ''}`}>{label}</span>
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#5c2d12]" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* My Firms */}
        <Link href="/super-admin/my-firms" onClick={closeSidebar}>
          <div className={navRow(myFirmsActive)}>
            {myFirmsActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full bg-[#5c2d12]" />
            )}
            <div className="flex items-center gap-3">
              <div className={iconBox(myFirmsActive)}>
                <Store className={iconColor(myFirmsActive)} />
              </div>
              <span className="text-sm font-semibold">My Firms</span>
            </div>
            {myFirmsActive && <ChevronRight className="w-3.5 h-3.5 text-[#5c2d12]/40" />}
          </div>
        </Link>

        {/* User Management */}
        <div>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setUserMenuOpen((o) => !o); }}
            className={navRow(userSectionActive) + ' w-full'}
          >
            {userSectionActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full bg-[#5c2d12]" />
            )}
            <div className="flex items-center gap-3">
              <div className={iconBox(userSectionActive)}>
                <Users className={iconColor(userSectionActive)} />
              </div>
              <span className="text-sm font-semibold">User Management</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${userMenuOpen ? 'rotate-180 text-[#5c2d12]' : 'text-gray-500'}`} />
          </button>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${userMenuOpen ? 'max-h-52 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="ml-[22px] mt-1 mb-1 border-l-2 border-[#5c2d12]/15 pl-3.5 space-y-0.5">
              {userSubItems.map(({ label, path, icon: Icon }) => {
                const active = pathname.startsWith(path);
                return (
                  <Link key={path} href={path} onClick={closeSidebar}>
                    <div className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer ${active ? 'bg-[#5c2d12]/10 text-[#5c2d12]' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-950'
                      }`}>
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-[#5c2d12]' : 'text-gray-600 group-hover:text-gray-900'}`} />
                      <span className={`text-[13px] font-semibold ${active ? 'text-[#5c2d12]' : ''}`}>{label}</span>
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#5c2d12]" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Finance */}
        <div>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setFinanceMenuOpen((o) => !o); }}
            className={navRow(pathname.startsWith('/super-admin/finance')) + ' w-full'}
          >
            {pathname.startsWith('/super-admin/finance') && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full bg-[#5c2d12]" />
            )}
            <div className="flex items-center gap-3">
              <div className={iconBox(pathname.startsWith('/super-admin/finance'))}>
                <PieChart className={iconColor(pathname.startsWith('/super-admin/finance'))} />
              </div>
              <span className="text-sm font-semibold">Finance</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${financeMenuOpen ? 'rotate-180 text-[#5c2d12]' : 'text-gray-500'}`} />
          </button>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${financeMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="ml-[22px] mt-1 mb-1 border-l-2 border-[#5c2d12]/15 pl-3.5 space-y-0.5">
              {financeSubItems.map(({ label, path, icon: Icon }) => {
                const active = pathname === path || (path !== '/super-admin/finance' && pathname.startsWith(path));

                return (
                  <Link key={path} href={path} onClick={closeSidebar}>
                    <div className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer ${active ? 'bg-[#5c2d12]/10 text-[#5c2d12]' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-950'
                      }`}>
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-[#5c2d12]' : 'text-gray-600 group-hover:text-gray-900'}`} />
                      <span className={`text-[13px] font-semibold ${active ? 'text-[#5c2d12]' : ''}`}>{label}</span>
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#5c2d12]" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {bottomNavItems.map(({ label, path, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link key={path} href={path} onClick={closeSidebar}>
              <div className={navRow(active)}>
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full bg-[#5c2d12]" />}
                <div className="flex items-center gap-3">
                  <div className={iconBox(active)}><Icon className={iconColor(active)} /></div>
                  <span className="text-sm font-semibold">{label}</span>
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 text-[#5c2d12]/40" />}
              </div>
            </Link>
          );
        })}

        {(isActive('/super-admin/profile') || isActive('/super-admin/settings')) && (
          <>
            <div className="my-3 border-t border-gray-100" />
            <div className="px-3 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-800">Account Context</span>
            </div>
            {[
              { label: 'Profile', path: '/super-admin/profile', icon: UserCheck },
              { label: 'Settings', path: '/super-admin/settings', icon: Settings }
            ].map(({ label, path, icon: Icon }) => {
              const active = isActive(path);
              return (
                <Link key={path} href={path} onClick={closeSidebar}>
                  <div className={navRow(active)}>
                    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full bg-[#5c2d12]" />}
                    <div className="flex items-center gap-3">
                      <div className={iconBox(active)}><Icon className={iconColor(active)} /></div>
                      <span className="text-sm font-semibold">{label}</span>
                    </div>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-[#5c2d12]/40" />}
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="border-t border-gray-100 px-4 py-3">
        <button onClick={handleLogout} className="flex items-center gap-2 text-[#5c2d12] hover:opacity-75 transition-opacity">
          <LogOut className="w-4 h-4" />
          <span className="text-[15px] font-semibold">Log Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:flex w-64 h-screen shrink-0 sticky top-0">
        {sidebarContent}
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 w-64 shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

