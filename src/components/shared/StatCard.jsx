const joinClasses = (...values) => values.filter(Boolean).join(' ');

const TONE_CLASSES = {
  default: 'bg-white/70',
  muted: 'bg-gray-50/70 border border-gray-100',
  success: 'bg-green-50 border border-green-100',
  warning: 'bg-yellow-50 border border-yellow-100',
};

export default function StatCard({
  label,
  value,
  helper = null,
  icon = null,
  tone = 'default',
  className = '',
  labelClassName = '',
  valueClassName = '',
  helperClassName = '',
}) {
  return (
    <div className={joinClasses('rounded-xl p-3', TONE_CLASSES[tone] || TONE_CLASSES.default, className)}>
      <div className={joinClasses('flex items-center justify-center gap-2 text-[10px] font-bold', labelClassName)}>
        {icon}
        <span>{label}</span>
      </div>
      <div className={joinClasses('text-lg font-black mt-1 text-center', valueClassName)}>
        {value}
      </div>
      {helper && (
        <div className={joinClasses('text-[10px] font-bold mt-1 text-center', helperClassName)}>
          {helper}
        </div>
      )}
    </div>
  );
}
