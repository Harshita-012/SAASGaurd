import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  accentColor = 'lime',
  onClick,
}) => {
  const accentClasses = {
    lime: 'bg-lime/20 text-plum-900 border-lime/30',
    lavender: 'bg-lavender text-plum-900 border-lavender-muted',
    plum: 'bg-plum-800 text-lime border-plum-700',
    rose: 'bg-rose-100 text-rose-700 border-rose-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-ivory-300 shadow-subtle transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-plum-800/40 hover:-translate-y-0.5 hover:shadow-elevated' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-mutedgray tracking-wide">{title}</span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              accentClasses[accentColor] || accentClasses.lime
            }`}
          >
            <Icon className="w-4 h-4 stroke-[2.2]" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-plum-900 tracking-tight font-sans">
          {value}
        </span>
        {trend && (
          <span
            className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
              trendPositive
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-mutedgray mt-1.5 leading-snug">{subtitle}</p>}
    </div>
  );
};
