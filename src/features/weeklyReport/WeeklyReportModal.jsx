import { Download, X } from 'lucide-react';

import { ModalShell, StatCard } from '../../components/shared';

export default function WeeklyReportModal({
  isOpen,
  reportData,
  athleteDisplayName,
  t,
  tc,
  onClose,
  onPrint,
  formatGoalSeconds,
  formatSignedGoalSeconds,
}) {
  if (!isOpen || !reportData) return null;

  const planSummary = reportData.planSummary;
  const adherenceSummary = reportData.adherenceSummary;
  const dailyExecutionSummary = reportData.dailyExecutionSummary;
  const goalSummaries = reportData.goalSummaries || [];

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t.weeklyReport}
      icon={<Download size={18} className={tc.textPrimary} />}
      closeLabel={t.close}
      overlayClassName="z-[86]"
      className={`${tc.cardBg} weekly-report-print-root`}
      size="max-w-2xl"
      headerClassName={`border-b ${tc.borderLight} ${tc.badgeBg} weekly-report-print-hide ${tc.textHeading}`}
      closeButtonClassName={`${tc.textMuted} hover:text-red-500 weekly-report-print-hide`}
      bodyClassName="p-5 space-y-4"
      footerClassName={`border-t ${tc.borderLight} ${tc.appBg} weekly-report-print-hide`}
      footer={(
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onPrint}
            className={`${tc.btnPrimary} flex-1 min-w-[140px] py-3 rounded-xl font-bold shadow-md active:scale-95 transition-all inline-flex items-center justify-center gap-2`}
          >
            <Download size={16} /> {t.printReport}
          </button>
          <button
            onClick={onClose}
            className={`${tc.btnCancel} flex-1 min-w-[140px] py-3 rounded-xl font-bold active:scale-95 transition-all inline-flex items-center justify-center gap-2`}
          >
            <X size={16} /> {t.close}
          </button>
        </div>
      )}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .weekly-report-print-root,
          .weekly-report-print-root * {
            visibility: visible !important;
          }
          .weekly-report-print-root {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          .weekly-report-print-hide {
            display: none !important;
          }
        }
      `}</style>

      <section className={`${tc.badgeBg} rounded-2xl p-4 space-y-3`}>
        <div className={`text-[11px] font-black uppercase ${tc.textMuted}`}>Blaze Skate Training</div>
        <div className={`text-2xl font-black ${tc.textHeading}`}>{t.weeklyTrainingReport}</div>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
          <div className="bg-white/70 rounded-xl p-3">
            <div className={tc.textMuted}>{t.startDate}</div>
            <div className={`${tc.textHeading} mt-1`}>
              {(reportData.weekRange.startDate || '').replace(/-/g, '/')} - {(reportData.weekRange.endDate || '').replace(/-/g, '/')}
            </div>
          </div>
          <div className="bg-white/70 rounded-xl p-3">
            <div className={tc.textMuted}>{t.generatedDate}</div>
            <div className={`${tc.textHeading} mt-1`}>{(reportData.generatedDate || '').replace(/-/g, '/')}</div>
          </div>
          <div className="bg-white/70 rounded-xl p-3 col-span-2">
            <div className={tc.textMuted}>{t.athleteLabel}</div>
            <div className={`${tc.textHeading} mt-1`}>{athleteDisplayName || '--'}</div>
          </div>
        </div>
      </section>

      <section className={`${tc.badgeBg} rounded-2xl p-4 space-y-3`}>
        <div className={`text-xs font-black uppercase ${tc.textMuted}`}>{t.trainingPlanSummary}</div>
        {!adherenceSummary.plan ? (
          <div className={`text-xs font-bold ${tc.textMuted}`}>{t.noWeeklyPlan}</div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
            <div className="bg-white/70 rounded-xl p-3">
              <div className={tc.textMuted}>{t.plansTitle}</div>
              <div className={`${tc.textHeading} mt-1 break-words`}>{planSummary.title || '--'}</div>
            </div>
            <div className="bg-white/70 rounded-xl p-3">
              <div className={tc.textMuted}>{t.focus}</div>
              <div className={`${tc.textHeading} mt-1 break-words`}>{planSummary.focus || '--'}</div>
            </div>
            <div className="bg-white/70 rounded-xl p-3">
              <div className={tc.textMuted}>{t.startDate}</div>
              <div className={`${tc.textHeading} mt-1`}>{(planSummary.startDate || '').replace(/-/g, '/')} </div>
            </div>
            <div className="bg-white/70 rounded-xl p-3">
              <div className={tc.textMuted}>{t.endDate}</div>
              <div className={`${tc.textHeading} mt-1`}>{(planSummary.endDate || '').replace(/-/g, '/')} </div>
            </div>
            <div className="bg-white/70 rounded-xl p-3">
              <div className={tc.textMuted}>{t.status}</div>
              <div className={`${tc.textHeading} mt-1`}>{planSummary.status || '--'}</div>
            </div>
            <div className="bg-white/70 rounded-xl p-3">
              <div className={tc.textMuted}>{t.linkedGoal}</div>
              <div className={`${tc.textHeading} mt-1 break-words`}>{planSummary.linkedGoalTitle || '--'}</div>
            </div>
          </div>
        )}
      </section>

      <section className={`${tc.badgeBg} rounded-2xl p-4 space-y-3`}>
        <div className={`text-xs font-black uppercase ${tc.textMuted}`}>{t.weeklyPlanAdherence}</div>
        {!adherenceSummary.plan ? (
          <div className={`text-xs font-bold ${tc.textMuted}`}>{t.noWeeklyPlan}</div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-center">
            <StatCard label={t.planTasksLabel} value={adherenceSummary.totalPlanTasks} className="text-center" labelClassName={tc.textMuted} valueClassName={tc.textHeading} />
            <StatCard label={t.completedPlanTasksLabel} value={adherenceSummary.completedPlanTasks} className="text-center" labelClassName={tc.textMuted} valueClassName={tc.textHeading} />
            <StatCard label={t.addedToToday} value={adherenceSummary.addedToTodayTasks} className="text-center" labelClassName={tc.textMuted} valueClassName={tc.textHeading} />
            <StatCard label={t.dailyTasksCompleted} value={adherenceSummary.dailyTasksCompleted} className="text-center" labelClassName={tc.textMuted} valueClassName={tc.textHeading} />
            <StatCard label={t.adherence} value={`${adherenceSummary.adherencePercent}%`} className="col-span-2 text-center" labelClassName={tc.textMuted} valueClassName={`text-2xl ${tc.textHeading}`} />
          </div>
        )}
      </section>

      <section className={`${tc.badgeBg} rounded-2xl p-4 space-y-3`}>
        <div className={`text-xs font-black uppercase ${tc.textMuted}`}>{t.dailyExecutionSummary}</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <StatCard label={t.dailyTasksLabel} value={dailyExecutionSummary.totalDailyTasks} className="text-center" labelClassName={tc.textMuted} valueClassName={tc.textHeading} />
          <StatCard label={t.completedLabel} value={dailyExecutionSummary.completedDailyTasks} className="text-center" labelClassName={tc.textMuted} valueClassName={tc.textHeading} />
          <StatCard label={t.progress} value={`${dailyExecutionSummary.completionPercent}%`} className="text-center" labelClassName={tc.textMuted} valueClassName={tc.textHeading} />
        </div>
        <div className={`text-xs font-bold ${tc.textMuted}`}>{t.dailyTasksCurrentNote}</div>
      </section>

      <section className={`${tc.badgeBg} rounded-2xl p-4 space-y-3`}>
        <div className={`text-xs font-black uppercase ${tc.textMuted}`}>{t.targetGapTitle}</div>
        {goalSummaries.length === 0 ? (
          <div className={`text-xs font-bold ${tc.textMuted}`}>{t.noGoals}</div>
        ) : (
          <div className="space-y-2">
            {goalSummaries.map((goal) => {
              const sourceLabel = goal.currentPerformance.source === 'records'
                ? t.recordSourcePB
                : goal.currentPerformance.source === 'goal'
                  ? t.manualCurrent
                  : '--';

              return (
                <div key={goal.id} className="bg-white/70 rounded-xl p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className={`text-sm font-black ${tc.textHeading} truncate`}>{goal.title}</div>
                      <div className={`text-[10px] font-bold ${tc.textMuted} mt-1 truncate`}>
                        {goal.eventName || goal.targetDistance || '--'}
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg shrink-0 ${goal.achieved ? 'bg-green-50 text-green-600 border border-green-100' : tc.badgeBg + ' ' + tc.textPrimary}`}>
                      {goal.achieved ? t.achieved : `${goal.progressPercent ?? 0}%`}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <div className="bg-white rounded-lg p-2">
                      <div className={tc.textMuted}>{sourceLabel}</div>
                      <div className={`${tc.textHeading} mt-0.5`}>{formatGoalSeconds(goal.currentPerformance.timeSeconds)}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <div className={tc.textMuted}>{t.targetTimeSeconds}</div>
                      <div className={`${tc.textHeading} mt-0.5`}>{formatGoalSeconds(goal.targetTimeSeconds)}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <div className={tc.textMuted}>{t.latestGap}</div>
                      <div className={`${goal.achieved ? 'text-green-600' : tc.textHeading} mt-0.5`}>{formatSignedGoalSeconds(goal.latestGap)}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <div className={tc.textMuted}>{t.progress}</div>
                      <div className={`${tc.textHeading} mt-0.5`}>{goal.progressPercent === null ? '--' : `${goal.progressPercent}%`}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className={`${tc.badgeBg} rounded-2xl p-4 space-y-3`}>
        <div className={`text-xs font-black uppercase ${tc.textMuted}`}>{t.recentPbProgress}</div>
        {goalSummaries.length === 0 ? (
          <div className={`text-xs font-bold ${tc.textMuted}`}>{t.noPbHistoryYet}</div>
        ) : (
          <div className="space-y-2">
            {goalSummaries.map((goal) => (
              <div key={`${goal.id}_trend`} className="bg-white/70 rounded-xl p-3 space-y-2">
                <div className={`text-sm font-black ${tc.textHeading} truncate`}>{goal.title}</div>
                {!goal.trendSummary.hasHistory ? (
                  <div className={`text-xs font-bold ${tc.textMuted}`}>{t.noPbHistoryYet}</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <div className="bg-white rounded-lg p-2">
                      <div className={tc.textMuted}>{t.latestGap}</div>
                      <div className={`${tc.textHeading} mt-0.5`}>{formatSignedGoalSeconds(goal.trendSummary.latestGapSeconds)}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <div className={tc.textMuted}>{t.bestGap}</div>
                      <div className={`${tc.textHeading} mt-0.5`}>{formatSignedGoalSeconds(goal.trendSummary.bestGapSeconds)}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <div className={tc.textMuted}>{t.improvement}</div>
                      <div className={`${typeof goal.trendSummary.improvementSeconds === 'number' && goal.trendSummary.improvementSeconds > 0 ? 'text-green-600' : tc.textHeading} mt-0.5`}>
                        {formatGoalSeconds(goal.trendSummary.improvementSeconds)}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <div className={tc.textMuted}>{t.latestRecord}</div>
                      <div className={`${tc.textHeading} mt-0.5`}>
                        {goal.trendSummary.latestRecordDate ? goal.trendSummary.latestRecordDate.replace(/-/g, '/') : '--'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="pt-1">
        <div className={`text-xs font-bold ${tc.textMuted}`}>{t.generatedByBlaze}</div>
      </section>
    </ModalShell>
  );
}
