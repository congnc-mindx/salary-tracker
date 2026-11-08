import { useSubjectCatalog } from "../SubjectCatalogContext";
import { subjectLabel } from "../subjectCatalog";
import { useState } from "react";
import useSessionTemplates from "../../../hooks/useSessionTemplates";
import SessionReviewEditor from "./SessionReviewEditor";

export default function SessionTemplateManager({
  userId,
  subject,
  onSave,
  onClose,
}) {
  const catalog = useSubjectCatalog();
  const { templates, loading, error } = useSessionTemplates(userId, subject);
  const [sessionNo, setSessionNo] = useState(null);
  return (
    <section className="space-y-4">
      <button
        type="button"
        className="text-sm font-bold text-brand-600 dark:text-brand-400"
        onClick={onClose}
      >
        ← Các học phần
      </button>
      <h2 className="text-xl font-black">
        {subjectLabel(subject, catalog)} · Mẫu từng buổi
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Chỉ lưu nội dung bài học và bài tập. Nhận xét học sinh được nhập riêng
        theo lớp. Buổi 14 sử dụng mẫu cuối khóa.
      </p>
      {loading ? (
        <p role="status">Đang tải mẫu…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <div className="space-y-4">
          <p
            role="status"
            className="text-sm font-bold text-slate-600 dark:text-slate-300"
          >
            {
              Array.from({ length: 13 }, (_, i) => i + 1).filter((no) =>
                templates[no]?.content?.trim(),
              ).length
            }
            /13 buổi đã có nội dung
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 13 }, (_, i) => i + 1).map((no) => (
              <button
                key={no}
                type="button"
                onClick={() => setSessionNo(no)}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-lg font-black">
                    Buổi {no.toString().padStart(2, "0")}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${templates[no]?.content?.trim() ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}
                  >
                    {templates[no]?.content?.trim()
                      ? "Có nội dung"
                      : "Chưa soạn"}
                  </span>
                </span>
                <span className="mt-3 line-clamp-3 min-h-16 whitespace-pre-line break-words text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {templates[no]?.content?.trim() ||
                    "Thêm nội dung bài học để dùng lại khi soạn nhận xét cho lớp."}
                </span>
                <span className="mt-4 block border-t border-slate-200 pt-3 text-sm font-bold text-brand-600 dark:border-slate-700 dark:text-brand-400">
                  {templates[no]?.content?.trim()
                    ? "Chỉnh sửa mẫu →"
                    : "Soạn mẫu →"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {sessionNo && (
        <SessionReviewEditor
          key={sessionNo}
          title={`Mẫu ${subjectLabel(subject, catalog)}`}
          subject={subject}
          sessionNo={sessionNo}
          isTemplate
          template={templates[sessionNo]}
          onClose={() => setSessionNo(null)}
          onSave={(value) =>
            onSave(subject, sessionNo, {
              content: value.content,
              homework: value.homework,
            })
          }
        />
      )}
    </section>
  );
}
