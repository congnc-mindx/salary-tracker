import { useState } from "react";
import { ChevronRight } from "lucide-react";

import ModalShell from "./ModalShell";

export function CompactGrid({ children }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-3">
      {children}
    </div>
  );
}

export default function CompactRecord({
  title,
  badge,
  summary,
  footer,
  children,
}) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="flex h-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-3.5 text-left text-slate-900 shadow-sm transition-colors hover:border-brand-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-brand-500"
      >
        <div className="flex w-full items-start justify-between gap-2">
          <span className="min-w-0 break-words text-base font-black text-brand-700 dark:text-brand-300">
            {title}
          </span>

          <ChevronRight
            size={17}
            aria-hidden="true"
            className="mt-1 shrink-0 text-slate-400"
          />
        </div>

        {badge && (
          <div className="mt-2 flex flex-wrap items-center gap-2">{badge}</div>
        )}

        <div className="mt-3 w-full text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {summary}
        </div>

        {footer && <div className="mt-auto w-full pt-3">{footer}</div>}
      </button>

      {open && (
        <ModalShell title={title} onClose={close}>
          {typeof children === "function" ? children(close) : children}
        </ModalShell>
      )}
    </>
  );
}
