'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Search, Phone, Mail, Loader2, AlertCircle, UserX } from 'lucide-react';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';
import Link from 'next/link';

interface Paralegal {
  id: string;
  paralegal: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
  assigned_at?: string;
}

export default function AdvocateParalegalsPage() {
  const [paralegals, setParalegals] = useState<Paralegal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchParalegals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = search
        ? `${API.PARALEGALS.MY_PARALEGALS}?search=${encodeURIComponent(search)}`
        : API.PARALEGALS.MY_PARALEGALS;
      const res = await customFetch(url);
      const data = await res.json();
      const results = Array.isArray(data) ? data : (data.results || []);
      setParalegals(results);
    } catch (err: any) {
      setError(err.message || 'Failed to load paralegals');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchParalegals, 300);
    return () => clearTimeout(timer);
  }, [fetchParalegals]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Paralegals</h1>
          <p className="text-sm text-gray-500 mt-1">Paralegals assigned to you</p>
        </div>
        <Link href="/advocate/paralegals/add">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#2d0b25] text-white rounded-xl hover:bg-[#1a0616] transition-colors font-semibold text-sm">
            <UserPlus className="w-4 h-4" />
            Add Paralegal
          </button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 h-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 outline-none focus:border-[#2d0b25] transition-all"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#2d0b25]" />
        </div>
      ) : paralegals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserX className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Paralegals Yet</h3>
          <p className="text-sm text-gray-500 mb-6">Add a paralegal to help manage your cases</p>
          <Link href="/advocate/paralegals/add">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2d0b25] text-white rounded-xl hover:bg-[#1a0616] transition-colors font-semibold text-sm">
              <UserPlus className="w-4 h-4" />
              Add Paralegal
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paralegals.map((item) => {
            const p = item.paralegal;
            const initials = `${p.first_name?.[0] || ''}${p.last_name?.[0] || ''}`.toUpperCase();
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#2d0b25]/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[#2d0b25]">{initials || <Users className="w-5 h-5" />}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{p.first_name} {p.last_name}</p>
                    <span className="text-xs font-semibold text-[#2d0b25] bg-[#2d0b25]/10 px-2 py-0.5 rounded-full">Paralegal</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {p.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate">{p.email}</span>
                    </div>
                  )}
                  {p.phone_number && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{p.phone_number}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
