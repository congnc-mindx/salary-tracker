import { useState } from "react";
import { useSubjectCatalog } from "../SubjectCatalogContext";
import SubjectGroupEditor from "./SubjectGroupEditor";
export default function TemplateGroups({ templates, onFinal, onSessions, onSaveGroup }) {
  const catalog = useSubjectCatalog();
  const [editor, setEditor] = useState(null);
  const sections = [
    { name: "Codings", groups: catalog.filter(g=>g.category==='coding') },
    { name: "Robotics", groups: catalog.filter(g=>g.category==='robotics') },
  ];
  return (
    <div className="space-y-8">
      {editor && <SubjectGroupEditor group={editor.id ? editor : null} catalog={catalog} onSave={onSaveGroup} onClose={()=>setEditor(null)} />}
      {sections.map((section) => (
        <section key={section.name}>
          <h2 className="mb-4 text-xl font-black">{section.name}</h2>
          <div className="space-y-4">
            {section.groups.map((group) => (
              <section
                key={group.id}
                className="min-w-0 rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/50"
              >
                <div className="mb-3 flex items-center justify-between gap-3 px-1">
<h3 className="text-sm font-black">{group.name}</h3>
<button type="button" onClick={()=>setEditor(group)} className="shrink-0 text-xs font-bold text-brand-600 dark:text-brand-400">Sửa / Thêm học phần</button>
</div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {group.subjects.map((subject) => (
                    <article
                      key={subject.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="min-w-0">
                        <h4 className="font-black text-brand-700 dark:text-brand-400">
                          {subject.code}
                        </h4>
{subject.name && <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">{subject.name}</p>}
                        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          {templates[subject.id]
                            ? "Có mẫu cuối khóa"
                            : "Chưa có mẫu cuối khóa"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => onSessions(subject.id)}
                          className="whitespace-nowrap rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white"
                        >
                          Mẫu từng buổi
                        </button>
                        <button
                          type="button"
                          onClick={() => onFinal(subject.id)}
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
