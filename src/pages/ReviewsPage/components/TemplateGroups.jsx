import { SUBJECT_GROUPS } from "../reviewsModel";

export default function TemplateGroups({ templates, onFinal, onSessions }) {
  return (
    <div className="grid items-start gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      {[...SUBJECT_GROUPS, { name: "Robotics · ARM", subjects: ["ARM"] }].map(
        (group) => (
          <section
            key={group.name}
            className="min-w-0 rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/50"
          >
            <h2 className="mb-3 px-1 text-base font-black">{group.name}</h2>
            <div className="space-y-3">
              {group.subjects.map((subject) => (
                <article
                  key={subject}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-black text-brand-700 dark:text-brand-400">
                      {subject}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {templates[subject]
                        ? "Có mẫu cuối khóa"
                        : "Chưa có mẫu cuối khóa"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onSessions(subject)}
                      className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white"
                    >
                      Mẫu từng buổi
                    </button>
                    <button
                      type="button"
                      onClick={() => onFinal(subject)}
                      className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold dark:bg-slate-800"
                    >
                      Mẫu cuối khóa
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
}
