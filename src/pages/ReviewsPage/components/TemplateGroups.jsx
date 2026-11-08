import { useState } from "react";
import { Search, BookOpen, FileText, Settings2 } from "lucide-react";
import { useSubjectCatalog } from "../SubjectCatalogContext";
import SubjectGroupEditor from "./SubjectGroupEditor";

export default function TemplateGroups({
  templates,
  onFinal,
  onSessions,
  onSaveGroup,
}) {
  const catalog = useSubjectCatalog();
  const [editor, setEditor] = useState(null);
  const [query, setQuery] = useState("");
  const term = query.trim().toLocaleLowerCase("vi");
  const groups = catalog
    .map((g) => ({
      ...g,
      subjects: g.subjects.filter((s) =>
        `${g.name} ${s.code} ${s.name || ""}`
          .toLocaleLowerCase("vi")
          .includes(term),
      ),
    }))
    .filter((g) => g.subjects.length);
  const sections = [
    { name: "Lập trình", category: "coding" },
    { name: "Robotics", category: "robotics" },
  ];
  return (
    <div className="space-y-6">
      {editor && (
        <SubjectGroupEditor
          group={editor}
          catalog={catalog}
          onSave={onSaveGroup}
          onClose={() => setEditor(null)}
        />
      )}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900">
        <div>
          <h2 className="text-lg font-black">Thư viện mẫu nội dung</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Chọn học phần để chuẩn bị mẫu từng buổi hoặc tổng kết cuối khóa.
          </p>
        </div>
        <label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-3 sm:w-72 dark:border-slate-700">
          <Search size={17} className="shrink-0 text-slate-400" />
          <input
            aria-label="Tìm học phần"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bộ môn, mã học phần…"
            className="min-w-0 w-full bg-transparent py-3 text-sm outline-none"
          />
        </label>
      </div>
      {sections.map((section) => {
        const visible = groups.filter((g) => g.category === section.category);
        if (!visible.length) return null;
        return (
          <section key={section.category} className="space-y-4">
            <h2 className="text-lg font-black">
              {section.name}{" "}
              <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                {visible.reduce((n, g) => n + g.subjects.length, 0)} học phần
              </span>
            </h2>
            {visible.map((group) => (
              <section
                key={group.id}
                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold">{group.name}</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setEditor(catalog.find((g) => g.id === group.id))
                    }
                    className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Settings2 size={16} />
                    Quản lý học phần
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.subjects.map((subject) => (
                    <article
                      key={subject.id}
                      className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="mb-4 flex items-start gap-3">
                        <span className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                          <BookOpen size={21} />
                        </span>
                        <div className="min-w-0">
                          <h4 className="break-words text-lg font-black">
                            {subject.code}
                          </h4>
                          <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
                            {subject.name || group.name}
                          </p>
                        </div>
                      </div>
                      <div className="mt-auto space-y-2">
                        <button
                          type="button"
                          onClick={() => onSessions(subject.id)}
                          className="flex min-h-14 w-full items-center justify-between gap-2 rounded-xl bg-brand-50 px-3 py-3 text-left text-brand-700 hover:bg-brand-100 focus-visible:outline-2 dark:bg-brand-950 dark:text-brand-300"
                        >
                          <span>
                            <span className="block text-sm font-bold">
                              Mẫu từng buổi
                            </span>
                            <span className="block text-xs opacity-80">
                              Nội dung buổi 1–13
                            </span>
                          </span>
                          <BookOpen size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onFinal(subject.id)}
                          className="flex min-h-14 w-full items-center justify-between gap-2 rounded-xl bg-slate-100 px-3 py-3 text-left hover:bg-slate-200 focus-visible:outline-2 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                          <span>
                            <span className="block text-sm font-bold">
                              Mẫu cuối khóa
                            </span>
                            <span
                              className={`block text-xs ${templates[subject.id] ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}
                            >
                              {templates[subject.id]
                                ? "Đã có mẫu · Mở chỉnh sửa"
                                : "Chưa có mẫu · Thêm nội dung"}
                            </span>
                          </span>
                          <FileText size={18} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </section>
        );
      })}
      {!groups.length && (
        <div
          role="status"
          className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700"
        >
          <p>Không tìm thấy học phần phù hợp.</p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-3 min-h-11 px-4 font-bold text-brand-600 dark:text-brand-400"
          >
            Xóa tìm kiếm
          </button>
        </div>
      )}
    </div>
  );
}
