'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building2, Users, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';

interface LinkDetails {
  firm_name: string;
  user_type: string;
  user_type_display: string;
  expires_at: string | null;
  max_uses: number;
  usage_count: number;
  is_valid: boolean;
}

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params.id as string;

  const [linkDetails, setLinkDetails] = useState<LinkDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchLinkDetails();
  }, [linkId]);

  const fetchLinkDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customFetch(API.JOIN_LINKS.GET_DETAILS(linkId));
      
      if (response.ok) {
        const data = await response.json();
        setLinkDetails(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid or expired link');
      }
    } catch (err: any) {
      setError('Failed to load link details');
      console.error('Error fetching link details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirm_password) {
      alert('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password
      };

      const response = await customFetch(API.JOIN_LINKS.JOIN(linkId), {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Save token and user details
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_details', JSON.stringify(data.user));

        // Show success message
        alert(data.message || 'Successfully joined!');

        // Redirect based on user type
        const userType = data.user.user_type;
        if (userType === 'super_admin') {
          router.push('/super-admin/dashboard');
        } else if (userType === 'admin') {
          router.push('/firm-admin/dashboard');
        } else if (userType === 'advocate') {
          router.push('/advocate/dashboard');
        } else if (userType === 'paralegal') {
          router.push('/paralegal/dashboard');
        } else if (userType === 'client') {
          router.push('/client/dashboard');
        } else {
          router.push('/login');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to join. Please try again.');
      }
    } catch (err: any) {
      console.error('Error joining:', err);
      alert('Failed to join. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !linkDetails || !linkDetails.is_valid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600 mb-6">
            {error || 'This invitation link is invalid, expired, or has reached its maximum uses.'}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join {linkDetails.firm_name}</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 rounded-full">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">
              As {linkDetails.user_type_display}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
              placeholder="john.doe@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
              placeholder="+919876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-10 text-gray-900"
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleInputChange}
              required
              minLength={8}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
              placeholder="Confirm your password"
            />
          </div>

          {linkDetails.expires_at && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> This link expires on{' '}
                {new Date(linkDetails.expires_at).toLocaleDateString()}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Join {linkDetails.firm_name}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
