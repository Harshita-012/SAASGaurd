import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  UserMinus,
  Sparkles,
  Info,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDate } from '../utils/helpers';

export const Notifications = ({ setActivePage }) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    metrics,
  } = useData();

  const [filterType, setFilterType] = useState('All');

  const filteredNotifs = useMemo(() => {
    return notifications.filter((n) => {
      if (filterType === 'All') return true;
      if (filterType === 'Unread') return !n.read;
      if (filterType === 'Renewals') return n.type.includes('renewal');
      if (filterType === 'Offboarding') return n.type === 'offboarding';
      if (filterType === 'Usage') return n.type === 'unused-licence';
      return true;
    });
  }, [notifications, filterType]);

  const typeIcons = {
    'renewal-urgent': Calendar,
    renewal: Calendar,
    offboarding: UserMinus,
    'unused-licence': AlertTriangle,
    recommendation: Sparkles,
    general: Bell,
  };

  const handleCardClick = (notif) => {
    markNotificationAsRead(notif.id);
    if (notif.actionUrl && setActivePage) {
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
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-plum-900 tracking-tight">System Notifications</h2>
          <p className="text-xs text-mutedgray">
            Audit alerts, upcoming contract renewals, and pending employee exit actions
          </p>
        </div>

        {metrics.unreadNotificationsCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="px-3.5 py-2 rounded-xl bg-white border border-ivory-300 hover:border-plum-800 text-plum-900 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-plum-800" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-white rounded-2xl border border-ivory-300 shadow-subtle">
        {['All', 'Unread', 'Renewals', 'Usage', 'Offboarding'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === tab
                ? 'bg-plum-900 text-lime shadow-xs'
                : 'text-mutedgray hover:text-plum-900 hover:bg-ivory'
            }`}
          >
            {tab}
            {tab === 'Unread' && metrics.unreadNotificationsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-lime text-plum-900 text-[10px] font-black">
                {metrics.unreadNotificationsCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-ivory-300 shadow-subtle text-mutedgray text-xs">
            No notifications found in this category.
          </div>
        ) : (
          filteredNotifs.map((notif) => {
            const Icon = typeIcons[notif.type] || Bell;

            return (
              <div
                key={notif.id}
                onClick={() => handleCardClick(notif)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  notif.read
                    ? 'bg-white/80 border-ivory-300 hover:border-plum-800/40 opacity-80'
                    : 'bg-white border-lavender shadow-subtle hover:shadow-elevated'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      notif.read
                        ? 'bg-ivory-200 text-mutedgray'
                        : 'bg-plum-900 text-lime shadow-glow-lime'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold truncate ${
                          notif.read ? 'text-plum-900/70' : 'text-plum-900 font-extrabold'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-lime shrink-0 animate-ping" />
                      )}
                    </div>
                    <p className="text-xs text-mutedgray leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-mutedgray/70 block pt-1">
                      {new Date(notif.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  {!notif.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationAsRead(notif.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-ivory-200 hover:bg-ivory-300 text-plum-900 text-[11px] font-bold"
                    >
                      Mark Read
                    </button>
                  )}
                  <ExternalLink className="w-4 h-4 text-mutedgray hover:text-plum-900" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
