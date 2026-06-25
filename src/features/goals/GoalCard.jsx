import { Archive, Edit2, Info } from 'lucide-react';

import {
  getGoalCurrentPerformance,
  getGoalGapWithPB,
  getGoalProgressWithPB,
} from '../trainingV1/goals.js';
import {
  formatDateLabel,
  formatGoalSeconds,
  formatPercent,
  formatSignedGoalSeconds,
} from '../trainingV1/utils/formatUtils.js';

export default function GoalCard({
  goal,
  data,
  t,
  tc,
  isArchived = false,
  onViewDetails,
  onEdit,
  onArchive,
}) {
  const currentPerformance = getGoalCurrentPerformance(goal, data);
  const progress = getGoalProgressWithPB(goal, data);
  const gap = getGoalGapWithPB(goal, data);
  const achieved = progress === 100;
  const performanceSourceLabel = currentPerformance.source === 'records'
    ? t.recordSourcePB
    : currentPerformance.source === 'goal'
      ? t.manualCurrent
      : '--';

  return (
    <div className={`${tc.cardBg} rounded-2xl shadow-sm border ${tc.borderLight} p-5 space-y-4 ${isArchived ? 'opacity-70' : ''}`}>
      <div className="flex justify-between gap-3 items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${goal.priority === 'A' ? 'bg-red-50 text-red-600 border border-red-100' : goal.priority === 'B' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
              {t.priority} {goal.priority}
            </span>
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${achieved ? 'bg-green-50 text-green-600 border border-green-100' : `${tc.badgeBg} ${tc.textPrimary}`}`}>
              {achieved ? t.achieved : goal.status}
            </span>
          </div>
          <h2 className={`text-lg font-black ${tc.textHeading} leading-tight truncate`}>{goal.title}</h2>
          <p className={`text-xs ${tc.textMuted} font-bold mt-1 truncate`}>
            {goal.competitionName || '--'} · {formatDateLabel(goal.competitionDate)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`${tc.badgeBg} bg-opacity-40 rounded-xl p-3`}>
          <div className={`text-[10px] font-black uppercase ${tc.textMuted}`}>{t.eventName}</div>
          <div className={`text-sm font-black ${tc.textHeading} mt-1 truncate`}>{goal.eventName || '--'}</div>
        </div>
        <div className={`${tc.badgeBg} bg-opacity-40 rounded-xl p-3`}>
          <div className={`text-[10px] font-black uppercase ${tc.textMuted}`}>{t.targetDistance}</div>
          <div className={`text-sm font-black ${tc.textHeading} mt-1 truncate`}>{goal.targetDistance || '--'}</div>
        </div>
        <div className="bg-gray-50/70 rounded-xl p-3 border border-gray-100">
          <div className="text-[10px] font-black uppercase text-gray-400">{performanceSourceLabel}</div>
          <div className={`text-sm font-black ${tc.textHeading} mt-1`}>{formatGoalSeconds(currentPerformance.timeSeconds)}</div>
          {currentPerformance.source === 'records' && currentPerformance.date && (
            <div className="text-[10px] font-black text-gray-400 mt-1">
              {t.pbDate}: {formatDateLabel(currentPerformance.date)}
            </div>
          )}
        </div>
        <div className="bg-gray-50/70 rounded-xl p-3 border border-gray-100">
          <div className="text-[10px] font-black uppercase text-gray-400">{t.targetTimeSeconds}</div>
          <div className={`text-sm font-black ${tc.textHeading} mt-1`}>{formatGoalSeconds(goal.targetTimeSeconds)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`${achieved ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'} rounded-xl p-3 border`}>
          <div className="text-[10px] font-black uppercase opacity-70">{t.gap}</div>
          <div className="text-lg font-black mt-0.5">{formatSignedGoalSeconds(gap)}</div>
        </div>
        <div className={`${tc.badgeBg} rounded-xl p-3`}>
          <div className={`text-[10px] font-black uppercase ${tc.textMuted}`}>{t.progress}</div>
          <div className={`text-lg font-black ${tc.textPrimary} mt-0.5`}>{formatPercent(progress)}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onViewDetails}
          className={`${tc.btnCancel} px-3 py-2 rounded-xl text-xs font-black inline-flex items-center gap-2 active:scale-95 transition-all`}
        >
          <Info size={14} /> {t.viewDetails}
        </button>
        {!isArchived && (
          <>
            <button
              onClick={onEdit}
              className={`${tc.badgeBg} ${tc.textPrimary} px-3 py-2 rounded-xl text-xs font-black inline-flex items-center gap-2 active:scale-95 transition-all`}
            >
              <Edit2 size={14} /> {t.editGoal}
            </button>
            <button
              onClick={onArchive}
              className="bg-red-50 text-red-500 border border-red-100 px-3 py-2 rounded-xl text-xs font-black inline-flex items-center gap-2 active:scale-95 transition-all"
            >
              <Archive size={14} /> {t.archiveGoal}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
