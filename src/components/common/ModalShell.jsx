import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

export default function ModalShell({
  title,
  description,
  children,
  onClose,
  busy = false,
}) {
  const titleId = useId();
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const backdropPressed = useRef(false);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;

      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, []);

  function requestClose() {
    const saving = panelRef.current?.closest("fieldset")?.disabled;

    if (busy || saving) return;
    onClose?.();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-5"
      onPointerDown={(event) => {
        backdropPressed.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (backdropPressed.current && event.target === event.currentTarget) {
          requestClose();
        }

        backdropPressed.current = false;
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !event.defaultPrevented) {
          event.preventDefault();
          event.stopPropagation();
          requestClose();
        }
      }}
    >
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-[#f5f8fc] text-slate-950 shadow-2xl sm:max-h-[calc(100dvh-2.5rem)] dark:bg-slate-900 dark:text-slate-100"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 px-5 pb-4 pt-5">
          <div className="min-w-0">
            <h3 id={titleId} className="text-2xl font-black">
              {title}
            </h3>

            {description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={requestClose}
            disabled={busy}
            aria-label="Đóng"
            className="shrink-0 rounded-full bg-white p-2 text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-5">
          {children}
        </div>
      </section>
    </div>
  );
}
