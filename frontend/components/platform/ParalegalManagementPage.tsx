'use client';

import { useState, useEffect } from 'react';
import { Loader2, UserPlus, Users, Search } from 'lucide-react';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';
import AssignParalegalModal from './AssignParalegalModal';
import Link from 'next/link';

interface ParalegalManagementPageProps {
  accent: string;
  viewBase: string;
}

export default function ParalegalManagementPage({ accent, viewBase }: ParalegalManagementPageProps) {
  const [paralegals, setParalegals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedParalegal, setSelectedParalegal] = useState<any>(null);

  useEffect(() => {
    fetchParalegals();
  }, [search]);

  const fetchParalegals = async () => {
    try {
      setLoading(true);
      let url = `${API.USERS.LIST}?user_type=paralegal`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await customFetch(url);
      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || 'Failed to fetch paralegals');

      setParalegals(data.results || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSuccess = () => {
    fetchParalegals();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>
            Team Management
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#0e2340]">Paralegal Management</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage paralegals and assign them to advocates in your firm
          </p>
        </div>
        <Link
          href={`${viewBase}/new`}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: accent }}
        >
          <UserPlus className="h-4 w-4" />
          Add Paralegal
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search paralegals by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Paralegals List */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Paralegals</h2>
          <p className="mt-1 text-sm text-gray-500">
            {paralegals.length} paralegal{paralegals.length !== 1 ? 's' : ''} in your firm
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="ml-3 text-sm text-gray-400">Loading paralegals...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : paralegals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="mb-3 h-12 w-12 text-gray-300" />
            <p className="font-medium text-sm text-gray-500">No paralegals found</p>
            <p className="mt-1 text-xs text-gray-400">
              {search ? 'Try a different search term' : 'Add your first paralegal to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-[#f7f8fa]">
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paralegals.map((paralegal) => (
                  <tr key={paralegal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                          {paralegal.first_name?.[0] || paralegal.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">
                            {paralegal.first_name} {paralegal.last_name}
                          </p>
                          <p className="text-xs text-gray-500">Paralegal</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{paralegal.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {paralegal.phone_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          paralegal.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {paralegal.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedParalegal(paralegal)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          Assign to Advocate
                        </button>
                        <Link
                          href={`${viewBase}/${paralegal.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          View Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {selectedParalegal && (
        <AssignParalegalModal
          paralegalId={selectedParalegal.id}
          paralegalName={`${selectedParalegal.first_name} ${selectedParalegal.last_name}`}
          onClose={() => setSelectedParalegal(null)}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
}
