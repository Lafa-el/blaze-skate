import { formatDateLabel } from '../trainingV1/utils/formatUtils.js';

export default function PlanCard({
  plan,
  t,
  tc,
  isActive = false,
  isArchived = false,
  isSelected = false,
  isRecentlyRestored = false,
  onSelect,
  onSetActive,
  onRestore,
}) {
  const metaClassName = isArchived ? 'text-[10px] font-bold text-gray-500 mt-1 flex flex-wrap gap-2' : `text-[10px] font-bold ${tc.textMuted} mt-1 flex flex-wrap gap-2`;

  const meta = (
    <div className={metaClassName}>
      <span>{plan.status}</span>
      <span>{formatDateLabel(plan.startDate)}</span>
      {plan.focus && <span className="truncate">{plan.focus}</span>}
    </div>
  );

  if (isArchived) {
    return (
      <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-3 opacity-75">
        <div className="min-w-0">
          <div className="text-sm font-black text-gray-700 truncate">{plan.title}</div>
          {meta}
        </div>
        {onRestore ? (
          <button
            onClick={onRestore}
            className={`${tc.btnCancel} px-3 py-2 rounded-lg text-[11px] font-black active:scale-95 transition-all shrink-0`}
          >
            {t.restorePlan}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`${tc.badgeBg} rounded-xl p-3 flex items-center justify-between gap-3`}>
      <div className="min-w-0">
        <div className={`text-sm font-black ${tc.textHeading} truncate`}>{plan.title}</div>
        {meta}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isRecentlyRestored && (
          <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-green-50 text-green-600 border border-green-100">
            {t.restored}
          </span>
        )}
        {isActive && !isRecentlyRestored && (
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${tc.badgeBg} ${tc.textPrimary}`}>
            {t.activePlan}
          </span>
        )}
        {!isSelected && onSelect ? (
          <button
            onClick={onSelect}
            className={`${tc.btnCancel} px-3 py-2 rounded-lg text-[11px] font-black active:scale-95 transition-all`}
          >
            {t.viewPlan}
          </button>
        ) : null}
        {!isSelected && !isActive && onSetActive ? (
          <button
            onClick={onSetActive}
            className={`${tc.badgeBg} ${tc.textPrimary} px-3 py-2 rounded-lg text-[11px] font-black active:scale-95 transition-all`}
          >
            {t.activePlan}
          </button>
        ) : null}
      </div>
    </div>
  );
}
