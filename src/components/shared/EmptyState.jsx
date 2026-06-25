const joinClasses = (...values) => values.filter(Boolean).join(' ');

export default function EmptyState({
  icon = null,
  title,
  description,
  action = null,
  className = '',
  iconClassName = '',
  titleClassName = '',
  descriptionClassName = '',
}) {
  return (
    <div className={joinClasses('text-center space-y-4', className)}>
      {icon && (
        <div className={joinClasses('w-16 h-16 mx-auto rounded-2xl flex items-center justify-center', iconClassName)}>
          {icon}
        </div>
      )}
      <div>
        {title && <h3 className={joinClasses('font-black', titleClassName)}>{title}</h3>}
        {description && (
          <p className={joinClasses('text-sm mt-1 leading-relaxed', descriptionClassName)}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
