import clsx from "clsx";

export default function IconButton({ label, className, children, ...props }) {
  return <button type="button" title={label} aria-label={label} className={clsx(
    "relative inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800", className,
  )} {...props}>{children}</button>;
}
