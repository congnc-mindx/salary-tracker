import TemplateGroups from "./components/TemplateGroups";
import SessionTemplateManager from "./components/SessionTemplateManager";
import SessionReviewsPanel from "./components/SessionReviewsPanel";
import { useEffect, useState } from "react";
import { todayISO, formatDateVN } from "../../utils/date";
import { getCourseTitle } from "../../utils/courseDisplay";
import FinalReviewEditor from "./components/FinalReviewEditor";
import { getFinalSession, isFinalReviewAvailable } from "./reviewsModel";

export default function ReviewsPage({
  userId,
  onSaveSessionTemplate,
  onSaveSessionReview,
  onCompleteSessionReview,
  courses,
  sessions,
  templates,
  onSaveTemplate,
  onSaveCourse,
}) {
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
    isFinalReviewAvailable(course, sessions, today),
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
          ? "Chỉ hiện lớp đã đến ngày buổi cuối theo lịch thực tế, hoặc lớp đã lưu nhận xét cuối khóa. Không phụ thuộc tháng đang xem."
          : tab === "sessions"
            ? "Các buổi đã kết thúc sẽ nằm ở đây đến khi bạn tích Hoàn thành. Lớp đã kết thúc toàn bộ khóa học được ẩn."
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
            onFinal={(subject) => setEditor({ subject })}
            onSessions={setTemplateSubject}
          />
        ))}
      {tab === "courses" && (
        <div className="grid gap-4 md:grid-cols-2">
          {ready.map((course) => (
            <article
              key={course.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
            >
              <h2 className="text-lg font-bold">{getCourseTitle(course)}</h2>
              <p className="my-3 text-sm text-slate-500 dark:text-slate-400">
                {course.subject || "Chưa chọn học phần"} ·{" "}
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
          Chưa có lớp đến buổi cuối. Bạn có thể chuẩn bị trước ở mục Mẫu nội
          dung.
        </p>
      )}
      {editor && (
        <FinalReviewEditor
          key={editor.subject || editor.course.id}
          title={
            editor.subject
              ? `Mẫu cuối khóa · ${editor.subject}`
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
