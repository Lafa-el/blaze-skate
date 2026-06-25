import { Archive, CalendarDays, Edit2 } from 'lucide-react';

import { StatCard } from '../../components/shared';
import { formatDateLabel } from '../trainingV1/utils/formatUtils.js';

export default function SelectedPlanHeader({
  plan,
  lang,
  t,
  tc,
  linkedGoal,
  completion,
  weeklyAdherenceSummary,
  activePlansCount = 0,
  onOpenWeeklyReport,
  onEditPlan,
  onArchivePlan,
}) {
  return (
    <>
      <div className={`relative overflow-hidden bg-gradient-to-br ${tc.gradientCard} rounded-[2rem] p-6 text-white shadow-lg space-y-5`}>
        <CalendarDays size={120} className="absolute -right-5 -bottom-8 opacity-10 pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase opacity-75 mb-1">
              {t.activePlan} · {plan.status}
            </div>
            <h3 className="text-2xl font-black leading-tight break-words">{plan.title}</h3>
            <p className="text-sm font-medium opacity-85 mt-1 break-words">{plan.focus || t.focus}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={onEditPlan}
              className="p-2 bg-white/20 rounded-xl active:scale-95 transition-all"
              aria-label={t.editPlan}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={onArchivePlan}
              className="p-2 bg-white/20 rounded-xl active:scale-95 transition-all"
              aria-label={t.archivePlan}
            >
              <Archive size={16} />
            </button>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3">
          <div className="bg-white/15 rounded-2xl p-3">
            <div className="text-[10px] font-black uppercase opacity-70">{t.startDate}</div>
            <div className="text-sm font-black mt-1">{formatDateLabel(plan.startDate)}</div>
          </div>
          <div className="bg-white/15 rounded-2xl p-3">
            <div className="text-[10px] font-black uppercase opacity-70">{t.endDate}</div>
            <div className="text-sm font-black mt-1">{formatDateLabel(plan.endDate)}</div>
          </div>
          <div className="bg-white/15 rounded-2xl p-3">
            <div className="text-[10px] font-black uppercase opacity-70">{t.weeklyCompletion}</div>
            <div className="text-sm font-black mt-1">
              {completion.completedTasks}/{completion.totalTasks} · {completion.completionPercent}%
            </div>
          </div>
          <div className="bg-white/15 rounded-2xl p-3">
            <div className="text-[10px] font-black uppercase opacity-70">{t.linkedGoal}</div>
            <div className="text-sm font-black mt-1 truncate">{linkedGoal?.title || '--'}</div>
          </div>
        </div>

        {activePlansCount > 0 && (
          <div className="relative z-10 text-[10px] font-bold opacity-75">
            {activePlansCount} {lang === 'en' ? 'active plan(s)' : '个进行中计划'}
          </div>
        )}
      </div>

      <div className={`${tc.cardBg} border ${tc.borderLight} rounded-2xl p-4 shadow-sm space-y-3`}>
        <div className="flex items-center justify-between gap-3">
          <div className={`text-xs font-black ${tc.textMuted} uppercase`}>{t.weeklyPlanAdherence}</div>
          <button
            onClick={onOpenWeeklyReport}
            className={`${tc.btnCancel} px-3 py-2 rounded-lg text-[11px] font-black active:scale-95 transition-all shrink-0`}
          >
            {t.weeklyReport}
          </button>
        </div>
        {!weeklyAdherenceSummary ? (
          <div className={`text-xs font-bold ${tc.textMuted}`}>{t.noWeeklyPlan}</div>
        ) : weeklyAdherenceSummary.totalPlanTasks === 0 ? (
          <div className={`text-xs font-bold ${tc.textMuted}`}>{t.noPlanTasksThisWeek}</div>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-center">
            <StatCard label={t.planTasksLabel} value={weeklyAdherenceSummary.totalPlanTasks} className={`${tc.badgeBg} text-center`} labelClassName={tc.textMuted} valueClassName={tc.textHeading} />
            <StatCard label={t.completedPlanTasksLabel} value={weeklyAdherenceSummary.completedPlanTasks} className={`${tc.badgeBg} text-center`} labelClassName={tc.textMuted} valueClassName={tc.textHeading} />
            <StatCard label={t.adherence} value={`${weeklyAdherenceSummary.planCompletionPercent}%`} className={`${tc.badgeBg} text-center`} labelClassName={tc.textMuted} valueClassName={tc.textHeading} />
          </div>
        )}
      </div>
    </>
  );
}
