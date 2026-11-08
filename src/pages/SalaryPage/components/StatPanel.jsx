export default function StatPanel({ title, description, action, children }) {
  return (
    <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
