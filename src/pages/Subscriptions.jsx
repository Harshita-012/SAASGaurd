import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Upload,
  Edit2,
  Trash2,
  CreditCard,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  formatCurrency,
  getMonthlyCost,
  formatDate,
  getDaysRemaining,
  exportSubscriptionsToCSV,
  parseCSVToSubscriptions,
} from '../utils/helpers';

export const Subscriptions = () => {
  const {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    importSubscriptions,
  } = useData();

  // Filters and search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [cycleFilter, setCycleFilter] = useState('All');
  const [sortBy, setSortBy] = useState('cost-desc'); // 'cost-desc' | 'cost-asc' | 'renewal-asc' | 'name'

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // CSV file input ref
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    applicationName: '',
    vendor: '',
    category: 'Productivity',
    billingCycle: 'Monthly',
    cost: '',
    currency: 'USD',
    totalLicences: '5',
    assignedLicences: '0',
    renewalDate: '2026-12-31',
    status: 'Active',
    owner: '',
    notes: '',
  });

  const categories = useMemo(() => {
    const list = Array.from(new Set(subscriptions.map((s) => s.category)));
    return ['All', ...list];
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        const matchesSearch =
          sub.applicationName.toLowerCase().includes(search.toLowerCase()) ||
          sub.vendor.toLowerCase().includes(search.toLowerCase()) ||
          sub.owner.toLowerCase().includes(search.toLowerCase());
        const matchesCat = categoryFilter === 'All' || sub.category === categoryFilter;
        const matchesCycle = cycleFilter === 'All' || sub.billingCycle === cycleFilter;
        return matchesSearch && matchesCat && matchesCycle;
      })
      .sort((a, b) => {
        if (sortBy === 'cost-desc') return getMonthlyCost(b) - getMonthlyCost(a);
        if (sortBy === 'cost-asc') return getMonthlyCost(a) - getMonthlyCost(b);
        if (sortBy === 'renewal-asc') return new Date(a.renewalDate) - new Date(b.renewalDate);
        if (sortBy === 'name') return a.applicationName.localeCompare(b.applicationName);
        return 0;
      });
  }, [subscriptions, search, categoryFilter, cycleFilter, sortBy]);

  const openAddModal = () => {
    setEditingSub(null);
    setFormData({
      applicationName: '',
      vendor: '',
      category: 'Productivity',
      billingCycle: 'Monthly',
      cost: '',
      currency: 'USD',
      totalLicences: '5',
      assignedLicences: '0',
      renewalDate: '2026-12-31',
      status: 'Active',
      owner: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sub) => {
    setEditingSub(sub);
    setFormData({
      applicationName: sub.applicationName,
      vendor: sub.vendor,
      category: sub.category,
      billingCycle: sub.billingCycle,
      cost: sub.cost.toString(),
      currency: sub.currency,
      totalLicences: sub.totalLicences.toString(),
      assignedLicences: sub.assignedLicences.toString(),
      renewalDate: sub.renewalDate,
      status: sub.status,
      owner: sub.owner,
      notes: sub.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.applicationName.trim()) return;

    if (editingSub) {
      updateSubscription(editingSub.id, {
        ...formData,
        cost: parseFloat(formData.cost) || 0,
        totalLicences: parseInt(formData.totalLicences, 10) || 1,
        assignedLicences: parseInt(formData.assignedLicences, 10) || 0,
      });
    } else {
      addSubscription({
        ...formData,
        cost: parseFloat(formData.cost) || 0,
        totalLicences: parseInt(formData.totalLicences, 10) || 1,
        assignedLicences: parseInt(formData.assignedLicences, 10) || 0,
      });
    }
    setIsModalOpen(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    const csv = exportSubscriptionsToCSV(subscriptions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `saasguard-subscriptions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsed = parseCSVToSubscriptions(text);
      if (parsed.length > 0) {
        importSubscriptions(parsed);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-plum-900 tracking-tight">Software Subscriptions</h2>
          <p className="text-xs text-mutedgray">
            Managing {subscriptions.length} enterprise applications and billing cycles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white border border-ivory-300 hover:border-plum-800 text-plum-900 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportCSV}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-white border border-ivory-300 hover:border-plum-800 text-plum-900 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-lime hover:bg-lime-dark text-plum-900 text-xs font-bold flex items-center gap-2 shadow-subtle transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Subscription</span>
          </button>
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
            placeholder="Search subscriptions by application, vendor or owner..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none focus:ring-2 focus:ring-plum-800/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-mutedgray">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg bg-ivory border border-ivory-300 text-plum-900 text-xs font-medium focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg bg-ivory border border-ivory-300 text-plum-900 text-xs font-medium focus:outline-none"
          >
            <option value="All">All Cycles</option>
            <option value="Monthly">Monthly</option>
            <option value="Annually">Annually</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-mutedgray">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg bg-ivory border border-ivory-300 text-plum-900 text-xs font-medium focus:outline-none"
            >
              <option value="cost-desc">Cost: High to Low</option>
              <option value="cost-asc">Cost: Low to High</option>
              <option value="renewal-asc">Renewal Date</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-3xl border border-ivory-300 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ivory/80 border-b border-ivory-200 text-[11px] font-bold text-mutedgray uppercase tracking-wider">
                <th className="py-4 px-6">Application & Vendor</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Cost / Cycle</th>
                <th className="py-4 px-4">Monthly Equiv</th>
                <th className="py-4 px-4">Licence Allocation</th>
                <th className="py-4 px-4">Renewal Date</th>
                <th className="py-4 px-4">Owner</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200 text-xs">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-mutedgray">
                    No subscriptions match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => {
                  const monthly = getMonthlyCost(sub);
                  const daysLeft = getDaysRemaining(sub.renewalDate);
                  const utilization = Math.round(
                    ((sub.assignedLicences || 0) / (sub.totalLicences || 1)) * 100
                  );

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-ivory/40 transition-colors group"
                    >
                      {/* App Name & Vendor */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-plum-900 text-lime font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0">
                            {sub.applicationName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-plum-900 truncate">
                              {sub.applicationName}
                            </p>
                            <p className="text-[11px] text-mutedgray truncate">{sub.vendor}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-ivory-200 text-plum-900 text-[11px] font-medium">
                          {sub.category}
                        </span>
                      </td>

                      {/* Cost & Cycle */}
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-extrabold text-plum-900">{formatCurrency(sub.cost)}</p>
                          <span className="text-[10px] text-mutedgray uppercase font-semibold">
                            {sub.billingCycle}
                          </span>
                        </div>
                      </td>

                      {/* Monthly Equivalent */}
                      <td className="py-4 px-4">
                        <p className="font-extrabold text-plum-900">{formatCurrency(monthly)}</p>
                        <span className="text-[10px] text-mutedgray">/ month</span>
                      </td>

                      {/* Seat Allocation Bar */}
                      <td className="py-4 px-4 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-plum-900">
                              {sub.assignedLicences} / {sub.totalLicences}
                            </span>
                            <span className="text-mutedgray">{utilization}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-ivory-300 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                utilization >= 100
                                  ? 'bg-rose-500'
                                  : utilization >= 70
                                  ? 'bg-plum-900'
                                  : 'bg-lime-dark'
                              }`}
                              style={{ width: `${Math.min(100, utilization)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Renewal Date */}
                      <td className="py-4 px-4">
                        <p className="font-semibold text-plum-900">{formatDate(sub.renewalDate)}</p>
                        <span
                          className={`text-[10px] font-bold ${
                            daysLeft <= 7
                              ? 'text-rose-600'
                              : daysLeft <= 30
                              ? 'text-amber-600'
                              : 'text-mutedgray'
                          }`}
                        >
                          {daysLeft < 0 ? 'Expired' : daysLeft === 0 ? 'Today' : `in ${daysLeft} days`}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="py-4 px-4">
                        <span className="font-medium text-plum-900">{sub.owner}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(sub)}
                            className="p-1.5 rounded-lg text-mutedgray hover:text-plum-900 hover:bg-ivory-200 transition-colors"
                            title="Edit Subscription"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(sub.id)}
                            className="p-1.5 rounded-lg text-mutedgray hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Subscription"
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

      {/* Add / Edit Subscription Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSub ? 'Edit Subscription' : 'Add New SaaS Subscription'}
        subtitle={
          editingSub
            ? `Updating contract details for ${editingSub.applicationName}`
            : 'Enter subscription contract parameters and license allocations'
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Application Name *</label>
              <input
                type="text"
                required
                value={formData.applicationName}
                onChange={(e) => setFormData({ ...formData, applicationName: e.target.value })}
                placeholder="e.g. GitHub Enterprise"
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none focus:ring-2 focus:ring-plum-800/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Vendor / Provider</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="e.g. Microsoft Inc."
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none focus:ring-2 focus:ring-plum-800/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              >
                <option value="Productivity">Productivity</option>
                <option value="Communication">Communication</option>
                <option value="Developer Tools">Developer Tools</option>
                <option value="Design">Design</option>
                <option value="Sales & CRM">Sales & CRM</option>
                <option value="Marketing & Creative">Marketing & Creative</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Security">Security</option>
                <option value="Finance & HR">Finance & HR</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Billing Cycle</label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              >
                <option value="Monthly">Monthly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Cost (USD) *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="e.g. 180"
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none focus:ring-2 focus:ring-plum-800/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Total Licences</label>
              <input
                type="number"
                min="1"
                required
                value={formData.totalLicences}
                onChange={(e) => setFormData({ ...formData, totalLicences: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Assigned Licences</label>
              <input
                type="number"
                min="0"
                value={formData.assignedLicences}
                onChange={(e) => setFormData({ ...formData, assignedLicences: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Renewal Date</label>
              <input
                type="date"
                required
                value={formData.renewalDate}
                onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Contract Owner</label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="e.g. Sarah Chen"
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
                <option value="In Review">In Review</option>
                <option value="Pending Cancellation">Pending Cancellation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-plum-900 mb-1">Notes & Scope</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enterprise terms, tier features, cancellation notice window..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
            />
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
              {editingSub ? 'Save Changes' : 'Create Subscription'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Deleting Subscription */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteSubscription(deleteId);
        }}
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription? All associated user access assignments and usage metrics will also be permanently revoked."
        confirmText="Delete Subscription"
      />
    </div>
  );
};
