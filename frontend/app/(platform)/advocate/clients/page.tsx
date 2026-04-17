'use client';

import { useState, useEffect } from 'react';
import { Users, Phone, Mail, FileText, Download, Eye, Search, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';

interface Client {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  brief_summary: string;
  advocate_name: string;
  created_at: string;
}

interface Document {
  id: string;
  document_title: string;
  document_type: string;
  document_type_display: string;
  document_category: string;
  uploaded_by_name: string;
  verification_status: string;
  uploaded_at: string;
  is_deleted: boolean;
}

interface ClientDocuments {
  client: Client;
  documents: Document[];
  total_documents: number;
}

export default function AdvocateClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientDocuments, setClientDocuments] = useState<ClientDocuments | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMyClients();
  }, []);

  const fetchMyClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customFetch(API.CLIENTS.MY_CLIENTS);
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setClients(data);
      } else if (data && Array.isArray(data.results)) {
        setClients(data.results);
      } else {
        setClients([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load clients');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDocuments = async (clientId: string) => {
    try {
      setDocumentsLoading(true);
      const response = await customFetch(API.CLIENTS.CLIENT_DOCUMENTS(clientId));
      const data = await response.json();
      setClientDocuments(data);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      alert('Failed to load client documents');
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    fetchClientDocuments(client.id);
  };

  const handleBackToList = () => {
    setSelectedClient(null);
    setClientDocuments(null);
  };

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone_number.includes(searchQuery)
  );

  const getVerificationBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      verified: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#4a1c40] mx-auto mb-4" />
          <p className="text-gray-500">Loading your clients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-2">Error Loading Clients</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchMyClients}
            className="px-4 py-2 bg-[#4a1c40] text-white rounded-lg hover:bg-[#3a1530] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Client Details View
  if (selectedClient && clientDocuments) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-[#4a1c40] hover:underline font-semibold"
        >
          ← Back to Clients
        </button>

        {/* Client Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#4a1c40]/10 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-[#4a1c40]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{clientDocuments.client.full_name}</h1>
                <p className="text-sm text-gray-500 mt-1">Client Details</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-semibold text-gray-900">{clientDocuments.client.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-semibold text-gray-900">{clientDocuments.client.phone_number}</p>
              </div>
            </div>
          </div>

          {clientDocuments.client.brief_summary && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-1">Case Summary</p>
              <p className="text-sm text-blue-800">{clientDocuments.client.brief_summary}</p>
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#4a1c40]">Client Documents</h2>
              <p className="text-sm text-gray-500 mt-1">
                Total: {clientDocuments.total_documents} document{clientDocuments.total_documents !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {documentsLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#4a1c40] mx-auto mb-4" />
              <p className="text-gray-500">Loading documents...</p>
            </div>
          ) : clientDocuments.documents.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Document</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Uploaded By</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clientDocuments.documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#4a1c40]/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#4a1c40]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{doc.document_title}</p>
                            {doc.document_category && (
                              <p className="text-xs text-gray-500">{doc.document_category}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{doc.document_type_display}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{doc.uploaded_by_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getVerificationBadge(doc.verification_status)}`}>
                          {doc.verification_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                            <Download className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Clients List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Clients</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your assigned clients</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#4a1c40]/10 px-4 py-2 rounded-lg">
            <p className="text-sm font-semibold text-[#4a1c40]">{clients.length} Total Clients</p>
          </div>
          <Link href="/advocate/add-client">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#4a1c40] text-white rounded-lg hover:bg-[#3a1530] transition-colors font-semibold shadow-sm">
              <Users className="w-4 h-4" />
              Add Client
            </button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a1c40]/20 focus:border-[#4a1c40]"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery ? 'No clients found matching your search' : 'No clients assigned to you yet'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              onClick={() => handleClientClick(client)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-[#4a1c40]/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[#4a1c40]/10 rounded-full flex items-center justify-center group-hover:bg-[#4a1c40]/20 transition-colors">
                  <Users className="w-6 h-6 text-[#4a1c40]" />
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(client.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#4a1c40] transition-colors">
                {client.full_name}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{client.phone_number}</span>
                </div>
              </div>

              {client.brief_summary && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                  {client.brief_summary}
                </p>
              )}

              <button className="w-full py-2 bg-[#4a1c40]/10 text-[#4a1c40] rounded-lg font-semibold text-sm hover:bg-[#4a1c40] hover:text-white transition-colors">
                View Details & Documents
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
