const joinClasses = (...values) => values.filter(Boolean).join(' ');

export default function ModalShell({
  isOpen,
  title,
  subtitle,
  children,
  footer = null,
  onClose,
  size = 'max-w-md',
  className = '',
  overlayClassName = '',
  panelClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  titleId,
  closeLabel = 'Close',
  icon = null,
  closeButtonClassName = '',
}) {
  if (!isOpen) return null;

  const resolvedTitleId = titleId || `modal-${String(title || 'content').replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div
      className={joinClasses(
        'fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in',
        overlayClassName
      )}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? resolvedTitleId : undefined}
        aria-label={!title ? closeLabel : undefined}
        className={joinClasses(
          'w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]',
          size,
          className,
          panelClassName
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {(title || subtitle) && (
          <div className={joinClasses('p-4 flex items-center justify-between gap-3', headerClassName)}>
            <div className="min-w-0">
              {title && (
                <h3 id={resolvedTitleId} className="font-black flex items-center gap-2 min-w-0">
                  {icon}
                  <span className="truncate">{title}</span>
                </h3>
              )}
              {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className={joinClasses('p-1 rounded-lg transition-colors shrink-0', closeButtonClassName)}
            >
              <span aria-hidden="true">X</span>
            </button>
          </div>
        )}

        <div className={joinClasses('overflow-y-auto', bodyClassName)}>
          {children}
        </div>

        {footer && (
          <div className={joinClasses('p-4', footerClassName)}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
