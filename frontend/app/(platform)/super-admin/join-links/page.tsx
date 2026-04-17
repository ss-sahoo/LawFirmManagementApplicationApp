'use client';

import { useState, useEffect } from 'react';
import { Link2, Plus, Copy, Trash2, Users, Calendar, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { customFetch } from '@/lib/fetch';
import { API, API_BASE_URL } from '@/lib/api';

interface JoinLink {
  id: string;
  user_type: string;
  user_type_display: string;
  is_active: boolean;
  max_uses: number;
  usage_count: number;
  expires_at: string | null;
  created_at: string;
  firm: string;
}

export default function JoinLinksPage() {
  const [links, setLinks] = useState<JoinLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [userType, setUserType] = useState('advocate');
  const [maxUses, setMaxUses] = useState('0');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customFetch(API.JOIN_LINKS.LIST);
      const data = await response.json();
      setLinks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load join links');
      console.error('Error fetching links:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const payload: any = {
        user_type: userType,
        max_uses: parseInt(maxUses) || 0
      };
      
      if (expiresAt) {
        payload.expires_at = new Date(expiresAt).toISOString();
      }

      const response = await customFetch(API.JOIN_LINKS.CREATE, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchLinks();
        setShowCreateModal(false);
        // Reset form
        setUserType('advocate');
        setMaxUses('0');
        setExpiresAt('');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create link');
      }
    } catch (err: any) {
      console.error('Error creating link:', err);
      alert('Failed to create join link');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this join link?')) return;

    try {
      const response = await customFetch(API.JOIN_LINKS.DELETE(linkId), {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchLinks();
      } else {
        alert('Failed to delete link');
      }
    } catch (err) {
      console.error('Error deleting link:', err);
      alert('Failed to delete join link');
    }
  };

  const copyLinkToClipboard = (linkId: string) => {
    const fullUrl = `${window.location.origin}/join/${linkId}`;
    navigator.clipboard.writeText(fullUrl);
    alert('Link copied to clipboard!');
  };

  const getUserTypeOptions = () => {
    // Get user from localStorage to determine what roles they can create
    const userDetails = localStorage.getItem('user_details');
    if (!userDetails) return [];
    
    const user = JSON.parse(userDetails);
    
    if (user.user_type === 'super_admin') {
      return [
        { value: 'admin', label: 'Admin' },
        { value: 'advocate', label: 'Advocate' },
        { value: 'paralegal', label: 'Paralegal' },
        { value: 'client', label: 'Client' }
      ];
    } else if (user.user_type === 'admin') {
      return [
        { value: 'advocate', label: 'Advocate' },
        { value: 'paralegal', label: 'Paralegal' },
        { value: 'client', label: 'Client' }
      ];
    }
    
    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#4a1c40] mx-auto mb-4" />
          <p className="text-gray-500">Loading join links...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-2">Error Loading Links</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchLinks}
            className="px-4 py-2 bg-[#4a1c40] text-white rounded-lg hover:bg-[#3a1530] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Join Links</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage shareable links for users to join your firm</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4a1c40] text-white rounded-lg hover:bg-[#3a1530] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Link
        </button>
      </div>

      {/* Links Grid */}
      {links.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No join links created yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-[#4a1c40]/10 text-[#4a1c40] rounded-lg hover:bg-[#4a1c40]/20 transition-colors"
          >
            Create Your First Link
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <div
              key={link.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#4a1c40]/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#4a1c40]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{link.user_type_display}</h3>
                    <p className="text-xs text-gray-500">Join Link</p>
                  </div>
                </div>
                {link.is_active ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Uses:</span>
                  <span className="font-semibold text-gray-900">
                    {link.usage_count} / {link.max_uses === 0 ? '∞' : link.max_uses}
                  </span>
                </div>
                {link.expires_at && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Expires:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(link.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(link.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => copyLinkToClipboard(link.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#4a1c40]/10 text-[#4a1c40] rounded-lg hover:bg-[#4a1c40]/20 transition-colors text-sm font-semibold"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Join Link</h2>
            
            <form onSubmit={handleCreateLink} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  User Type
                </label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a1c40]/20 focus:border-[#4a1c40]"
                  required
                >
                  {getUserTypeOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Uses (0 = Unlimited)
                </label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a1c40]/20 focus:border-[#4a1c40]"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a1c40]/20 focus:border-[#4a1c40]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-[#4a1c40] text-white rounded-lg hover:bg-[#3a1530] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Link'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
