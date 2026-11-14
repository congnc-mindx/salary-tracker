import clsx from "clsx";

const variants = {
  reviewLoad: "border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200 dark:hover:bg-sky-900",
  reviewUpdate: "border border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200 dark:hover:bg-violet-900",
  reviewSave: "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 dark:hover:bg-emerald-900",
  primary: "bg-brand-600 text-white hover:bg-brand-hover",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
  danger: "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900",
};

export default function Button({ variant = "secondary", className, type = "button", children, ...props }) {
  return <button type={type} className={clsx(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900",
    variants[variant], className,
  )} {...props}>{children}</button>;
}
