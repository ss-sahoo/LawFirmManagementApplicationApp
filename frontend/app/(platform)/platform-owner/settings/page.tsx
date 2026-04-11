'use client';

import { useState, useEffect } from 'react';
import { PageSection, Panel, FormGrid, SplitPanels } from '@/components/platform/ui';
import { ToggleLeft, ToggleRight, Loader2, Save } from 'lucide-react';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';
import { ChangePasswordPanel } from '@/components/platform/page-templates';

export default function PlatformOwnerSettingsPage() {
  const accent = "#0e2340";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    id: "",
    is_free_trial_enabled: true,
    trial_period_days: 14,
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await customFetch(API.CONFIG.GET);
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const response = await customFetch(API.CONFIG.UPDATE, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_free_trial_enabled: settings.is_free_trial_enabled,
          trial_period_days: settings.trial_period_days
        })
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        alert("Settings updated successfully!");
      } else {
        alert("Failed to update settings.");
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("An error occurred while updating settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#0e2340]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-0">
      <PageSection 
        eyebrow="Settings" 
        title="Platform Configuration" 
        description="Manage your personal profile, platform account credentials, and global law firm trial rules." 
      />
      
      <SplitPanels
        left={
          <div className="space-y-8">
            <Panel title="Personal Information" subtitle="Your basic details and contact preferences.">
              <FormGrid
                fields={[
                  { label: 'Full Name', placeholder: 'Platform Admin' },
                  { label: 'Email Address', placeholder: 'admin@platform.com', type: 'email' },
                  { label: 'Phone Number', placeholder: '+91 9876543210' },
                ]}
                columns={2}
              />
            </Panel>

            <ChangePasswordPanel accent={accent} />
            
            <Panel title="Law Firm Global Settings" subtitle="Configure system-wide defaults for onboarding law firms.">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Enable Free Trial Globally</h3>
                    <p className="text-xs text-gray-500 mt-1">If enabled, new law firms automatically receive the default trial plan.</p>
                  </div>
                  <button 
                    onClick={() => setSettings(s => ({ ...s, is_free_trial_enabled: !s.is_free_trial_enabled }))}
                    className="text-[#0e2340] hover:opacity-80 transition-opacity"
                  >
                    {settings.is_free_trial_enabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-gray-400" />}
                  </button>
                </div>

                {settings.is_free_trial_enabled && (
                  <div className="grid grid-cols-2 gap-6 pt-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Free Trial Period (Days)</label>
                      <input 
                        type="number" 
                        value={settings.trial_period_days} 
                        onChange={(e) => setSettings(s => ({ ...s, trial_period_days: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0e2340]/20 focus:border-[#0e2340] placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Panel>

            <div className="flex justify-end pt-2">
              <button 
                onClick={handleUpdate}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#0e2340] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#15345d] transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Platform Settings"}
              </button>
            </div>
          </div>
        }
        right={
          <Panel title="Configuration Logs" subtitle="Internal audit trail of settings modifications.">
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-gray-100 bg-[#f7f8fa]">
                <p className="text-sm text-gray-700"><strong>Free Trial Enabled</strong></p>
                <p className="text-xs text-gray-500 mt-1">Modified by Admin - 12 days ago</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-[#f7f8fa]">
                <p className="text-sm text-gray-700"><strong>Trial Days updated to 14</strong></p>
                <p className="text-xs text-gray-500 mt-1">Modified by Admin - 45 days ago</p>
              </div>
            </div>
          </Panel>
        }
      />
    </div>
  );
}
