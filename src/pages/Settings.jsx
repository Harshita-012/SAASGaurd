import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  RotateCcw,
  Building2,
  Shield,
  Save,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  Palette,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const Settings = () => {
  const {
    company,
    setCompany,
    inactivityThreshold,
    updateInactivityThreshold,
    resetDemoData,
    subscriptions,
    employees,
    assignments,
  } = useData();

  const [formData, setFormData] = useState({
    name: company.name || 'ApexCloud Technologies',
    domain: company.domain || 'apexcloud.io',
    industry: company.industry || 'Enterprise Software',
    currency: company.currency || 'USD',
    currencySymbol: company.currencySymbol || '$',
    primaryAdmin: company.primaryAdmin || 'Sarah Chen',
  });

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveCompany = (e) => {
    e.preventDefault();
    setCompany((prev) => ({
      ...prev,
      ...formData,
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportWorkspaceJSON = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      company,
      subscriptions,
      employees,
      assignments,
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `saasguard-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div>
        <h2 className="text-xl font-bold text-plum-900 tracking-tight">Workspace & System Settings</h2>
        <p className="text-xs text-mutedgray">
          Configure organization parameters, audit thresholds, and manage sample demo data
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Workspace profile saved successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Profile Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-subtle space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-ivory-200">
              <div className="w-9 h-9 rounded-xl bg-plum-900 text-lime flex items-center justify-center font-bold text-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-plum-900">Organization Identity</h3>
                <p className="text-xs text-mutedgray">General corporate parameters and contact admin</p>
              </div>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-plum-900 mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none focus:ring-2 focus:ring-plum-800/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-plum-900 mb-1">Corporate Domain</label>
                  <input
                    type="text"
                    required
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none focus:ring-2 focus:ring-plum-800/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-plum-900 mb-1">Industry Sector</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-plum-900 mb-1">Reporting Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-plum-900 mb-1">Primary Administrator</label>
                  <input
                    type="text"
                    value={formData.primaryAdmin}
                    onChange={(e) => setFormData({ ...formData, primaryAdmin: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-lime hover:bg-lime-dark text-plum-900 text-xs font-bold flex items-center gap-2 shadow-subtle transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Organization Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Audit & Inactivity Thresholds */}
          <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-subtle space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-ivory-200">
              <div className="w-9 h-9 rounded-xl bg-plum-800 text-white flex items-center justify-center font-bold text-sm">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-plum-900">Governance & Usage Thresholds</h3>
                <p className="text-xs text-mutedgray">Trigger warnings for dormant software licenses</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-ivory border border-ivory-300">
              <div>
                <p className="text-xs font-bold text-plum-900">Inactivity Trigger Limit</p>
                <p className="text-[11px] text-mutedgray mt-0.5">
                  Accounts without logins for this many days will be flagged as potentially unused.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {[30, 45, 60].map((days) => (
                  <button
                    key={days}
                    onClick={() => updateInactivityThreshold(days)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      inactivityThreshold === days
                        ? 'bg-plum-900 text-lime shadow-xs'
                        : 'bg-white hover:bg-ivory-200 text-plum-900 border border-ivory-300'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Demo Reset & Brand Guide & Backup */}
        <div className="space-y-6">
          {/* Reset Demo Data Action */}
          <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-subtle space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-900">Reset Demo Data</h3>
                <p className="text-[11px] text-mutedgray">Restore initial seed JSON records</p>
              </div>
            </div>

            <p className="text-xs text-mutedgray leading-relaxed">
              Clears all modifications in browser localStorage and reloads the pristine seed datasets (12 employees, 10 subscriptions, and sample usage data).
            </p>

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>

          {/* Backup Workspace Data */}
          <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-plum-900">Workspace Backup</h3>
            <p className="text-xs text-mutedgray leading-relaxed">
              Export your current local database state, including customized subscriptions and employee entitlements as JSON.
            </p>

            <button
              onClick={handleExportWorkspaceJSON}
              className="w-full py-2.5 rounded-xl bg-ivory-200 hover:bg-ivory-300 text-plum-900 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full Workspace JSON</span>
            </button>
          </div>

          {/* Palette Preview */}
          <div className="bg-plum-900 text-white rounded-3xl p-6 border border-plum-800 shadow-subtle space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-lime" />
              <h3 className="text-sm font-bold text-white">Visual Palette Tokens</h3>
            </div>
            <p className="text-[11px] text-lavender/70">
              Midnight Plum (#21152F), Electric Lime (#C8F169), Soft Lavender (#E8DFF4), Warm Ivory (#F8F6F0).
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-6 h-6 rounded-lg bg-[#21152F] border border-plum-700" title="Midnight Plum" />
              <div className="w-6 h-6 rounded-lg bg-[#342344]" title="Dark Aubergine" />
              <div className="w-6 h-6 rounded-lg bg-[#C8F169]" title="Electric Lime" />
              <div className="w-6 h-6 rounded-lg bg-[#E8DFF4]" title="Soft Lavender" />
              <div className="w-6 h-6 rounded-lg bg-[#F8F6F0] border border-ivory-300" title="Warm Ivory" />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Resetting Data */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetDemoData}
        title="Reset Demo Data"
        message="Are you sure you want to reset all data back to original seed JSON? All customized subscriptions, added team members, and modified offboarding checklists will be permanently cleared from browser memory."
        confirmText="Confirm Reset"
      />
    </div>
  );
};
