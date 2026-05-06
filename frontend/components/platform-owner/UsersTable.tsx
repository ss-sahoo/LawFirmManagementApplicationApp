'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Loader2, UserX } from 'lucide-react';
import { customFetch } from '@/lib/fetch';
import { API, API_BASE_URL } from '@/lib/api';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_type: string;
  is_active: boolean;
  firm_name: string | null;
  profile_image: string | null;
  created_at: string;
}

interface Props {
  userType: 'advocate' | 'client';
  soloOnly?: boolean;
}

export default function UsersTable({ userType, soloOnly = false }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await customFetch(`${API.USERS.LIST}?user_type=${userType}&page_size=500`);
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : (data.results || []));
      } catch (e: any) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userType]);

  const filtered = users.filter((u) => {
    if (soloOnly && u.firm_name) return false;
    const q = query.toLowerCase();
    return (
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone_number || '').includes(q) ||
      (u.firm_name || '').toLowerCase().includes(q)
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const label = userType === 'advocate' ? 'Advocate' : 'Client';
  const accentColor = '#0e2340';

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
        <p className="text-sm text-gray-400 font-medium">Loading {label.toLowerCase()}s…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-16 text-center">
        <p className="text-sm text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-bold" style={{ color: accentColor }}>
            Individual {label}s
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {soloOnly
              ? `${users.filter(u => !u.firm_name).length} solo · ${users.filter(u => !u.firm_name && u.is_active).length} active`
              : `${users.length} total · ${users.filter((u) => u.is_active).length} active`
            }
          </p>
        </div>
        <div className="flex w-full items-center gap-2 rounded-xl border border-gray-100 bg-[#f7f8fa] px-3 py-2 sm:w-60 sm:focus-within:w-80 transition-[width] duration-300">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder={`Search ${label.toLowerCase()}s…`}
            className="bg-transparent text-sm text-gray-600 placeholder:text-gray-400 outline-none w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-100 bg-[#f7f8fa]">
              {['#', 'Name', 'Contact', 'Firm', 'Status', 'Joined'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <UserX className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No {label.toLowerCase()}s found</p>
                </td>
              </tr>
            ) : (
              paged.map((u, i) => {
                const initials = `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase();
                const avatarSrc = u.profile_image
                  ? (u.profile_image.startsWith('http') ? u.profile_image : `${API_BASE_URL}${u.profile_image}`)
                  : null;
                return (
                  <tr key={u.id} className="hover:bg-[#f7f8fa]/60 transition-colors">
                    <td className="px-5 py-4 text-sm font-semibold text-gray-500">
                      {(safePage - 1) * pageSize + i + 1}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {avatarSrc ? (
                          <img src={avatarSrc} alt={initials} className="w-9 h-9 rounded-xl object-cover border border-gray-100 shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: accentColor }}>
                            {initials || '?'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{u.first_name} {u.last_name}</p>
                          <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{u.phone_number || '—'}</td>
                    <td className="px-5 py-4">
                      {u.firm_name ? (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
                          {u.firm_name}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg">
                          Solo
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        u.is_active
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-red-50 text-red-500 border border-red-100'
                      }`}>
                        {u.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">{formatDate(u.created_at)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100 bg-[#f7f8fa] flex items-center justify-between">
        <p className="text-xs text-gray-400">Showing {paged.length} of {filtered.length}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}
            className="w-10 h-7 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-30">
            Prev
          </button>
          <span className="px-2 text-xs font-semibold text-gray-500">{safePage} / {pageCount}</span>
          <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={safePage >= pageCount}
            className="w-10 h-7 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-30">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
