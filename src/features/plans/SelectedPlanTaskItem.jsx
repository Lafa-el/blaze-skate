import {
  Check,
  CheckCircle2,
  Circle,
  Edit2,
  Plus,
} from 'lucide-react';

export default function SelectedPlanTaskItem({
  task,
  lang,
  t,
  tc,
  taskDailyStatus,
  onToggleComplete,
  onAddToToday,
  onEdit,
}) {
  const { isAddedToToday, isScheduledToday, isAddedFromOtherDate } = taskDailyStatus;
  const dailyStatusLabel = isAddedFromOtherDate ? t.addedFromOtherDate : (isAddedToToday ? t.added : t.notAdded);
  const dailyStatusClass = isAddedFromOtherDate
    ? 'bg-amber-50 text-amber-700 border border-amber-100'
    : isAddedToToday
      ? 'bg-green-50 text-green-600 border border-green-100'
      : `${tc.badgeBg} ${tc.textMuted}`;

  return (
    <div className={`${task.completed ? `${tc.badgeBg} opacity-75` : 'bg-white/80'} border ${tc.borderLight} rounded-xl p-3 space-y-3`}>
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={onToggleComplete}
          className="pt-0.5 shrink-0"
          aria-label={task.completed ? 'Uncomplete plan task' : 'Complete plan task'}
        >
          {task.completed ? (
            <CheckCircle2 size={22} className={tc.checkActive} />
          ) : (
            <Circle size={22} className={`${tc.textMuted} opacity-60`} />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className={`font-black text-sm leading-tight ${task.completed ? `${tc.textMuted} line-through` : tc.textHeading}`}>
            {task.text}
          </div>
          {task.target && (
            <div className={`text-[11px] font-bold mt-1 ${tc.textPrimary}`}>
              {t.targetLabel}: {task.target}
            </div>
          )}
          {task.desc && (
            <p className={`text-[11px] leading-relaxed mt-1 ${tc.textMuted}`}>{task.desc}</p>
          )}
        </div>

        <button
          onClick={onEdit}
          className={`p-1.5 ${tc.badgeBg} ${tc.textPrimary} rounded-lg shrink-0 active:scale-95 transition-all`}
          aria-label={t.editPlanTask}
        >
          <Edit2 size={15} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-[10px] font-black">
        <span className={`${tc.badgeBg} ${tc.textPrimary} px-2 py-1 rounded-lg`}>{task.category || 'other'}</span>
        {task.durationMinutes && <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">{task.durationMinutes} min</span>}
        {task.intensity && <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg">{task.intensity}</span>}
        {isScheduledToday && (
          <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-lg">{t.scheduledToday}</span>
        )}
        <span className={`${dailyStatusClass} px-2 py-1 rounded-lg`}>{dailyStatusLabel}</span>
        {task.completed && !task.completedAt && (
          <span className="bg-green-50 text-green-600 px-2 py-1 rounded-lg">{t.achieved}</span>
        )}
        {task.completedAt && (
          <span className="bg-green-50 text-green-600 px-2 py-1 rounded-lg">
            {t.completedAt}: {new Date(task.completedAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN')}
          </span>
        )}
      </div>

      {!task.completed && (
        <div className="flex justify-end">
          {isAddedToToday ? (
            <button
              type="button"
              disabled
              className={`${tc.badgeBg} ${tc.textMuted} px-3 py-2 rounded-lg text-[11px] font-black inline-flex items-center justify-center gap-2 cursor-not-allowed`}
            >
              <Check size={14} /> {t.added}
            </button>
          ) : (
            <button
              onClick={onAddToToday}
              className={`${tc.btnCancel} px-3 py-2 rounded-lg text-[11px] font-black inline-flex items-center justify-center gap-2 active:scale-95 transition-all`}
            >
              <Plus size={14} /> {t.addToToday}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
