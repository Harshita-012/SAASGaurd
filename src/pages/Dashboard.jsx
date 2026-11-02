import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Users,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  UserMinus,
  CheckCircle2,
  Clock,
  Layers,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/StatCard';
import { formatCurrency, getMonthlyCost, formatDate } from '../utils/helpers';

export const Dashboard = ({ setActivePage, onOpenAddSubscription }) => {
  const { metrics, subscriptions, employees, recommendations, offboarding } = useData();
  const [timeRange, setTimeRange] = useState('monthly'); // 'monthly' | 'quarterly' | 'annual'

  // Application spending breakdown for Bar Chart (Top 6 apps by monthly cost)
  const appSpendingData = useMemo(() => {
    return [...subscriptions]
      .map((sub) => ({
        name: sub.applicationName.split(' ')[0], // short name
        fullName: sub.applicationName,
        monthlyCost: Math.round(getMonthlyCost(sub)),
        category: sub.category,
      }))
      .sort((a, b) => b.monthlyCost - a.monthlyCost)
      .slice(0, 6);
  }, [subscriptions]);

  // Spending trend simulation data
  const spendingTrendData = useMemo(() => {
    const base = metrics.monthlySaaSSpending;
    return [
      { month: 'Jun', spend: Math.round(base * 0.82) },
      { month: 'Jul', spend: Math.round(base * 0.88) },
      { month: 'Aug', spend: Math.round(base * 0.91) },
      { month: 'Sep', spend: Math.round(base * 0.95) },
      { month: 'Oct', spend: Math.round(base * 0.98) },
      { month: 'Nov', spend: Math.round(base) },
    ];
  }, [metrics.monthlySaaSSpending]);

  // Licence Utilisation Pie Data
  const licencePieData = useMemo(() => {
    return [
      { name: 'Assigned Licences', value: metrics.totalAssignedLicences, color: '#21152F' },
      { name: 'Unassigned Seats', value: metrics.unusedLicences, color: '#C8F169' },
      { name: 'Inactive Users', value: metrics.potentiallyUnusedLicences.length, color: '#E8DFF4' },
    ];
  }, [metrics]);

  // Category breakdown for Category Spend
  const categoryData = useMemo(() => {
    const map = {};
    subscriptions.forEach((sub) => {
      const cost = getMonthlyCost(sub);
      map[sub.category] = (map[sub.category] || 0) + cost;
    });
    return Object.entries(map).map(([name, val]) => ({
      name,
      value: Math.round(val),
    })).sort((a, b) => b.value - a.value);
  }, [subscriptions]);

  const COLORS = ['#21152F', '#342344', '#644882', '#C8F169', '#E8DFF4', '#8B8792'];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Value Prop Greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-plum-900 via-plum-800 to-plum-900 text-white p-6 sm:p-8 border border-plum-700 shadow-elevated">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-lime/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum-700/60 border border-lime/30 text-lime text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time SaaS Portfolio Analytics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Spend Optimization & Access Command
            </h2>
            <p className="text-sm text-lavender/80 leading-relaxed">
              Monitoring <strong className="text-white">{metrics.totalApplications} software subscriptions</strong> and{' '}
              <strong className="text-white">{metrics.totalAssignedLicences} active seats</strong> across {metrics.totalEmployees} employees.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActivePage('optimization')}
              className="px-4 py-2.5 rounded-xl bg-lime hover:bg-lime-dark text-plum-900 font-bold text-xs transition-all shadow-glow-lime flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Review {metrics.totalEstimatedMonthlySavings > 0 ? `${formatCurrency(metrics.totalEstimatedMonthlySavings)}/mo Savings` : 'Recommendations'}</span>
            </button>
            <button
              onClick={() => setActivePage('offboarding')}
              className="px-4 py-2.5 rounded-xl bg-plum-800/80 hover:bg-plum-700 text-lavender font-semibold text-xs border border-plum-600 transition-all flex items-center gap-2"
            >
              <UserMinus className="w-4 h-4 text-lime" />
              <span>{metrics.pendingOffboardingCount} Exit Checklists</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Applications"
          value={metrics.totalApplications}
          subtitle="Active vendors"
          icon={Layers}
          accentColor="plum"
          onClick={() => setActivePage('subscriptions')}
        />
        <StatCard
          title="Monthly Spend"
          value={formatCurrency(metrics.monthlySaaSSpending)}
          subtitle={`${formatCurrency(metrics.annualSaaSSpending)} / year`}
          icon={CreditCard}
          trend="+3.2%"
          trendPositive={false}
          accentColor="lime"
          onClick={() => setActivePage('subscriptions')}
        />
        <StatCard
          title="Active Employees"
          value={metrics.activeEmployees}
          subtitle={`${metrics.totalEmployees} total personnel`}
          icon={Users}
          accentColor="lavender"
          onClick={() => setActivePage('employees')}
        />
        <StatCard
          title="Total Licences"
          value={metrics.totalLicences}
          subtitle={`${metrics.totalAssignedLicences} assigned`}
          icon={ShieldCheck}
          accentColor="plum"
          onClick={() => setActivePage('access')}
        />
        <StatCard
          title="Potentially Unused"
          value={metrics.potentiallyUnusedLicences.length}
          subtitle="Past inactivity limit"
          icon={AlertTriangle}
          trend={metrics.potentiallyUnusedLicences.length > 0 ? 'Action Req' : 'Optimal'}
          trendPositive={metrics.potentiallyUnusedLicences.length === 0}
          accentColor="rose"
          onClick={() => setActivePage('usage')}
        />
        <StatCard
          title="Upcoming Renewals"
          value={metrics.upcomingRenewals.length}
          subtitle="Next 30 days"
          icon={Calendar}
          accentColor="amber"
          onClick={() => setActivePage('subscriptions')}
        />
      </div>

      {/* Primary Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trend Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-ivory-300 shadow-subtle flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-plum-900 tracking-tight">
                Monthly SaaS Spending Trends
              </h3>
              <p className="text-xs text-mutedgray">Calculated dynamic run-rate over the last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-ivory rounded-xl border border-ivory-300 text-xs font-semibold">
              <button
                onClick={() => setTimeRange('monthly')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  timeRange === 'monthly' ? 'bg-plum-900 text-white shadow-xs' : 'text-mutedgray hover:text-plum-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeRange('annual')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  timeRange === 'annual' ? 'bg-plum-900 text-white shadow-xs' : 'text-mutedgray hover:text-plum-900'
                }`}
              >
                Annualized
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#21152F" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#21152F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDE9DE" />
                <XAxis dataKey="month" stroke="#8B8792" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#8B8792"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${timeRange === 'annual' ? Math.round(v * 12 / 1000) + 'k' : v}`}
                />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(timeRange === 'annual' ? value * 12 : value),
                    timeRange === 'annual' ? 'Annual Run-rate' : 'Monthly Spend',
                  ]}
                  contentStyle={{
                    backgroundColor: '#21152F',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#21152F"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#spendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Licence Utilisation Donut */}
        <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-plum-900 tracking-tight">Licence Allocation</h3>
            <p className="text-xs text-mutedgray">Total purchased seats vs utilization</p>
          </div>

          <div className="h-52 w-full my-2 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={licencePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {licencePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} seats`, name]}
                  contentStyle={{
                    backgroundColor: '#21152F',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-plum-900">{metrics.totalLicences}</span>
              <span className="text-[10px] text-mutedgray font-medium uppercase tracking-wider">Seats Total</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-ivory-200">
            {licencePieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-plum-900 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-plum-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 6 Applications by Spend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-ivory-300 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-plum-900 tracking-tight">Top SaaS Subscriptions by Cost</h3>
              <p className="text-xs text-mutedgray">Monthly equivalent cost per application</p>
            </div>
            <button
              onClick={() => setActivePage('subscriptions')}
              className="text-xs font-bold text-plum-800 hover:text-plum-900 flex items-center gap-1 hover:underline"
            >
              <span>View all ({metrics.totalApplications})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appSpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDE9DE" />
                <XAxis dataKey="name" stroke="#8B8792" fontSize={11} tickLine={false} />
                <YAxis stroke="#8B8792" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(val, name, props) => [formatCurrency(val) + '/mo', props.payload.fullName]}
                  contentStyle={{
                    backgroundColor: '#21152F',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="monthlyCost" fill="#342344" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend by Category */}
        <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-plum-900 tracking-tight">Department / Category Spend</h3>
            <p className="text-xs text-mutedgray">Cost distribution across business functions</p>
          </div>

          <div className="space-y-3 my-4">
            {categoryData.slice(0, 5).map((cat, idx) => {
              const pct = Math.round((cat.value / (metrics.monthlySaaSSpending || 1)) * 100);
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-plum-900">{cat.name}</span>
                    <span className="font-bold text-plum-900">
                      {formatCurrency(cat.value)} <span className="text-[10px] text-mutedgray font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-ivory-200 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: COLORS[idx % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-ivory-200 flex items-center justify-between text-xs text-mutedgray">
            <span>Annual Run-rate</span>
            <span className="font-bold text-plum-900">{formatCurrency(metrics.annualSaaSSpending)}</span>
          </div>
        </div>
      </div>

      {/* Critical Operational Feeds: Renewals + Unused Licences + Exit Checklists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Renewals */}
        <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-plum-900" />
                <h3 className="text-sm font-bold text-plum-900">Upcoming Renewals</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                {metrics.upcomingRenewals.length} soon
              </span>
            </div>

            <div className="space-y-2.5">
              {metrics.upcomingRenewals.length === 0 ? (
                <div className="py-8 text-center text-xs text-mutedgray">No renewals in next 30 days.</div>
              ) : (
                metrics.upcomingRenewals.slice(0, 3).map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => setActivePage('subscriptions')}
                    className="p-3 rounded-2xl bg-ivory hover:bg-ivory-200/80 transition-all cursor-pointer border border-ivory-300 flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-plum-900 group-hover:text-plum-800">
                        {sub.applicationName}
                      </p>
                      <p className="text-[11px] text-mutedgray">
                        Renews {formatDate(sub.renewalDate)} ({sub.billingCycle})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-plum-900">{formatCurrency(sub.cost)}</p>
                      <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                        {sub.daysRemaining === 0 ? 'Today' : `in ${sub.daysRemaining}d`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setActivePage('subscriptions')}
            className="w-full mt-4 pt-3 border-t border-ivory-200 text-xs font-bold text-plum-900 hover:text-plum-800 flex items-center justify-center gap-1.5"
          >
            <span>Manage Contract Dates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Potentially Unused Licences Alerts */}
        <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-plum-900">Inactive Seat Alerts</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[11px] font-bold">
                {metrics.potentiallyUnusedLicences.length} flagged
              </span>
            </div>

            <div className="space-y-2.5">
              {metrics.potentiallyUnusedLicences.length === 0 ? (
                <div className="py-8 text-center text-xs text-mutedgray">
                  All assigned seats meet activity criteria.
                </div>
              ) : (
                metrics.potentiallyUnusedLicences.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActivePage('usage')}
                    className="p-3 rounded-2xl bg-rose-50/50 hover:bg-rose-50 border border-rose-200/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-plum-900">{item.employee?.name}</p>
                      <p className="text-[11px] text-mutedgray">{item.subscription?.applicationName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                        {item.daysInactive}d inactive
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setActivePage('usage')}
            className="w-full mt-4 pt-3 border-t border-ivory-200 text-xs font-bold text-plum-900 hover:text-plum-800 flex items-center justify-center gap-1.5"
          >
            <span>View Inactivity Monitor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pending Offboarding Tasks */}
        <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserMinus className="w-4 h-4 text-plum-900" />
                <h3 className="text-sm font-bold text-plum-900">Offboarding Progress</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-plum-800 text-lime text-[11px] font-bold">
                {metrics.pendingOffboardingCount} in progress
              </span>
            </div>

            <div className="space-y-2.5">
              {offboarding.filter((o) => o.status === 'In Progress').length === 0 ? (
                <div className="py-8 text-center text-xs text-mutedgray">No active exit workflows pending.</div>
              ) : (
                offboarding
                  .filter((o) => o.status === 'In Progress')
                  .slice(0, 2)
                  .map((caseItem) => {
                    const completedTasks = caseItem.tasks.filter((t) => t.status === 'Completed').length;
                    const totalTasks = caseItem.tasks.length;
                    const percent = Math.round((completedTasks / (totalTasks || 1)) * 100);

                    return (
                      <div
                        key={caseItem.id}
                        onClick={() => setActivePage('offboarding')}
                        className="p-3 rounded-2xl bg-ivory border border-ivory-300 hover:bg-ivory-200/80 transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-plum-900">{caseItem.employeeName}</p>
                          <span className="text-[10px] font-semibold text-mutedgray">
                            {completedTasks}/{totalTasks} Revocations
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-ivory-300 overflow-hidden">
                          <div
                            className="h-full bg-lime rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          <button
            onClick={() => setActivePage('offboarding')}
            className="w-full mt-4 pt-3 border-t border-ivory-200 text-xs font-bold text-plum-900 hover:text-plum-800 flex items-center justify-center gap-1.5"
          >
            <span>Execute Revocation Checklists</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
