import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Users,
  Layers,
  Trash2,
  AlertCircle,
  Filter,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatCurrency, getMonthlyCost } from '../utils/helpers';

export const AccessManagement = () => {
  const {
    employees,
    subscriptions,
    assignments,
    assignApplication,
    removeAssignment,
  } = useData();

  const [viewMode, setViewMode] = useState('by-employee'); // 'by-employee' | 'by-application'
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Assign Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    subscriptionId: '',
    role: 'Member',
    accessLevel: 'Member',
  });
  const [assignError, setAssignError] = useState('');
  const [removeId, setRemoveId] = useState(null);

  // Grouped by Employee view
  const employeeGroups = useMemo(() => {
    return employees
      .filter((emp) => {
        const matchesSearch =
          emp.name.toLowerCase().includes(search.toLowerCase()) ||
          emp.email.toLowerCase().includes(search.toLowerCase()) ||
          emp.department.toLowerCase().includes(search.toLowerCase());
        const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
        return matchesSearch && matchesDept;
      })
      .map((emp) => {
        const empAssignments = assignments
          .filter((a) => a.employeeId === emp.id)
          .map((a) => ({
            ...a,
            subscription: subscriptions.find((s) => s.id === a.subscriptionId),
          }))
          .filter((a) => a.subscription);

        const totalCost = empAssignments.reduce(
          (acc, a) => acc + getMonthlyCost(a.subscription),
          0
        );

        return {
          employee: emp,
          assignments: empAssignments,
          totalCost,
        };
      });
  }, [employees, assignments, subscriptions, search, selectedDept]);

  // Grouped by Application view
  const applicationGroups = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        return (
          sub.applicationName.toLowerCase().includes(search.toLowerCase()) ||
          sub.vendor.toLowerCase().includes(search.toLowerCase()) ||
          sub.category.toLowerCase().includes(search.toLowerCase())
        );
      })
      .map((sub) => {
        const subAssignments = assignments
          .filter((a) => a.subscriptionId === sub.id)
          .map((a) => ({
            ...a,
            employee: employees.find((e) => e.id === a.employeeId),
          }))
          .filter((a) => a.employee);

        return {
          subscription: sub,
          assignments: subAssignments,
        };
      });
  }, [subscriptions, assignments, employees, search]);

  const handleOpenAssignModal = (prefillEmpId = '', prefillSubId = '') => {
    setAssignForm({
      employeeId: prefillEmpId || employees[0]?.id || '',
      subscriptionId: prefillSubId || subscriptions[0]?.id || '',
      role: 'Member',
      accessLevel: 'Member',
    });
    setAssignError('');
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    setAssignError('');

    const res = assignApplication(
      assignForm.employeeId,
      assignForm.subscriptionId,
      assignForm.role,
      assignForm.accessLevel
    );

    if (res.success) {
      setIsAssignModalOpen(false);
    } else {
      setAssignError(res.message || 'Failed to assign application.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-plum-900 tracking-tight">Access Management</h2>
          <p className="text-xs text-mutedgray">
            Mapping employee entitlements, license allocation, and role authorization
          </p>
        </div>

        <button
          onClick={() => handleOpenAssignModal()}
          className="px-4 py-2 rounded-xl bg-lime hover:bg-lime-dark text-plum-900 text-xs font-bold flex items-center gap-2 shadow-subtle transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Grant New Access</span>
        </button>
      </div>

      {/* Switcher & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-ivory-300 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Toggle between By Employee and By Application */}
        <div className="flex items-center gap-1.5 p-1 bg-ivory rounded-xl border border-ivory-300 text-xs font-semibold">
          <button
            onClick={() => setViewMode('by-employee')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'by-employee'
                ? 'bg-plum-900 text-white shadow-xs'
                : 'text-mutedgray hover:text-plum-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>By Employee ({employees.length})</span>
          </button>
          <button
            onClick={() => setViewMode('by-application')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'by-application'
                ? 'bg-plum-900 text-white shadow-xs'
                : 'text-mutedgray hover:text-plum-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>By Application ({subscriptions.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-mutedgray absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              viewMode === 'by-employee'
                ? 'Search by employee or department...'
                : 'Search by application or vendor...'
            }
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none focus:ring-2 focus:ring-plum-800/20"
          />
        </div>
      </div>

      {/* Content based on View Mode */}
      {viewMode === 'by-employee' ? (
        /* BY EMPLOYEE VIEW */
        <div className="space-y-4">
          {employeeGroups.map(({ employee, assignments: empAssignments, totalCost }) => (
            <div
              key={employee.id}
              className="bg-white rounded-3xl p-5 border border-ivory-300 shadow-subtle space-y-4"
            >
              {/* Employee Summary Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ivory-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-plum-800 text-white font-bold flex items-center justify-center text-xs">
                    {employee.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-plum-900 text-sm">{employee.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-ivory-200 text-plum-900 font-semibold">
                        {employee.department}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          employee.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {employee.status}
                      </span>
                    </div>
                    <p className="text-xs text-mutedgray">{employee.designation} • {employee.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-mutedgray block uppercase tracking-wider font-semibold">
                      Allocated Cost
                    </span>
                    <span className="text-xs font-black text-plum-900">
                      {formatCurrency(totalCost)}/mo
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenAssignModal(employee.id, '')}
                    className="px-3 py-1.5 rounded-xl bg-ivory-200 hover:bg-plum-800 hover:text-white text-plum-900 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign App</span>
                  </button>
                </div>
              </div>

              {/* Badges / Table of assigned applications */}
              {empAssignments.length === 0 ? (
                <p className="text-xs text-mutedgray italic py-2">No applications currently assigned.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {empAssignments.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-2xl bg-ivory border border-ivory-300 flex items-center justify-between group hover:border-plum-800/40 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-plum-900 text-lime font-bold text-xs flex items-center justify-center shrink-0">
                          {a.subscription.applicationName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-plum-900 truncate">
                            {a.subscription.applicationName}
                          </p>
                          <p className="text-[10px] text-mutedgray truncate">
                            {a.role} • <span className="font-semibold text-plum-900">{a.accessLevel}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setRemoveId(a.id)}
                        className="p-1.5 rounded-lg text-mutedgray hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-70 group-hover:opacity-100"
                        title="Revoke access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* BY APPLICATION VIEW */
        <div className="space-y-4">
          {applicationGroups.map(({ subscription, assignments: subAssignments }) => {
            const utilization = Math.round(
              (subAssignments.length / (subscription.totalLicences || 1)) * 100
            );

            return (
              <div
                key={subscription.id}
                className="bg-white rounded-3xl p-5 border border-ivory-300 shadow-subtle space-y-4"
              >
                {/* App Summary Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ivory-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-plum-900 text-lime font-bold flex items-center justify-center text-sm">
                      {subscription.applicationName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-plum-900 text-sm">
                          {subscription.applicationName}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-ivory-200 text-plum-900 font-semibold">
                          {subscription.category}
                        </span>
                      </div>
                      <p className="text-xs text-mutedgray">
                        Vendor: {subscription.vendor} • Plan: {subscription.billingCycle} ({formatCurrency(subscription.cost)})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right min-w-[120px]">
                      <span className="text-[10px] text-mutedgray block uppercase tracking-wider font-semibold">
                        Seat Utilization
                      </span>
                      <span className="text-xs font-black text-plum-900">
                        {subAssignments.length} of {subscription.totalLicences} ({utilization}%)
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenAssignModal('', subscription.id)}
                      className="px-3 py-1.5 rounded-xl bg-ivory-200 hover:bg-plum-800 hover:text-white text-plum-900 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign User</span>
                    </button>
                  </div>
                </div>

                {/* Grid of employees assigned */}
                {subAssignments.length === 0 ? (
                  <p className="text-xs text-mutedgray italic py-2">
                    No employees currently assigned to this software application.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subAssignments.map((a) => (
                      <div
                        key={a.id}
                        className="p-3 rounded-2xl bg-ivory border border-ivory-300 flex items-center justify-between group hover:border-plum-800/40 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-plum-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {a.employee.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-plum-900 truncate">
                              {a.employee.name}
                            </p>
                            <p className="text-[10px] text-mutedgray truncate">
                              {a.employee.department} • <span className="font-semibold text-plum-900">{a.role}</span>
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setRemoveId(a.id)}
                          className="p-1.5 rounded-lg text-mutedgray hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-70 group-hover:opacity-100"
                          title="Revoke access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Grant Access Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Grant Application Access"
        subtitle="Provision a software licence and entitlement role to a team member"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          {assignError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{assignError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-plum-900 mb-1">Select Employee *</label>
            <select
              value={assignForm.employeeId}
              onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department} — {emp.designation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-plum-900 mb-1">Select Application *</label>
            <select
              value={assignForm.subscriptionId}
              onChange={(e) => setAssignForm({ ...assignForm, subscriptionId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
            >
              {subscriptions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.applicationName} ({sub.assignedLicences}/{sub.totalLicences} seats — {formatCurrency(getMonthlyCost(sub))}/mo)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Assigned Role</label>
              <input
                type="text"
                value={assignForm.role}
                onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })}
                placeholder="e.g. Workspace Member, Admin, Editor"
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Access Level</label>
              <select
                value={assignForm.accessLevel}
                onChange={(e) => setAssignForm({ ...assignForm, accessLevel: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              >
                <option value="Admin">Admin</option>
                <option value="Write">Write / Editor</option>
                <option value="Member">Member</option>
                <option value="Read">Read Only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-ivory-200">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-plum-900 bg-ivory-200 hover:bg-ivory-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-lime hover:bg-lime-dark text-plum-900 shadow-subtle transition-all"
            >
              Confirm Entitlement
            </button>
          </div>
        </form>
      </Modal>

      {/* Revocation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(removeId)}
        onClose={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) removeAssignment(removeId);
        }}
        title="Revoke Application Access"
        message="Are you sure you want to revoke this application assignment? The user seat will be returned to the unassigned license pool."
        confirmText="Revoke Access"
      />
    </div>
  );
};
