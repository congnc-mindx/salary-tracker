import { useSubjectCatalog } from "./SubjectCatalogContext";
import { subjectLabel } from "./subjectCatalog";
import TemplateGroups from "./components/TemplateGroups";
import SessionTemplateManager from "./components/SessionTemplateManager";
import SessionReviewsPanel from "./components/SessionReviewsPanel";
import { useEffect, useState } from "react";
import { todayISO, formatDateVN } from "../../utils/date";
import { getCourseTitle } from "../../utils/courseDisplay";
import FinalReviewEditor from "./components/FinalReviewEditor";
import {
  getFinalSession,
  isFinalReviewPending,
  resolveCourseSubject,
} from "./reviewsModel";

export default function ReviewsPage({
  userId,
  onSaveSubjectGroup,
  onSaveSessionTemplate,
  onSaveSessionReview,
  onCompleteSessionReview,
  courses: sourceCourses,
  sessions,
  templates,
  onSaveTemplate,
  onSaveCourse,
}) {
  const catalog = useSubjectCatalog();
  const courses = sourceCourses.map((course) => ({
    ...course,
    subject: resolveCourseSubject(course, catalog),
  }));
  const [completionBusy, setCompletionBusy] = useState(false);
  const [lastCompleted, setLastCompleted] = useState(null);
  const [completionError, setCompletionError] = useState("");
  async function completeFinal(course, completed) {
    if (completionBusy) return;
    setCompletionBusy(true);
    setCompletionError("");
    try {
      if (await onSaveCourse({ finalReviewCompleted: completed, finalReviewCompletedAt: completed ? Date.now() : null }, course.id)) {
        setLastCompleted(completed ? course : null);
      } else setCompletionError("Chưa cập nhật được. Hãy thử lại.");
    } catch {
      setCompletionError("Chưa cập nhật được. Hãy thử lại.");
    } finally {
      setCompletionBusy(false);
    }
  }
  const [tab, setTab] = useState("sessions");
  const [templateSubject, setTemplateSubject] = useState(null);
  const [editor, setEditor] = useState(null);
  const [today, setToday] = useState(todayISO);
  useEffect(() => {
    const refresh = () => setToday(todayISO());
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  const ready = courses.filter((course) =>
    isFinalReviewPending(course, sessions, today),
  );
  const button =
    "rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white";
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap gap-2" aria-label="Nội dung nhận xét">
        {[
          ["sessions", "Theo buổi học"],
          ["courses", "Cuối khóa"],
          ["templates", "Mẫu nội dung"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={tab === key}
            onClick={() => {
              setTab(key);
              setTemplateSubject(null);
            }}
            className={
              tab === key
                ? button
                : "rounded-xl bg-white px-4 py-2 text-sm font-bold dark:bg-slate-800"
            }
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {tab === "courses"
          ? "Hiện lớp đến buổi cuối hoặc đã lưu nháp. Tích Hoàn thành sau khi lấy nhận xét để ẩn khỏi danh sách chờ."
          : tab === "sessions"
            ? "Nhận xét buổi 1–13 mở từ giờ bắt đầu để bạn soạn trước và lưu nháp. Chưa tích Hoàn thành thì buổi vẫn ở đây; buổi 14 dùng mục Cuối khóa."
            : "Nhập nguyên văn nội dung MindX cho từng học phần. Chọn học phần trong form Sửa lớp để liên kết mẫu."}
      </p>
      {tab === "sessions" && (
        <SessionReviewsPanel
          userId={userId}
          courses={courses}
          sessions={sessions}
          onComplete={onCompleteSessionReview}
          onSave={onSaveSessionReview}
        />
      )}
      {tab === "templates" &&
        (templateSubject ? (
          <SessionTemplateManager
            key={templateSubject}
            userId={userId}
            subject={templateSubject}
            onSave={onSaveSessionTemplate}
            onClose={() => setTemplateSubject(null)}
          />
        ) : (
          <TemplateGroups
            templates={templates}
            onSaveGroup={onSaveSubjectGroup}
            onFinal={(subject) => setEditor({ subject })}
            onSessions={setTemplateSubject}
          />
        ))}
      {tab === "courses" && completionError && <p role="alert" className="text-sm text-red-500">{completionError}</p>}
      {tab === "courses" && lastCompleted && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 p-3 text-sm dark:bg-emerald-950">
          <span>Đã hoàn thành · {getCourseTitle(lastCompleted)}</span>
          <button type="button" disabled={completionBusy} onClick={() => completeFinal(lastCompleted, false)} className="font-bold underline">Hoàn tác</button>
        </div>
      )}
      {tab === "courses" && (
        <div className="grid gap-4 md:grid-cols-2">
          {ready.map((course) => (
            <article
              key={course.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 text-lg font-bold">{getCourseTitle(course)}</h2>
                <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-bold">
                  <input type="checkbox" checked={false} disabled={completionBusy} onChange={() => completeFinal(course, true)} className="h-4 w-4 accent-blue-600" />
                  Hoàn thành
                </label>
              </div>
              <p className="my-3 text-sm text-slate-500 dark:text-slate-400">
                {subjectLabel(course.subject, catalog) || "Chưa chọn học phần"} ·{" "}
                {course.finalReview ? "Đã lưu nhận xét" : "Chưa lưu nhận xét"}
              </p>
              {getFinalSession(course, sessions) && (
                <p className="mb-3 text-sm">
                  Buổi cuối:{" "}
                  {formatDateVN(getFinalSession(course, sessions).date)}
                </p>
              )}
              <button
                className={button}
                type="button"
                onClick={() => setEditor({ course })}
              >
                Mở nhận xét
              </button>
            </article>
          ))}
        </div>
      )}
      {tab === "courses" && !ready.length && (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          Không có nhận xét cuối khóa đang chờ. Bạn có thể chuẩn bị trước ở mục Mẫu nội dung.
        </p>
      )}
      {editor && (
        <FinalReviewEditor
          key={editor.subject || editor.course.id}
          title={
            editor.subject
              ? `Mẫu cuối khóa · ${subjectLabel(editor.subject, catalog)}`
              : `Cuối khóa · ${getCourseTitle(editor.course)}`
          }
          isTemplate={Boolean(editor.subject)}
          initialValue={
            editor.subject
              ? templates[editor.subject]
              : editor.course.finalReview || templates[editor.course.subject]
          }
          template={
            editor.course ? templates[editor.course.subject] : undefined
          }
          onClose={() => setEditor(null)}
          onSave={(value) =>
            editor.subject
              ? onSaveTemplate(editor.subject, value)
              : onSaveCourse(
                  {
                    finalReview: {
                      ...value,
                      subject: editor.course.subject || "",
                      savedAt: Date.now(),
                    },
                  },
                  editor.course.id,
                )
          }
        />
      )}
    </section>
  );
}
