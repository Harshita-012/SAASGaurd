import React, { useState, useMemo } from 'react';
import {
  UserMinus,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Shield,
  Layers,
  FileCheck,
  Check,
  AlertCircle,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Modal } from '../components/Modal';
import { formatDate } from '../utils/helpers';

export const Offboarding = () => {
  const {
    employees,
    assignments,
    subscriptions,
    offboarding,
    startOffboarding,
    toggleOffboardingTask,
    completeOffboardingWorkflow,
  } = useData();

  const [isInitiateModalOpen, setIsInitiateModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [initiateError, setInitiateError] = useState('');

  // Active cases vs History
  const activeCases = useMemo(
    () => offboarding.filter((o) => o.status === 'In Progress'),
    [offboarding]
  );

  const completedHistory = useMemo(
    () => offboarding.filter((o) => o.status === 'Completed'),
    [offboarding]
  );

  // Eligible employees for initiating new offboarding (not already In Progress)
  const eligibleEmployees = useMemo(() => {
    const activeCaseEmpIds = activeCases.map((c) => c.employeeId);
    return employees.filter(
      (e) => !activeCaseEmpIds.includes(e.id) && e.status !== 'Inactive'
    );
  }, [employees, activeCases]);

  const handleOpenInitiateModal = () => {
    setSelectedEmpId(eligibleEmployees[0]?.id || '');
    setTargetDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setNotes('');
    setInitiateError('');
    setIsInitiateModalOpen(true);
  };

  const handleInitiateSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmpId) {
      setInitiateError('Please select an employee.');
      return;
    }

    const res = startOffboarding(selectedEmpId, targetDate, notes);
    if (res.success) {
      setIsInitiateModalOpen(false);
    } else {
      setInitiateError(res.message || 'Failed to start offboarding.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-plum-900 tracking-tight">
            Employee Offboarding & Access Revocation
          </h2>
          <p className="text-xs text-mutedgray">
            Structured access termination workflows, checklists, and audit logging
          </p>
        </div>

        <button
          onClick={handleOpenInitiateModal}
          className="px-4 py-2 rounded-xl bg-lime hover:bg-lime-dark text-plum-900 text-xs font-bold flex items-center gap-2 shadow-subtle transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Initiate Exit Workflow</span>
        </button>
      </div>

      {/* Manual Revocation Guideline Banner */}
      <div className="p-4 rounded-2xl bg-plum-900 text-white border border-plum-800 flex items-start gap-3 shadow-subtle">
        <div className="w-8 h-8 rounded-xl bg-plum-800 text-lime flex items-center justify-center shrink-0 mt-0.5">
          <Shield className="w-4 h-4" />
        </div>
        <div className="text-xs text-lavender/90 leading-relaxed">
          <strong className="text-white">Security Notice (Manual Protocol):</strong> In this SaaSGuard MVP, access revocation checklists guide administrators through manual de-provisioning within third-party consoles (SSO, Slack, GitHub, AWS). SaaSGuard provides verifiable audit tracking and state persistence.
        </div>
      </div>

      {/* Active Offboarding Cases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-plum-900 uppercase tracking-wider flex items-center gap-2">
            <span>In-Progress Offboarding Workflows</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {activeCases.length}
            </span>
          </h3>
        </div>

        {activeCases.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-ivory-300 shadow-subtle">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-plum-900">Zero Pending Offboardings</p>
            <p className="text-xs text-mutedgray mt-1">
              All departing personnel have had their accounts successfully closed.
            </p>
          </div>
        ) : (
          activeCases.map((caseItem) => {
            const completedCount = caseItem.tasks.filter((t) => t.status === 'Completed').length;
            const totalCount = caseItem.tasks.length;
            const percent = Math.round((completedCount / (totalCount || 1)) * 100);
            const allTasksCompleted = completedCount === totalCount && totalCount > 0;

            return (
              <div
                key={caseItem.id}
                className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-subtle space-y-5"
              >
                {/* Case Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-ivory-200">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center shrink-0">
                      {caseItem.employeeName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-plum-900">{caseItem.employeeName}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                          Exit in Progress
                        </span>
                      </div>
                      <p className="text-xs text-mutedgray">
                        {caseItem.designation} • {caseItem.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-mutedgray uppercase tracking-wider block font-semibold">
                        Target Date
                      </span>
                      <span className="font-bold text-plum-900 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-mutedgray" />
                        {formatDate(caseItem.targetDate)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-mutedgray uppercase tracking-wider block font-semibold">
                        Initiator
                      </span>
                      <span className="font-bold text-plum-900">{caseItem.initiator}</span>
                    </div>

                    <button
                      disabled={!allTasksCompleted}
                      onClick={() => completeOffboardingWorkflow(caseItem.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-subtle ${
                        allTasksCompleted
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                          : 'bg-ivory-300 text-mutedgray cursor-not-allowed'
                      }`}
                    >
                      Complete Offboarding
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-plum-900">
                      Revocation Progress: {completedCount} of {totalCount} completed ({percent}%)
                    </span>
                    <span className="text-mutedgray text-[11px]">
                      {totalCount - completedCount} pending actions
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-ivory-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        percent === 100 ? 'bg-emerald-500' : 'bg-lime'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {caseItem.notes && (
                  <p className="text-xs text-plum-800 bg-ivory p-3 rounded-xl border border-ivory-300 italic">
                    "{caseItem.notes}"
                  </p>
                )}

                {/* Revocation Checklist Items */}
                <div className="space-y-2 pt-2">
                  <h5 className="text-xs font-bold text-plum-900 uppercase tracking-wider">
                    Application Revocation Checklist
                  </h5>

                  {caseItem.tasks.length === 0 ? (
                    <div className="p-4 text-xs text-mutedgray bg-ivory rounded-xl">
                      No software applications were assigned to this user. You may complete offboarding immediately.
                    </div>
                  ) : (
                    caseItem.tasks.map((task) => {
                      const isCompleted = task.status === 'Completed';

                      return (
                        <div
                          key={task.id}
                          onClick={() => toggleOffboardingTask(caseItem.id, task.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isCompleted
                              ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50/70'
                              : 'bg-white border-ivory-300 hover:border-plum-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                isCompleted
                                  ? 'bg-emerald-600 text-white'
                                  : 'border-2 border-ivory-300 bg-white hover:border-plum-800'
                              }`}
                            >
                              {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                            </div>

                            <div className="min-w-0">
                              <p
                                className={`text-xs font-bold ${
                                  isCompleted ? 'text-plum-900/60 line-through' : 'text-plum-900'
                                }`}
                              >
                                {task.applicationName}
                              </p>
                              <p className="text-[11px] text-mutedgray truncate">{task.actionRequired}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {isCompleted ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                Verified
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                                Pending Action
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Historical Offboardings */}
      <div className="space-y-4 pt-6">
        <h3 className="text-sm font-bold text-plum-900 uppercase tracking-wider flex items-center gap-2">
          <span>Offboarding Archive & Audit Trail</span>
          <span className="px-2 py-0.5 rounded-full bg-ivory-200 text-plum-900 text-xs font-semibold">
            {completedHistory.length}
          </span>
        </h3>

        <div className="bg-white rounded-3xl border border-ivory-300 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ivory/80 border-b border-ivory-200 text-[11px] font-bold text-mutedgray uppercase tracking-wider">
                  <th className="py-4 px-6">Departed Employee</th>
                  <th className="py-4 px-4">Department & Role</th>
                  <th className="py-4 px-4">Initiated</th>
                  <th className="py-4 px-4">Exit Target</th>
                  <th className="py-4 px-4">Tasks Executed</th>
                  <th className="py-4 px-6 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200 text-xs">
                {completedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-mutedgray">
                      No archived offboarding records.
                    </td>
                  </tr>
                ) : (
                  completedHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-ivory/30">
                      <td className="py-4 px-6 font-bold text-plum-900">{item.employeeName}</td>
                      <td className="py-4 px-4 text-mutedgray">
                        {item.department} • {item.designation}
                      </td>
                      <td className="py-4 px-4 text-plum-900">{formatDate(item.startDate)}</td>
                      <td className="py-4 px-4 text-plum-900">{formatDate(item.targetDate)}</td>
                      <td className="py-4 px-4 font-bold text-plum-900">
                        {item.tasks.length} Revocations Completed
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Archived & Closed
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Initiate Offboarding Modal */}
      <Modal
        isOpen={isInitiateModalOpen}
        onClose={() => setIsInitiateModalOpen(false)}
        title="Initiate Employee Offboarding"
        subtitle="Generates an automatic application-by-application access revocation checklist"
      >
        <form onSubmit={handleInitiateSubmit} className="space-y-4">
          {initiateError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{initiateError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-plum-900 mb-1">Select Departing Employee *</label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
            >
              {eligibleEmployees.map((emp) => {
                const assignedCount = assignments.filter((a) => a.employeeId === emp.id).length;
                return (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department} — {assignedCount} assigned apps)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-plum-900 mb-1">Exit Target Date</label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
            >
            </input>
          </div>

          <div>
            <label className="block text-xs font-bold text-plum-900 mb-1">Handover Notes / Instructions</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Transfer enterprise accounts to Liam Gallagher. Reassign document libraries."
              className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-ivory-200">
            <button
              type="button"
              onClick={() => setIsInitiateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-plum-900 bg-ivory-200 hover:bg-ivory-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-lime hover:bg-lime-dark text-plum-900 shadow-subtle transition-all"
            >
              Generate Revocation Checklist
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
