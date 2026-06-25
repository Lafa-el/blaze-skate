const joinClasses = (...values) => values.filter(Boolean).join(' ');

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action = null,
  className = '',
  eyebrowClassName = '',
  titleClassName = '',
  descriptionClassName = '',
}) {
  return (
    <div className={joinClasses('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        {eyebrow && <div className={joinClasses('text-xs font-black uppercase mb-1', eyebrowClassName)}>{eyebrow}</div>}
        <h2 className={joinClasses('text-2xl font-black', titleClassName)}>{title}</h2>
        {description && <p className={joinClasses('text-sm mt-1', descriptionClassName)}>{description}</p>}
      </div>
      {action}
    </div>
  );
}
