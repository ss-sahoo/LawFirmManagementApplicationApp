'use client';

import { useState } from 'react';
import { UserPlus, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddParalegalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
  });

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        user_type: 'paralegal',
      };

      const res = await customFetch(API.PARALEGALS.ADD_USER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        const msg =
          err.detail ||
          err.error ||
          Object.values(err).flat().join(' ') ||
          'Failed to add paralegal';
        throw new Error(msg as string);
      }

      setSuccess(true);
      setTimeout(() => router.push('/advocate/paralegals'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Paralegal Added!</h3>
          <p className="text-sm text-gray-400 mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/advocate/paralegals" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Paralegals
      </Link>

      {/* Title */}
      <div className="text-center">
        <div className="w-16 h-16 bg-[#2d0b25]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-[#2d0b25]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Add Paralegal</h1>
        <p className="text-sm text-gray-500">The paralegal will be assigned to you automatically</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">First Name *</label>
            <input
              required
              type="text"
              value={formData.first_name}
              onChange={(e) => update('first_name', e.target.value)}
              placeholder="Ravi"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-900 outline-none focus:border-[#2d0b25] focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Last Name *</label>
            <input
              required
              type="text"
              value={formData.last_name}
              onChange={(e) => update('last_name', e.target.value)}
              placeholder="Sharma"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-900 outline-none focus:border-[#2d0b25] focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email *</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="ravi@example.com"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-900 outline-none focus:border-[#2d0b25] focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number *</label>
            <input
              required
              type="tel"
              value={formData.phone_number}
              onChange={(e) => update('phone_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
              placeholder="9876543210"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-900 outline-none focus:border-[#2d0b25] focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Temporary Password *</label>
          <input
            required
            type="password"
            minLength={8}
            value={formData.password}
            onChange={(e) => update('password', e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-900 outline-none focus:border-[#2d0b25] focus:bg-white transition-all"
          />
          <p className="text-xs text-gray-400 mt-1">The paralegal can change this after first login</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-11 bg-[#2d0b25] text-white rounded-xl hover:bg-[#1a0616] transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Add Paralegal
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push('/advocate/paralegals')}
            className="px-5 h-11 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
