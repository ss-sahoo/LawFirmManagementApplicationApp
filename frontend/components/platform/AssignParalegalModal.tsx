'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';

interface AssignParalegalModalProps {
  paralegalId: string;
  paralegalName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignParalegalModal({
  paralegalId,
  paralegalName,
  onClose,
  onSuccess,
}: AssignParalegalModalProps) {
  const [advocates, setAdvocates] = useState<any[]>([]);
  const [selectedAdvocate, setSelectedAdvocate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdvocates();
  }, []);

  const fetchAdvocates = async () => {
    try {
      setLoading(true);
      const response = await customFetch(`${API.USERS.LIST}?user_type=advocate`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.detail || 'Failed to fetch advocates');
      
      setAdvocates(data.results || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedAdvocate) {
      setError('Please select an advocate');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await customFetch(API.USERS.ASSIGN_PARALEGAL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paralegal_id: paralegalId,
          advocate_id: selectedAdvocate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign paralegal');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Assign Paralegal</h2>
            <p className="mt-1 text-sm text-gray-500">
              Assign <span className="font-semibold">{paralegalName}</span> to an advocate
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Select Advocate
            </label>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : advocates.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
                No advocates available in your firm
              </div>
            ) : (
              <select
                value={selectedAdvocate}
                onChange={(e) => setSelectedAdvocate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">-- Select an advocate --</option>
                {advocates.map((advocate) => (
                  <option key={advocate.id} value={advocate.id}>
                    {advocate.first_name} {advocate.last_name} ({advocate.email})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleAssign}
            disabled={submitting || !selectedAdvocate}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Assign Paralegal
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
