import clsx from "clsx";

const variants = {
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
