import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  RotateCcw,
  UserCheck,
  Trash2,
  Info,
  DollarSign,
  Layers,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  formatCurrency,
  getMonthlyCost,
  formatDate,
  getDaysInactive,
} from '../utils/helpers';

export const UsageMonitoring = () => {
  const {
    employees,
    subscriptions,
    usage,
    assignments,
    inactivityThreshold,
    updateInactivityThreshold,
    removeAssignment,
    addNotification,
  } = useData();

  const [search, setSearch] = useState('');
  const [filterApp, setFilterApp] = useState('All');
  const [reclaimAssignmentId, setReclaimAssignmentId] = useState(null);
  const [successBanner, setSuccessBanner] = useState('');

  // Enriched usage records
  const enrichedUsage = useMemo(() => {
    return usage.map((u) => {
      const emp = employees.find((e) => e.id === u.employeeId);
      const sub = subscriptions.find((s) => s.id === u.subscriptionId);
      const assignment = assignments.find(
        (a) => a.employeeId === u.employeeId && a.subscriptionId === u.subscriptionId
      );
      const days = getDaysInactive(u.lastActive);
      const isPotentiallyUnused = days >= inactivityThreshold;
      const monthlyCost = sub ? getMonthlyCost(sub) : 0;

      return {
        ...u,
        employee: emp,
        subscription: sub,
        assignment,
        daysInactive: days,
        isPotentiallyUnused,
        monthlyCost,
      };
    });
  }, [usage, employees, subscriptions, assignments, inactivityThreshold]);

  // Filtered list
  const filteredList = useMemo(() => {
    return enrichedUsage
      .filter((item) => {
        if (!item.employee || !item.subscription) return false;
        const matchesSearch =
          item.employee.name.toLowerCase().includes(search.toLowerCase()) ||
          item.subscription.applicationName.toLowerCase().includes(search.toLowerCase()) ||
          item.employee.department.toLowerCase().includes(search.toLowerCase());
        const matchesApp =
          filterApp === 'All' || item.subscription.id === filterApp;
        return matchesSearch && matchesApp;
      })
      .sort((a, b) => b.daysInactive - a.daysInactive);
  }, [enrichedUsage, search, filterApp]);

  // Aggregate stats
  const potentiallyUnusedItems = enrichedUsage.filter((u) => u.isPotentiallyUnused);
  const potentialWastedSpend = potentiallyUnusedItems.reduce(
    (acc, curr) => acc + curr.monthlyCost,
    0
  );

  const handleNotifyEmployee = (item) => {
    addNotification({
      type: 'general',
      title: `Usage Verification Sent: ${item.employee.name}`,
      message: `Inactivity check sent to ${item.employee.email} for ${item.subscription.applicationName}.`,
      actionUrl: '/usage',
    });
    setSuccessBanner(
      `Usage confirmation request sent to ${item.employee.name} (${item.employee.email}).`
    );
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  const handleConfirmReclaim = () => {
    if (!reclaimAssignmentId) return;
    removeAssignment(reclaimAssignmentId);
    setReclaimAssignmentId(null);
    setSuccessBanner('License successfully reclaimed and returned to the company unallocated pool.');
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-plum-900 tracking-tight">Software Usage Monitoring</h2>
          <p className="text-xs text-mutedgray">
            Audit last-active timestamps to detect dormant seats and optimize spend
          </p>
        </div>

        {/* Inactivity Threshold Picker (30, 45, 60 days) */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-ivory-300 rounded-2xl shadow-sm self-start sm:self-auto">
          <span className="text-xs font-bold text-plum-900 pl-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-mutedgray" />
            <span>Inactivity Threshold:</span>
          </span>
          {[30, 45, 60].map((days) => (
            <button
              key={days}
              onClick={() => updateInactivityThreshold(days)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                inactivityThreshold === days
                  ? 'bg-plum-900 text-lime shadow-xs'
                  : 'bg-ivory hover:bg-ivory-200 text-plum-900'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Disclaimers & Alert Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Important Audit Guideline:</strong> Flagged accounts are categorized as{' '}
          <span className="underline font-bold">potentially unused</span> based on application login timestamps.
          Some team members may consume services via third-party integrations, webhook bots or client meetings. We recommend
          verifying with the user or manager prior to permanent seat de-provisioning.
        </div>
      </div>

      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Top Stat Cards for Usage */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-ivory-300 shadow-subtle">
          <span className="text-xs font-semibold text-mutedgray">Potentially Inactive Licences</span>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {potentiallyUnusedItems.length}{' '}
            <span className="text-xs font-medium text-mutedgray">of {usage.length} total tracked</span>
          </p>
          <p className="text-[11px] text-mutedgray mt-1">
            Inactive for {inactivityThreshold}+ consecutive days
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-ivory-300 shadow-subtle">
          <span className="text-xs font-semibold text-mutedgray">At-Risk Monthly Spending</span>
          <p className="text-2xl font-black text-plum-900 mt-1">
            {formatCurrency(potentialWastedSpend)}
            <span className="text-xs font-medium text-mutedgray"> / month</span>
          </p>
          <p className="text-[11px] text-mutedgray mt-1">
            {formatCurrency(potentialWastedSpend * 12)} annualized opportunity
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-ivory-300 shadow-subtle">
          <span className="text-xs font-semibold text-mutedgray">Current Audit Threshold</span>
          <p className="text-2xl font-black text-plum-900 mt-1">{inactivityThreshold} Days</p>
          <p className="text-[11px] text-mutedgray mt-1">Configurable by company administrator</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-ivory-300 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-mutedgray absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by employee name, department or software application..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none focus:ring-2 focus:ring-plum-800/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-mutedgray" />
          <select
            value={filterApp}
            onChange={(e) => setFilterApp(e.target.value)}
            className="py-1.5 px-3 rounded-lg bg-ivory border border-ivory-300 text-plum-900 text-xs font-medium focus:outline-none"
          >
            <option value="All">All Tracked Applications</option>
            {subscriptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.applicationName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Detailed Usage Table */}
      <div className="bg-white rounded-3xl border border-ivory-300 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ivory/80 border-b border-ivory-200 text-[11px] font-bold text-mutedgray uppercase tracking-wider">
                <th className="py-4 px-6">Employee</th>
                <th className="py-4 px-4">Application</th>
                <th className="py-4 px-4">Last Active</th>
                <th className="py-4 px-4">Days Inactive</th>
                <th className="py-4 px-4">Licence Cost</th>
                <th className="py-4 px-4">Audit Status</th>
                <th className="py-4 px-6 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200 text-xs">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-mutedgray">
                    No usage activity records found.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      item.isPotentiallyUnused
                        ? 'bg-rose-50/20 hover:bg-rose-50/40'
                        : 'hover:bg-ivory/40'
                    }`}
                  >
                    {/* Employee */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-plum-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {item.employee.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-plum-900">{item.employee.name}</p>
                          <p className="text-[11px] text-mutedgray">{item.employee.department}</p>
                        </div>
                      </div>
                    </td>

                    {/* App */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-plum-900">{item.subscription.applicationName}</span>
                      </div>
                    </td>

                    {/* Last active date */}
                    <td className="py-4 px-4">
                      <span className="font-medium text-plum-900">{formatDate(item.lastActive)}</span>
                    </td>

                    {/* Days Inactive */}
                    <td className="py-4 px-4">
                      <span
                        className={`font-black ${
                          item.isPotentiallyUnused ? 'text-rose-600' : 'text-plum-900'
                        }`}
                      >
                        {item.daysInactive} days
                      </span>
                    </td>

                    {/* Monthly Cost */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-plum-900">
                        {formatCurrency(item.monthlyCost)}
                        <span className="text-[10px] text-mutedgray font-normal">/mo</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {item.isPotentiallyUnused ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Potentially Unused</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active Usage</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      {item.isPotentiallyUnused ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleNotifyEmployee(item)}
                            className="px-2.5 py-1 rounded-lg bg-ivory-200 hover:bg-ivory-300 text-plum-900 text-[11px] font-bold transition-all"
                            title="Verify with employee"
                          >
                            Verify
                          </button>
                          {item.assignment && (
                            <button
                              onClick={() => setReclaimAssignmentId(item.assignment.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-all shadow-subtle"
                              title="Reclaim and return to seat pool"
                            >
                              Reclaim Seat
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-mutedgray">No action required</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog for Reclaiming Seat */}
      <ConfirmDialog
        isOpen={Boolean(reclaimAssignmentId)}
        onClose={() => setReclaimAssignmentId(null)}
        onConfirm={handleConfirmReclaim}
        title="Reclaim Software Licence"
        message="Are you sure you want to reclaim this potentially unused licence? Access will be removed for this employee and the seat count returned to the unassigned subscription pool."
        confirmText="Confirm Reclaim"
      />
    </div>
  );
};
