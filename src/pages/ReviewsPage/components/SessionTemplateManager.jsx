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
      <h2 className="text-xl font-black">{subjectLabel(subject, catalog)} · Mẫu từng buổi</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Chỉ lưu nội dung bài học và bài tập. Nhận xét học sinh được nhập riêng
        theo lớp. Buổi 14 sử dụng mẫu cuối khóa.
      </p>
      {loading ? (
        <p role="status">Đang tải mẫu…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 13 }, (_, i) => i + 1).map((no) => (
            <button
              key={no}
              type="button"
              onClick={() => setSessionNo(no)}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            >
              <span className="block font-bold">Buổi {no}</span>
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                {templates[no] ? "Đã có mẫu" : "Chưa nhập mẫu"}
              </span>
            </button>
          ))}
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
