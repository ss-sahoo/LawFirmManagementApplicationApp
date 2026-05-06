'use client';

import { useState } from 'react';
import { Phone, Check, Loader2, AlertCircle } from 'lucide-react';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';

interface PhoneVerificationProps {
  phoneNumber: string;
  onVerified: () => void;
  purpose?: 'registration' | 'update';
  className?: string;
}

export default function PhoneVerification({
  phoneNumber,
  onVerified,
  purpose = 'registration',
  className = ''
}: PhoneVerificationProps) {
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await customFetch(API.USERS.SEND_PHONE_OTP, {
        method: 'POST',
        body: JSON.stringify({
          phone_number: phoneNumber,
          purpose
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      setCooldown(60);

      // Start cooldown timer
      const timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await customFetch(API.USERS.VERIFY_PHONE_OTP, {
        method: 'POST',
        body: JSON.stringify({
          phone_number: phoneNumber,
          otp,
          purpose
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      setVerified(true);
      onVerified();

    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className={`bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 ${className}`}>
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
          <Check className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-900">Phone Verified</p>
          <p className="text-xs text-emerald-700">{phoneNumber}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {!otpSent ? (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Verify Phone Number
            </label>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={phoneNumber}
              disabled
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-slate-900 bg-gray-50"
            />
            <button
              type="button"
              onClick={sendOTP}
              disabled={loading || !phoneNumber}
              className="px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </div>
          {error && (
            <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Enter OTP
            </label>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            We sent a 6-digit code to {phoneNumber}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-slate-900 text-center tracking-widest"
            />
            <button
              type="button"
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
              className="px-6 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>
          </div>
          {error && (
            <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-500">Didn't receive the code?</span>
            <button
              type="button"
              onClick={sendOTP}
              disabled={cooldown > 0 || loading}
              className="text-blue-600 font-semibold hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
