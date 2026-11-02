import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  TrendingDown,
  CheckCircle,
  XCircle,
  Check,
  AlertTriangle,
  ArrowRight,
  Filter,
  DollarSign,
  ShieldAlert,
  Info,
  Clock,
  Layers,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/helpers';

export const CostOptimisation = () => {
  const { recommendations, updateRecommendationStatus, subscriptions, metrics } = useData();

  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((rec) => {
      const matchesStatus = statusFilter === 'All' || rec.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || rec.priority === priorityFilter;
      return matchesStatus && matchesPriority;
    });
  }, [recommendations, statusFilter, priorityFilter]);

  // Aggregate stats
  const activeRecs = recommendations.filter((r) => r.status === 'Active');
  const acceptedRecs = recommendations.filter((r) => r.status === 'Accepted');
  const completedRecs = recommendations.filter((r) => r.status === 'Completed');

  const totalEstimatedMonthly = activeRecs.concat(acceptedRecs).reduce(
    (acc, r) => acc + (parseFloat(r.estimatedSavings) || 0),
    0
  );

  const priorityColors = {
    High: 'bg-rose-100 text-rose-800 border-rose-200',
    Medium: 'bg-amber-100 text-amber-800 border-amber-200',
    Low: 'bg-ivory-200 text-plum-900 border-ivory-300',
  };

  const statusBadges = {
    Active: 'bg-plum-900 text-lime font-bold',
    Accepted: 'bg-amber-100 text-amber-900 font-bold',
    Rejected: 'bg-ivory-300 text-mutedgray font-semibold line-through',
    Completed: 'bg-emerald-100 text-emerald-900 font-bold',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-plum-900 via-plum-800 to-plum-900 text-white border border-plum-700 shadow-elevated relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-plum-700/60 text-lime text-xs font-semibold border border-lime/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligent Spend Optimization Engine</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white font-sans">
              Dynamic Cost-Saving Opportunities
            </h2>
            <p className="text-xs text-lavender/80 leading-relaxed">
              Rules analyze seat allocations, overlapping functional categories, and upcoming contract renewal windows.
            </p>
          </div>

          <div className="bg-plum-950/60 border border-plum-700/60 p-4 rounded-2xl text-right shrink-0">
            <span className="text-[11px] text-lavender/70 uppercase tracking-wider block font-semibold">
              Potential Monthly Savings
            </span>
            <p className="text-3xl font-black text-lime mt-0.5">
              {formatCurrency(totalEstimatedMonthly)}
              <span className="text-xs text-lavender/70 font-normal"> / month</span>
            </p>
            <span className="text-[10px] text-lavender/50 block mt-1">
              {formatCurrency(totalEstimatedMonthly * 12)} estimated annual run-rate impact
            </span>
          </div>
        </div>
      </div>

      {/* Compliance Notice: Estimated vs Actual Savings */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong>Pricing Disclosure:</strong> Figures shown represent <span className="font-bold underline">estimated potential savings</span> based on standard list contract pricing and unassigned seat deductions. Final realized billing adjustments depend on your enterprise vendor agreement, minimum contract commitments, and early termination clauses.
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-ivory-300 shadow-subtle">
          <span className="text-xs font-semibold text-mutedgray">Active Suggestions</span>
          <p className="text-2xl font-black text-plum-900 mt-1">{activeRecs.length}</p>
          <p className="text-[11px] text-mutedgray mt-1">Awaiting admin review</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-ivory-300 shadow-subtle">
          <span className="text-xs font-semibold text-mutedgray">Accepted & Queued</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{acceptedRecs.length}</p>
          <p className="text-[11px] text-mutedgray mt-1">Scheduled for renegotiation</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-ivory-300 shadow-subtle">
          <span className="text-xs font-semibold text-mutedgray">Completed Actions</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{completedRecs.length}</p>
          <p className="text-[11px] text-mutedgray mt-1">Successfully right-sized</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-ivory-300 shadow-subtle">
          <span className="text-xs font-semibold text-mutedgray">Est. Monthly Savings</span>
          <p className="text-2xl font-black text-lime-dark mt-1">
            {formatCurrency(totalEstimatedMonthly)}
          </p>
          <p className="text-[11px] text-mutedgray mt-1">From active & accepted</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-ivory-300 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-mutedgray" />
          <span className="text-xs font-bold text-plum-900">Filter Recommendations:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-mutedgray">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1 px-2.5 rounded-lg bg-ivory border border-ivory-300 text-plum-900 font-semibold focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Accepted">Accepted</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-mutedgray">
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="py-1 px-2.5 rounded-lg bg-ivory border border-ivory-300 text-plum-900 font-semibold focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-ivory-300 shadow-subtle text-mutedgray text-xs">
            No cost recommendations match the selected filters.
          </div>
        ) : (
          filteredRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-subtle hover:border-plum-800/40 transition-all space-y-4"
            >
              {/* Card Top */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-plum-900 text-lime font-black flex items-center justify-center text-sm shrink-0">
                    {rec.application.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base text-plum-900">{rec.application}</h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          priorityColors[rec.priority] || priorityColors.Medium
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full ${
                          statusBadges[rec.status] || statusBadges.Active
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                    <p className="text-xs text-plum-800 mt-1 leading-relaxed">{rec.reason}</p>
                  </div>
                </div>

                <div className="bg-ivory rounded-2xl p-3 border border-ivory-300 text-right shrink-0 min-w-[140px]">
                  <span className="text-[10px] text-mutedgray uppercase tracking-wider block font-semibold">
                    Est. Monthly Savings
                  </span>
                  <p className="text-lg font-black text-plum-900">
                    {formatCurrency(rec.estimatedSavings)}
                    <span className="text-xs font-normal text-mutedgray">/mo</span>
                  </p>
                  <span className="text-[10px] text-mutedgray">
                    Current Spend: {formatCurrency(rec.currentCost)}/mo
                  </span>
                </div>
              </div>

              {/* Action Box */}
              <div className="p-3.5 rounded-2xl bg-lavender/30 border border-lavender flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-plum-900">
                  <span className="font-bold text-plum-950">Recommended Action:</span>
                  <span>{rec.suggestedAction}</span>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {rec.status === 'Active' && (
                    <>
                      <button
                        onClick={() => updateRecommendationStatus(rec.id, 'Rejected')}
                        className="px-3 py-1.5 rounded-xl bg-ivory-200 hover:bg-ivory-300 text-plum-900 text-xs font-semibold transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5 text-mutedgray" />
                        <span>Dismiss</span>
                      </button>
                      <button
                        onClick={() => updateRecommendationStatus(rec.id, 'Accepted')}
                        className="px-3.5 py-1.5 rounded-xl bg-lime hover:bg-lime-dark text-plum-900 text-xs font-bold transition-all shadow-subtle flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Accept & Queue</span>
                      </button>
                    </>
                  )}

                  {rec.status === 'Accepted' && (
                    <button
                      onClick={() => updateRecommendationStatus(rec.id, 'Completed')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-subtle flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Completed</span>
                    </button>
                  )}

                  {rec.status === 'Completed' && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Savings Realized</span>
                    </span>
                  )}

                  {rec.status === 'Rejected' && (
                    <button
                      onClick={() => updateRecommendationStatus(rec.id, 'Active')}
                      className="px-3 py-1.5 rounded-xl bg-ivory-200 hover:bg-ivory-300 text-plum-900 text-xs font-semibold transition-all"
                    >
                      Re-evaluate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
