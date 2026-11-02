import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Building,
  Calendar,
  Shield,
  UserMinus,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatDate, formatCurrency, getMonthlyCost } from '../utils/helpers';

export const Employees = ({ setActivePage }) => {
  const {
    employees,
    subscriptions,
    assignments,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    startOffboarding,
  } = useData();

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [viewingEmp, setViewingEmp] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    designation: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active',
  });

  const departments = useMemo(() => {
    const list = Array.from(new Set(employees.map((e) => e.department)));
    return ['All', ...list];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.designation.toLowerCase().includes(search.toLowerCase());
      const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter;
      const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, search, departmentFilter, statusFilter]);

  const openAddModal = () => {
    setEditingEmp(null);
    setFormData({
      name: '',
      email: '',
      department: 'Engineering',
      designation: '',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingEmp(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      department: emp.department,
      designation: emp.designation,
      joiningDate: emp.joiningDate,
      status: emp.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (editingEmp) {
      updateEmployee(editingEmp.id, formData);
    } else {
      addEmployee(formData);
    }
    setIsModalOpen(false);
  };

  // Profile details for selected employee
  const selectedEmpAssignments = useMemo(() => {
    if (!viewingEmp) return [];
    return assignments
      .filter((a) => a.employeeId === viewingEmp.id)
      .map((a) => {
        const sub = subscriptions.find((s) => s.id === a.subscriptionId);
        return {
          ...a,
          subscription: sub,
        };
      });
  }, [viewingEmp, assignments, subscriptions]);

  const selectedEmpTotalCost = useMemo(() => {
    return selectedEmpAssignments.reduce((acc, curr) => {
      if (curr.subscription) {
        return acc + getMonthlyCost(curr.subscription);
      }
      return acc;
    }, 0);
  }, [selectedEmpAssignments]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-plum-900 tracking-tight">Employee Directory</h2>
          <p className="text-xs text-mutedgray">
            Managing access profiles and seat entitlements for {employees.length} team members
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-lime hover:bg-lime-dark text-plum-900 text-xs font-bold flex items-center gap-2 shadow-subtle transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-ivory-300 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-mutedgray absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee by name, email or designation..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none focus:ring-2 focus:ring-plum-800/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-mutedgray">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg bg-ivory border border-ivory-300 text-plum-900 text-xs font-medium focus:outline-none"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg bg-ivory border border-ivory-300 text-plum-900 text-xs font-medium focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Offboarding">Offboarding</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-3xl border border-ivory-300 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ivory/80 border-b border-ivory-200 text-[11px] font-bold text-mutedgray uppercase tracking-wider">
                <th className="py-4 px-6">Employee</th>
                <th className="py-4 px-4">Department & Role</th>
                <th className="py-4 px-4">Joining Date</th>
                <th className="py-4 px-4">Assigned Apps</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200 text-xs">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-mutedgray">
                    No employees found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const empAppCount = assignments.filter((a) => a.employeeId === emp.id).length;

                  return (
                    <tr key={emp.id} className="hover:bg-ivory/40 transition-colors group">
                      {/* Name & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-plum-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {emp.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <button
                              onClick={() => setViewingEmp(emp)}
                              className="font-bold text-plum-900 hover:text-plum-700 hover:underline text-left"
                            >
                              {emp.name}
                            </button>
                            <p className="text-[11px] text-mutedgray flex items-center gap-1">
                              <Mail className="w-3 h-3 text-mutedgray" />
                              {emp.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department & Role */}
                      <td className="py-4 px-4">
                        <p className="font-semibold text-plum-900">{emp.department}</p>
                        <p className="text-[11px] text-mutedgray">{emp.designation}</p>
                      </td>

                      {/* Joining Date */}
                      <td className="py-4 px-4">
                        <span className="font-medium text-plum-900">{formatDate(emp.joiningDate)}</span>
                      </td>

                      {/* Assigned Apps */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => setViewingEmp(emp)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ivory-200 hover:bg-ivory-300 text-plum-900 font-bold transition-colors"
                        >
                          <Layers className="w-3.5 h-3.5 text-plum-800" />
                          <span>{empAppCount} Apps</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            emp.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : emp.status === 'Offboarding'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingEmp(emp)}
                            className="p-1.5 rounded-lg text-mutedgray hover:text-plum-900 hover:bg-ivory-200 transition-colors"
                            title="View Profile & Access"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-1.5 rounded-lg text-mutedgray hover:text-plum-900 hover:bg-ivory-200 transition-colors"
                            title="Edit Employee"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(emp.id)}
                            className="p-1.5 rounded-lg text-mutedgray hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmp ? 'Edit Employee Profile' : 'Add New Employee'}
        subtitle={
          editingEmp
            ? `Update identity and department records for ${editingEmp.name}`
            : 'Register a new team member to track software allocations'
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Alex Henderson"
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none focus:ring-2 focus:ring-plum-800/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Work Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. alex.henderson@apexcloud.io"
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none focus:ring-2 focus:ring-plum-800/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Product Design">Product Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Customer Success">Customer Success</option>
                <option value="Finance & Ops">Finance & Ops</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Designation</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Senior Security Architect"
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Joining Date</label>
              <input
                type="date"
                required
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Offboarding">Offboarding</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-ivory-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-plum-900 bg-ivory-200 hover:bg-ivory-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-lime hover:bg-lime-dark text-plum-900 shadow-subtle transition-all"
            >
              {editingEmp ? 'Save Changes' : 'Create Profile'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Employee Profile View Modal */}
      {viewingEmp && (
        <Modal
          isOpen={Boolean(viewingEmp)}
          onClose={() => setViewingEmp(null)}
          title={`Employee Profile: ${viewingEmp.name}`}
          subtitle={`${viewingEmp.designation} • ${viewingEmp.department}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {/* Summary card */}
            <div className="p-4 rounded-2xl bg-ivory border border-ivory-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-plum-900 text-lime font-bold text-base flex items-center justify-center">
                  {viewingEmp.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h4 className="font-bold text-plum-900 text-base">{viewingEmp.name}</h4>
                  <p className="text-xs text-mutedgray">{viewingEmp.email}</p>
                  <p className="text-[11px] text-mutedgray mt-0.5">Joined {formatDate(viewingEmp.joiningDate)}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-mutedgray">Monthly App Spend</span>
                <p className="text-lg font-black text-plum-900">{formatCurrency(selectedEmpTotalCost)}</p>
              </div>
            </div>

            {/* Assigned Applications Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-bold text-plum-900 uppercase tracking-wider">
                  Assigned Licences ({selectedEmpAssignments.length})
                </h5>
                {viewingEmp.status === 'Active' && (
                  <button
                    onClick={() => {
                      startOffboarding(viewingEmp.id);
                      setViewingEmp(null);
                      if (setActivePage) setActivePage('offboarding');
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>Initiate Offboarding</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {selectedEmpAssignments.length === 0 ? (
                  <div className="p-6 text-center text-xs text-mutedgray bg-ivory/50 rounded-xl">
                    No software applications currently assigned to this user.
                  </div>
                ) : (
                  selectedEmpAssignments.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-white border border-ivory-300 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-plum-800 text-lime flex items-center justify-center text-xs font-bold">
                          {item.subscription?.applicationName?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-plum-900">
                            {item.subscription?.applicationName || 'Unknown App'}
                          </p>
                          <p className="text-[11px] text-mutedgray">
                            Role: <span className="font-semibold text-plum-900">{item.role}</span> • Level:{' '}
                            <span className="font-semibold text-plum-900">{item.accessLevel}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-extrabold text-plum-900">
                          {formatCurrency(getMonthlyCost(item.subscription))}
                          <span className="text-[10px] text-mutedgray font-normal">/mo</span>
                        </p>
                        <p className="text-[10px] text-mutedgray">Assigned {formatDate(item.assignedDate)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-ivory-200">
              <button
                type="button"
                onClick={() => setViewingEmp(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-plum-900 bg-ivory-200 hover:bg-ivory-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteEmployee(deleteId);
        }}
        title="Remove Employee"
        message="Are you sure you want to remove this employee from SaaSGuard? All current licence assignments and usage history will be revoked."
        confirmText="Remove Employee"
      />
    </div>
  );
};
