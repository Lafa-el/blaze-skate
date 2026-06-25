import { Archive, Edit2, Target, X } from 'lucide-react';

import { ModalShell } from '../../components/shared';
import {
  getGoalCurrentPerformance,
  getGoalGapWithPB,
  getGoalProgressWithPB,
  getGoalTargetGapHistory,
  getGoalTrendSummary,
} from '../trainingV1/goals.js';

export default function GoalDetailModal({
  isOpen,
  goal,
  data,
  t,
  tc,
  onClose,
  onEditGoal,
  onArchiveGoal,
  formatGoalSeconds,
  formatSignedGoalSeconds,
}) {
  if (!isOpen || !goal) return null;

  const currentPerformance = getGoalCurrentPerformance(goal, data);
  const progress = getGoalProgressWithPB(goal, data);
  const gap = getGoalGapWithPB(goal, data);
  const trendSummary = getGoalTrendSummary(goal, data);
  const gapHistory = getGoalTargetGapHistory(goal, data);
  const recentHistory = gapHistory.slice(-5).reverse();
  const performanceSourceLabel = currentPerformance.source === 'records'
    ? t.recordSourcePB
    : currentPerformance.source === 'goal'
      ? t.manualCurrent
      : '--';
  const achieved = progress === 100 || trendSummary.achieved;
  const isArchived = goal.status === 'archived';

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t.viewDetails}
      icon={<Target size={18} className={tc.textPrimary} />}
      closeLabel={t.close}
      overlayClassName="z-[85]"
      className={tc.cardBg}
      size="max-w-md"
      headerClassName={`border-b ${tc.borderLight} ${tc.badgeBg} ${tc.textHeading}`}
      closeButtonClassName={`${tc.textMuted} hover:text-red-500`}
      bodyClassName="p-5 space-y-4"
      footerClassName={`border-t ${tc.borderLight} ${tc.appBg}`}
      footer={(
        <div className="flex flex-wrap gap-2">
          {!isArchived && (
            <>
              <button
                onClick={onEditGoal}
                className={`${tc.btnPrimary} flex-1 min-w-[120px] py-3 rounded-xl font-bold shadow-md active:scale-95 transition-all inline-flex items-center justify-center gap-2`}
              >
                <Edit2 size={16} /> {t.editGoal}
              </button>
              <button
                onClick={onArchiveGoal}
                className="flex-1 min-w-[120px] py-3 rounded-xl font-bold bg-red-50 text-red-500 border border-red-100 active:scale-95 transition-all inline-flex items-center justify-center gap-2"
              >
                <Archive size={16} /> {t.archiveGoal}
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className={`${tc.btnCancel} flex-1 min-w-[120px] py-3 rounded-xl font-bold active:scale-95 transition-all inline-flex items-center justify-center gap-2`}
          >
            <X size={16} /> {t.close}
          </button>
        </div>
      )}
    >
      <section className={`${tc.badgeBg} rounded-2xl p-4 space-y-3`}>
        <div className="flex items-center justify-between gap-3">
          <div className={`text-xs font-black uppercase ${tc.textMuted}`}>{t.goalOverview}</div>
          {achieved && (
            <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-green-50 text-green-600 border border-green-100">
              {t.targetAchieved}
            </span>
          )}
        </div>
        <div className={`text-lg font-black ${tc.textHeading} break-words`}>{goal.title || '--'}</div>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
          <div className="bg-white/70 rounded-xl p-3">
            <div className={tc.textMuted}>{t.competitionName}</div>
            <div className={`${tc.textHeading} mt-1 break-words`}>{goal.competitionName || '--'}</div>
          </div>
          <div className="bg-white/70 rounded-xl p-3">
            <div className={tc.textMuted}>{t.competitionDate}</div>
            <div className={`${tc.textHeading} mt-1`}>{(goal.competitionDate || '').replace(/-/g, '/') || '--'}</div>
          </div>
          <div className="bg-white/70 rounded-xl p-3">
            <div className={tc.textMuted}>{t.eventName}</div>
            <div className={`${tc.textHeading} mt-1 break-words`}>{goal.eventName || '--'}</div>
          </div>
          <div className="bg-white/70 rounded-xl p-3">
            <div className={tc.textMuted}>{t.targetDistance}</div>
            <div className={`${tc.textHeading} mt-1 break-words`}>{goal.targetDistance || '--'}</div>
          </div>
          <div className="bg-white/70 rounded-xl p-3">
            <div className={tc.textMuted}>{t.priority}</div>
            <div className={`${tc.textHeading} mt-1`}>{goal.priority || '--'}</div>
          </div>
          <div className="bg-white/70 rounded-xl p-3">
            <div className={tc.textMuted}>{t.status}</div>
            <div className={`${tc.textHeading} mt-1`}>{goal.status || '--'}</div>
          </div>
        </div>
        {goal.notes && (
          <div className="bg-white/70 rounded-xl p-3">
            <div className={`text-[10px] font-black uppercase ${tc.textMuted} mb-1`}>{t.notes}</div>
            <p className={`text-xs leading-relaxed ${tc.appText}`}>{goal.notes}</p>
          </div>
        )}
      </section>

      <section className={`${tc.badgeBg} rounded-2xl p-4 space-y-3`}>
        <div className={`text-xs font-black uppercase ${tc.textMuted}`}>{t.currentPerformance}</div>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
          <div className="bg-white/70 rounded-xl p-3">
            <div className={tc.textMuted}>{performanceSourceLabel}</div>
            <div className={`${tc.textHeading} mt-1`}>{formatGoalSeconds(currentPerformance.timeSeconds)}</div>
            {currentPerformance.source === 'records' && currentPerformance.date && (
              <div className={`${tc.textMuted} mt-1`}>{t.pbDate}: {currentPerformance.date.replace(/-/g, '/')}</div>
            )}
          </div>
          <div className="bg-white/70 rounded-xl p-3">
            <div className={tc.textMuted}>{t.targetTimeSeconds}</div>
            <div className={`${tc.textHeading} mt-1`}>{formatGoalSeconds(goal.targetTimeSeconds)}</div>
          </div>
          <div className="bg-white/70 rounded-xl p-3">
            <div className={tc.textMuted}>{t.progress}</div>
            <div className={`${tc.textHeading} mt-1`}>{progress === null ? '--' : `${progress}%`}</div>
          </div>
          <div className="bg-white/70 rounded-xl p-3">
            <div className={tc.textMuted}>{t.status}</div>
            <div className={`${achieved ? 'text-green-600' : tc.textHeading} mt-1`}>
              {achieved ? t.targetAchieved : (goal.status || '--')}
            </div>
          </div>
        </div>
      </section>

      <section className={`${tc.badgeBg} rounded-2xl p-4 space-y-3`}>
        <div className={`text-xs font-black uppercase ${tc.textMuted}`}>{t.targetGap}</div>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
          <div className="bg-white/70 rounded-xl p-3">
            <div className={tc.textMuted}>{t.latestGap}</div>
            <div className={`${tc.textHeading} mt-1`}>{formatSignedGoalSeconds(trendSummary.latestGapSeconds ?? gap)}</div>
          </div>
          <div className="bg-white/70 rounded-xl p-3">
            <div className={tc.textMuted}>{t.bestGap}</div>
            <div className={`${tc.textHeading} mt-1`}>{formatSignedGoalSeconds(trendSummary.bestGapSeconds)}</div>
          </div>
          <div className="bg-white/70 rounded-xl p-3">
            <div className={tc.textMuted}>{t.improvement}</div>
            <div className={`${typeof trendSummary.improvementSeconds === 'number' && trendSummary.improvementSeconds > 0 ? 'text-green-600' : tc.textHeading} mt-1`}>
              {formatGoalSeconds(trendSummary.improvementSeconds)}
            </div>
          </div>
          <div className="bg-white/70 rounded-xl p-3">
            <div className={tc.textMuted}>{t.targetAchieved}</div>
            <div className={`${achieved ? 'text-green-600' : tc.textHeading} mt-1`}>
              {achieved ? t.achieved : '--'}
            </div>
          </div>
        </div>
      </section>

      <section className={`${tc.badgeBg} rounded-2xl p-4 space-y-3`}>
        <div className={`text-xs font-black uppercase ${tc.textMuted}`}>{t.progressHistory}</div>
        {!trendSummary.hasHistory ? (
          <div className={`text-xs font-bold ${tc.textMuted}`}>{t.noPbHistoryYet}</div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
            <div className="bg-white/70 rounded-xl p-3">
              <div className={tc.textMuted}>{t.latestGap}</div>
              <div className={`${tc.textHeading} mt-1`}>{formatSignedGoalSeconds(trendSummary.latestGapSeconds)}</div>
            </div>
            <div className="bg-white/70 rounded-xl p-3">
              <div className={tc.textMuted}>{t.bestGap}</div>
              <div className={`${tc.textHeading} mt-1`}>{formatSignedGoalSeconds(trendSummary.bestGapSeconds)}</div>
            </div>
            <div className="bg-white/70 rounded-xl p-3">
              <div className={tc.textMuted}>{t.latestRecord}</div>
              <div className={`${tc.textHeading} mt-1`}>{trendSummary.latestRecordDate ? trendSummary.latestRecordDate.replace(/-/g, '/') : '--'}</div>
            </div>
            <div className="bg-white/70 rounded-xl p-3">
              <div className={tc.textMuted}>{t.bestRecordDate}</div>
              <div className={`${tc.textHeading} mt-1`}>{trendSummary.bestRecordDate ? trendSummary.bestRecordDate.replace(/-/g, '/') : '--'}</div>
            </div>
          </div>
        )}
      </section>

      <section className={`${tc.badgeBg} rounded-2xl p-4 space-y-3`}>
        <div className={`text-xs font-black uppercase ${tc.textMuted}`}>{t.recentPbRecords}</div>
        {recentHistory.length === 0 ? (
          <div className={`text-xs font-bold ${tc.textMuted}`}>{t.noPbHistoryYet}</div>
        ) : (
          <div className="space-y-2">
            {recentHistory.map((record) => (
              <div key={`${goal.id}_${record.date}_${record.timeSeconds}`} className="grid grid-cols-[1.2fr_1fr_1fr] gap-2 bg-white/70 rounded-xl p-3 text-[11px] font-bold items-center">
                <div className={tc.textMuted}>{record.date.replace(/-/g, '/')}</div>
                <div className={tc.textHeading}>{formatGoalSeconds(record.timeSeconds)}</div>
                <div className="flex items-center justify-end gap-2">
                  <span className={record.achieved ? 'text-green-600' : tc.textHeading}>{formatSignedGoalSeconds(record.gapSeconds)}</span>
                  {record.achieved && (
                    <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-green-50 text-green-600 border border-green-100">
                      {t.achieved}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </ModalShell>
  );
}
