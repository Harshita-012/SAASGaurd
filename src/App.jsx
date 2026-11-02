import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { Dashboard } from './pages/Dashboard';
import { Subscriptions } from './pages/Subscriptions';
import { Employees } from './pages/Employees';
import { AccessManagement } from './pages/AccessManagement';
import { UsageMonitoring } from './pages/UsageMonitoring';
import { CostOptimisation } from './pages/CostOptimisation';
import { Offboarding } from './pages/Offboarding';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { Modal } from './components/Modal';

const MainLayout = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);

  const { addSubscription } = useData();

  // Quick Add Subscription form state
  const [quickForm, setQuickForm] = useState({
    applicationName: '',
    vendor: '',
    category: 'Productivity',
    billingCycle: 'Monthly',
    cost: '',
    totalLicences: '5',
    assignedLicences: '1',
    renewalDate: '2026-12-31',
    owner: 'Sarah Chen',
  });

  const handleQuickAddSubmit = (e) => {
    e.preventDefault();
    if (!quickForm.applicationName.trim()) return;

    addSubscription({
      ...quickForm,
      cost: parseFloat(quickForm.cost) || 0,
      totalLicences: parseInt(quickForm.totalLicences, 10) || 1,
      assignedLicences: parseInt(quickForm.assignedLicences, 10) || 0,
      currency: 'USD',
      status: 'Active',
      notes: 'Added via quick creation modal',
    });

    setIsQuickAddModalOpen(false);
    setActivePage('subscriptions');
    setQuickForm({
      applicationName: '',
      vendor: '',
      category: 'Productivity',
      billingCycle: 'Monthly',
      cost: '',
      totalLicences: '5',
      assignedLicences: '1',
      renewalDate: '2026-12-31',
      owner: 'Sarah Chen',
    });
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            setActivePage={setActivePage}
            onOpenAddSubscription={() => setIsQuickAddModalOpen(true)}
          />
        );
      case 'subscriptions':
        return <Subscriptions />;
      case 'employees':
        return <Employees setActivePage={setActivePage} />;
      case 'access':
        return <AccessManagement />;
      case 'usage':
        return <UsageMonitoring />;
      case 'optimization':
        return <CostOptimisation />;
      case 'offboarding':
        return <Offboarding />;
      case 'notifications':
        return <Notifications setActivePage={setActivePage} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex text-plum-900 font-sans selection:bg-lime selection:text-plum-900">
      {/* Persistent Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <TopNav
          activePage={activePage}
          setActivePage={setActivePage}
          setIsMobileOpen={setIsMobileOpen}
          onOpenAddSubscription={() => setIsQuickAddModalOpen(true)}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {renderActivePage()}
        </main>
      </div>

      {/* Quick Add Subscription Modal */}
      <Modal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        title="Quick Add Subscription"
        subtitle="Quickly register a software contract into the active inventory"
      >
        <form onSubmit={handleQuickAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Application Name *</label>
              <input
                type="text"
                required
                value={quickForm.applicationName}
                onChange={(e) => setQuickForm({ ...quickForm, applicationName: e.target.value })}
                placeholder="e.g. Asana Enterprise"
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none focus:ring-2 focus:ring-plum-800/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Vendor</label>
              <input
                type="text"
                value={quickForm.vendor}
                onChange={(e) => setQuickForm({ ...quickForm, vendor: e.target.value })}
                placeholder="e.g. Asana Inc."
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Category</label>
              <select
                value={quickForm.category}
                onChange={(e) => setQuickForm({ ...quickForm, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              >
                <option value="Productivity">Productivity</option>
                <option value="Communication">Communication</option>
                <option value="Developer Tools">Developer Tools</option>
                <option value="Design">Design</option>
                <option value="Sales & CRM">Sales & CRM</option>
                <option value="Marketing & Creative">Marketing & Creative</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Billing Cycle</label>
              <select
                value={quickForm.billingCycle}
                onChange={(e) => setQuickForm({ ...quickForm, billingCycle: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              >
                <option value="Monthly">Monthly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Cost (USD) *</label>
              <input
                type="number"
                step="any"
                required
                value={quickForm.cost}
                onChange={(e) => setQuickForm({ ...quickForm, cost: e.target.value })}
                placeholder="e.g. 120"
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Total Seats</label>
              <input
                type="number"
                min="1"
                required
                value={quickForm.totalLicences}
                onChange={(e) => setQuickForm({ ...quickForm, totalLicences: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-plum-900 mb-1">Renewal Date</label>
              <input
                type="date"
                required
                value={quickForm.renewalDate}
                onChange={(e) => setQuickForm({ ...quickForm, renewalDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-ivory border border-ivory-300 text-plum-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-ivory-200">
            <button
              type="button"
              onClick={() => setIsQuickAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-plum-900 bg-ivory-200 hover:bg-ivory-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-lime hover:bg-lime-dark text-plum-900 shadow-subtle transition-all"
            >
              Add Subscription
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <MainLayout />
    </DataProvider>
  );
}
