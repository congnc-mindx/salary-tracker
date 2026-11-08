import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

const openDialogs = [];
let originalOverflow;

export default function ModalShell({
  title,
  description,
  children,
  onClose,
  busy = false,
  footer,
  toolbar,
  wide = false,
}) {
  const titleId = useId();
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const backdropPressed = useRef(false);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const panel = panelRef.current;
    if (!openDialogs.length) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    openDialogs.push(panel);
    closeButtonRef.current?.focus();

    return () => {
      const index = openDialogs.indexOf(panel);
      if (index !== -1) openDialogs.splice(index, 1);
      if (!openDialogs.length) document.body.style.overflow = originalOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, []);

  function trapFocus(event) {
    if (event.key !== "Tab" || openDialogs.at(-1) !== panelRef.current) return;
    // FloatingPanel is portalled into body; include its controls in the active dialog.
    const scopes = [
      panelRef.current,
      ...document.querySelectorAll("[data-floating-panel]"),
    ];
    const controls = scopes
      .flatMap((scope) => [
        ...scope.querySelectorAll(
          "button, a[href], input, select, textarea, summary, [tabindex]",
        ),
      ])
      .filter(
        (element) =>
          !element.matches(":disabled") &&
          element.tabIndex >= 0 &&
          element.getClientRects().length,
      );
    if (!controls.length) {
      event.preventDefault();
      panelRef.current?.focus();
      return;
    }
    const index = controls.indexOf(document.activeElement);
    event.preventDefault();
    const next =
      index === -1
        ? event.shiftKey
          ? controls.length - 1
          : 0
        : (index + (event.shiftKey ? -1 : 1) + controls.length) %
          controls.length;
    controls[next].focus();
  }

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
        trapFocus(event);
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
        tabIndex={-1}
        className={
          "flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-3xl bg-[#f5f8fc] text-slate-950 shadow-2xl sm:max-h-[calc(100dvh-2.5rem)] dark:bg-slate-900 dark:text-slate-100 " +
          (wide ? "max-w-6xl" : "max-w-xl")
        }
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

        {toolbar && (
          <div className="shrink-0 border-b border-slate-200 px-5 pb-4 dark:border-slate-700">
            {toolbar}
          </div>
        )}
        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-5">
          {children}
        </div>
        {footer && (
          <footer className="shrink-0 border-t border-slate-200 bg-[#f5f8fc] px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
            {footer}
          </footer>
        )}
      </section>
    </div>
  );
}
