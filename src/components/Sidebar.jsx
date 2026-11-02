import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  ShieldCheck,
  Activity,
  Sparkles,
  UserMinus,
  Bell,
  Settings,
  Shield,
  Layers,
  ChevronRight,
  LogOut,
  Building2,
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, path: '/subscriptions' },
  { id: 'employees', label: 'Employees', icon: Users, path: '/employees' },
  { id: 'access', label: 'Access Management', icon: ShieldCheck, path: '/access' },
  { id: 'usage', label: 'Usage Monitoring', icon: Activity, path: '/usage' },
  { id: 'optimization', label: 'Cost Optimisation', icon: Sparkles, path: '/optimization' },
  { id: 'offboarding', label: 'Offboarding', icon: UserMinus, path: '/offboarding' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export const Sidebar = ({ activePage, setActivePage, isMobileOpen, setIsMobileOpen }) => {
  const { metrics, company } = useData();

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-plum-950/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Persistent Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-plum-900 text-white flex flex-col border-r border-plum-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-plum-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime to-lime-dark flex items-center justify-center text-plum-900 shadow-glow-lime">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white font-sans">
                  SaaS<span className="text-lime">Guard</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold bg-plum-800 text-lime px-1.5 py-0.5 rounded border border-lime/20">
                  MVP
                </span>
              </div>
              <p className="text-[11px] text-lavender/60 truncate font-medium">Smarter SaaS Spending</p>
            </div>
          </div>
        </div>

        {/* Company Pill */}
        <div className="px-4 pt-4 pb-2">
          <div className="px-3 py-2 rounded-lg bg-plum-800/60 border border-plum-700/50 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-plum-700 flex items-center justify-center text-lavender">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{company.name}</p>
              <p className="text-[10px] text-lavender/60 truncate">{company.domain}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-plum-800 text-white shadow-sm border border-plum-700/80 font-semibold'
                    : 'text-lavender/70 hover:bg-plum-800/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-lime text-plum-900 shadow-sm'
                        : 'text-lavender/70 group-hover:text-lime'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>

                {/* Badge indicators */}
                <div className="flex items-center gap-1.5">
                  {item.id === 'notifications' && metrics.unreadNotificationsCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-lime text-plum-900 animate-pulse">
                      {metrics.unreadNotificationsCount}
                    </span>
                  )}
                  {item.id === 'offboarding' && metrics.pendingOffboardingCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {metrics.pendingOffboardingCount}
                    </span>
                  )}
                  {item.id === 'usage' && metrics.potentiallyUnusedLicences.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-lime" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile / Quick Info Card */}
        <div className="p-4 border-t border-plum-800 bg-plum-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-plum-800 border border-plum-700 flex items-center justify-center font-bold text-xs text-lime">
              SC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Sarah Chen</p>
              <p className="text-[11px] text-lavender/60 truncate">Primary Administrator</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-plum-800/60 flex items-center justify-between text-[11px] text-lavender/50">
            <span>SaaSGuard v1.2</span>
            <span className="inline-flex items-center gap-1 text-lime font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-lime animate-ping"></span>
              Live Synced
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
