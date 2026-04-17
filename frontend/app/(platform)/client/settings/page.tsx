'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, Save, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';

const ACCENT = '#1f2937';

function PwdInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      <div className="relative group">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-11 text-sm font-semibold text-gray-900 outline-none focus:border-[#1f2937] transition-colors"
          required
        />
        <button type="button" onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-200/50 text-gray-400 hover:text-gray-600 transition-all">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ClientSettingsPage() {
  const [oldPw,     setOldPw]     = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (newPw !== confirmPw) { setError('New passwords do not match.'); return; }
    if (newPw.length < 8)    { setError('Password must be at least 8 characters.'); return; }

    setSaving(true);
    try {
      const res = await customFetch(API.USERS.CHANGE_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_password: oldPw, new_password: newPw, new_password_confirm: confirmPw }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || data.old_password?.[0] || data.new_password?.[0] || 'Password change failed');
      }
      setSuccess('Password changed successfully!');
      setOldPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => setSuccess(''), 5000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: ACCENT }}>
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900">Security Settings</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage your account password and security preferences.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.7fr_1fr] gap-6 items-start">

        {/* Change Password Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Change Password</p>

          <PwdInput label="Current Password"  value={oldPw}     onChange={setOldPw} />
          <PwdInput label="New Password"       value={newPw}     onChange={setNewPw} />
          <PwdInput label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} />

          {/* Password strength hints */}
          {newPw && (
            <div className="space-y-1.5">
              {[
                { label: 'At least 8 characters', ok: newPw.length >= 8 },
                { label: 'Contains a number',      ok: /\d/.test(newPw) },
                { label: 'Contains a letter',      ok: /[a-zA-Z]/.test(newPw) },
                { label: 'Passwords match',        ok: newPw === confirmPw && confirmPw !== '' },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${r.ok ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {r.ok ? '✓' : '·'}
                  </div>
                  <span className={`text-xs ${r.ok ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>{r.label}</span>
                </div>
              ))}
            </div>
          )}

          {error   && <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
          {success && (
            <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {success}
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-50"
              style={{ background: ACCENT }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Update Password'}
            </button>
          </div>
        </form>

        {/* Security Tips */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Security Tips</p>
          </div>
          <div className="p-5 space-y-4">
            {[
              { title: 'Use a strong password',    body: 'Mix uppercase, lowercase, numbers and symbols.' },
              { title: 'Never share your password', body: 'Your law firm team will never ask for your password.' },
              { title: 'Change periodically',       body: 'Update your password every 3–6 months for safety.' },
              { title: 'Use unique passwords',      body: 'Avoid reusing passwords across different services.' },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                     style={{ background: `${ACCENT}15` }}>
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{tip.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
