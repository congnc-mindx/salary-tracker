export default function EmptyState({ children, action }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm leading-relaxed text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
    <p>{children}</p>
    {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>;
}
