import { SUBJECT_GROUPS } from "../reviewsModel";
export default function TemplateGroups({ templates, onFinal, onSessions }) {
  const sections = [
    {
      name: "Codings",
      groups: SUBJECT_GROUPS.filter((g) => !g.subjects[0].startsWith("PRE")),
    },
    {
      name: "Robotics",
      groups: [
        ...SUBJECT_GROUPS.filter((g) => g.subjects[0].startsWith("PRE")),
        { name: "ARM", subjects: ["ARM"] },
      ],
    },
  ];
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.name}>
          <h2 className="mb-4 text-xl font-black">{section.name}</h2>
          <div className="grid items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {section.groups.map((group) => (
              <section
                key={group.name}
                className="min-w-0 rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/50"
              >
                <h3 className="mb-3 px-1 text-sm font-black">{group.name}</h3>
                <div className="space-y-3">
                  {group.subjects.map((subject) => (
                    <article
                      key={subject}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="min-w-0">
                        <h4 className="font-black text-brand-700 dark:text-brand-400">
                          {subject}
                        </h4>
                        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          {templates[subject]
                            ? "Có mẫu cuối khóa"
                            : "Chưa có mẫu cuối khóa"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => onSessions(subject)}
                          className="whitespace-nowrap rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white"
                        >
                          Mẫu từng buổi
                        </button>
                        <button
                          type="button"
                          onClick={() => onFinal(subject)}
                          className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold dark:bg-slate-800"
                        >
                          Mẫu cuối khóa
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
