import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  RotateCcw,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  User,
  CreditCard,
  ChevronDown,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/helpers';

export const TopNav = ({
  activePage,
  setActivePage,
  setIsMobileOpen,
  onOpenAddSubscription,
}) => {
  const {
    company,
    subscriptions,
    employees,
    notifications,
    markNotificationAsRead,
    metrics,
    resetDemoData,
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search results
  const filteredApps = searchQuery.trim()
    ? subscriptions.filter(
        (s) =>
          s.applicationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredEmployees = searchQuery.trim()
    ? employees.filter(
        (e) =>
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const pageTitles = {
    dashboard: { title: 'Executive Overview', desc: 'Real-time SaaS spend and access intelligence' },
    subscriptions: { title: 'SaaS Subscriptions', desc: 'Manage contracts, license tiers, and renewal schedules' },
    employees: { title: 'Employee Directory', desc: 'Directory of team members and application licenses' },
    access: { title: 'Access Management', desc: 'Interactive matrix of employee-to-application entitlements' },
    usage: { title: 'Usage Monitoring', desc: 'Detect inactive logins and flag potentially unused seats' },
    optimization: { title: 'Cost Optimisation', desc: 'Actionable savings suggestions based on usage analytics' },
    offboarding: { title: 'Offboarding Management', desc: 'Structured revocation checklists for departing personnel' },
    notifications: { title: 'System Notifications', desc: 'Upcoming renewal reminders and alert log' },
    settings: { title: 'Settings & Workspace', desc: 'Company parameters, audit preferences, and demo reset' },
  };

  const currentMeta = pageTitles[activePage] || { title: 'SaaSGuard', desc: 'Platform Management' };

  return (
    <header className="sticky top-0 z-30 bg-ivory/80 backdrop-blur-md border-b border-ivory-300/80 px-4 sm:px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Page header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="p-2 rounded-xl text-plum-900 hover:bg-plum-800/10 lg:hidden"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-plum-900 tracking-tight">
              {currentMeta.title}
            </h1>
            <p className="hidden sm:block text-xs text-mutedgray">{currentMeta.desc}</p>
          </div>
        </div>

        {/* Right: Global search, actions, notifications & profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global search */}
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                placeholder="Search apps, employees..."
                className="w-36 sm:w-64 pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-plum-800/20 focus:border-plum-800 transition-all text-plum-900 placeholder:text-mutedgray shadow-sm"
              />
              <Search className="w-4 h-4 text-mutedgray absolute left-3 top-2 pointer-events-none" />
            </div>

            {/* Quick search dropdown */}
            {isSearchOpen && searchQuery.trim() && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-elevated border border-ivory-300 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="max-h-80 overflow-y-auto space-y-3">
                  {filteredApps.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-mutedgray uppercase tracking-wider px-2 mb-1">
                        Applications ({filteredApps.length})
                      </p>
                      <div className="space-y-1">
                        {filteredApps.slice(0, 4).map((app) => (
                          <div
                            key={app.id}
                            onClick={() => {
                              setActivePage('subscriptions');
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="p-2 rounded-lg hover:bg-ivory flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-plum-800 text-lime flex items-center justify-center font-bold text-xs">
                                {app.applicationName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-plum-900 group-hover:text-plum-800">
                                  {app.applicationName}
                                </p>
                                <p className="text-[10px] text-mutedgray">{app.category}</p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-plum-900">
                              {formatCurrency(app.cost)}
                              <span className="text-[10px] font-normal text-mutedgray">
                                /{app.billingCycle === 'Annually' ? 'yr' : 'mo'}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredEmployees.length > 0 && (
                    <div className="pt-2 border-t border-ivory-200">
                      <p className="text-[11px] font-bold text-mutedgray uppercase tracking-wider px-2 mb-1">
                        Employees ({filteredEmployees.length})
                      </p>
                      <div className="space-y-1">
                        {filteredEmployees.slice(0, 4).map((emp) => (
                          <div
                            key={emp.id}
                            onClick={() => {
                              setActivePage('employees');
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="p-2 rounded-lg hover:bg-ivory flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-lavender text-plum-900 flex items-center justify-center font-bold text-xs">
                                {emp.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-plum-900 group-hover:text-plum-800">
                                  {emp.name}
                                </p>
                                <p className="text-[10px] text-mutedgray">{emp.department} • {emp.designation}</p>
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-ivory-200 text-plum-900 font-medium">
                              {emp.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredApps.length === 0 && filteredEmployees.length === 0 && (
                    <div className="py-6 text-center text-xs text-mutedgray">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Add Subscription Button */}
          {onOpenAddSubscription && (
            <button
              onClick={onOpenAddSubscription}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime hover:bg-lime-dark text-plum-900 text-xs font-bold transition-all shadow-subtle active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Add Subscription</span>
            </button>
          )}

          {/* Notification Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className="relative p-2 rounded-xl bg-white border border-ivory-300 hover:border-plum-800/40 text-plum-900 transition-all shadow-sm"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4" />
              {metrics.unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-plum-900 text-lime text-[9px] font-bold flex items-center justify-center border-2 border-ivory">
                  {metrics.unreadNotificationsCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-elevated border border-ivory-300 p-3 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-ivory-200 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-plum-900">Notifications</span>
                    {metrics.unreadNotificationsCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-plum-900 text-lime">
                        {metrics.unreadNotificationsCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setActivePage('notifications');
                      setIsNotifOpen(false);
                    }}
                    className="text-[11px] font-semibold text-plum-800 hover:underline"
                  >
                    View all
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1.5">
                  {notifications.slice(0, 4).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.actionUrl) {
                          const pageMap = {
                            '/subscriptions': 'subscriptions',
                            '/employees': 'employees',
                            '/access': 'access',
                            '/usage': 'usage',
                            '/optimization': 'optimization',
                            '/offboarding': 'offboarding',
                            '/notifications': 'notifications',
                            '/settings': 'settings',
                          };
                          if (pageMap[notif.actionUrl]) {
                            setActivePage(pageMap[notif.actionUrl]);
                          }
                        }
                        setIsNotifOpen(false);
                      }}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                        notif.read
                          ? 'bg-ivory/50 hover:bg-ivory text-mutedgray'
                          : 'bg-lavender/30 hover:bg-lavender/50 text-plum-900 border border-lavender'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          notif.read ? 'bg-mutedgray/40' : 'bg-lime shadow-glow-lime'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${notif.read ? 'text-plum-900/80' : 'text-plum-900'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-mutedgray line-clamp-2 mt-0.5">{notif.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl bg-white border border-ivory-300 hover:border-plum-800/40 transition-all shadow-sm"
            >
              <div className="w-6 h-6 rounded-lg bg-plum-900 text-lime flex items-center justify-center text-xs font-bold">
                SC
              </div>
              <span className="hidden md:inline text-xs font-bold text-plum-900 truncate max-w-[100px]">
                {company.primaryAdmin || 'Admin'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-mutedgray" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-ivory-300 p-2 z-50">
                <div className="px-3 py-2 border-b border-ivory-200 mb-1">
                  <p className="text-xs font-bold text-plum-900">{company.primaryAdmin}</p>
                  <p className="text-[10px] text-mutedgray truncate">{company.domain}</p>
                </div>
                <button
                  onClick={() => {
                    setActivePage('settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-plum-900 hover:bg-ivory flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-mutedgray" />
                  Workspace Settings
                </button>
                <button
                  onClick={() => {
                    resetDemoData();
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 mt-1"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                  Reset Demo Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
