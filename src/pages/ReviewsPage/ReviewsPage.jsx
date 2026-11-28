import {notify} from "../../components/common/feedback";
import Button from "../../components/common/Button";
import useNow from "../../hooks/useNow";
import { useSubjectCatalog } from "./SubjectCatalogContext";
import { subjectLabel } from "./subjectCatalog";
import TemplateGroups from "./components/TemplateGroups";
import SessionReviewsPanel from "./components/SessionReviewsPanel";
import { useState } from "react";
import { toISO, formatDateVN } from "../../utils/date";
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
  const [showCompletedFinal,setShowCompletedFinal]=useState(false);
  const [completionError, setCompletionError] = useState("");
  async function completeFinal(course, completed) {
    if (completionBusy) return;
    setCompletionBusy(true);
    setCompletionError("");
    try {
      if (await onSaveCourse({ finalReviewCompleted: completed, finalReviewCompletedAt: completed ? Date.now() : null }, course.id)) {
        notify(completed ? `Đã hoàn thành · ${getCourseTitle(course)}` : "Đã hoàn tác", completed ? {action:async()=>{if(!await onSaveCourse({finalReviewCompleted:false,finalReviewCompletedAt:null},course.id))throw new Error();}} : {});
      } else setCompletionError("Chưa cập nhật được. Hãy thử lại.");
    } catch {
      setCompletionError("Chưa cập nhật được. Hãy thử lại.");
    } finally {
      setCompletionBusy(false);
    }
  }
  const [tab, setTab] = useState("sessions");
  const [editor, setEditor] = useState(null);
  const today = toISO(new Date(useNow()));
  const ready = courses.filter((course) =>
    showCompletedFinal ? course.finalReviewCompleted : isFinalReviewPending(course, sessions, today),
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
      {tab !== "templates" && <p className="text-sm text-slate-500 dark:text-slate-400">
        {tab === "courses"
          ? "Hiện lớp đến buổi cuối hoặc đã lưu nháp. Nhấn Hoàn thành sau khi lấy nhận xét để ẩn khỏi danh sách chờ."
          : tab === "sessions"
            ? "Nhận xét buổi 1–13 mở từ giờ bắt đầu để bạn soạn trước và lưu nháp. Chưa nhấn Hoàn thành thì buổi vẫn ở đây; buổi 14 dùng mục Cuối khóa."
            : ""}
      </p>}
      {tab === "sessions" && (
        <SessionReviewsPanel
          userId={userId}
          courses={courses}
          sessions={sessions}
          onSaveTemplate={onSaveSessionTemplate}
          onComplete={onCompleteSessionReview}
          onSave={onSaveSessionReview}
        />
      )}
      {tab === "templates" && <TemplateGroups
        userId={userId} templates={templates}
        onSaveSessionTemplate={onSaveSessionTemplate}
        onSaveGroup={onSaveSubjectGroup}
        onFinal={(subject, field) => setEditor({ subject, field })}
      />}
      {tab === "courses" && completionError && <p role="alert" className="text-sm text-red-500">{completionError}</p>}
      {tab === "courses" && <div className="flex gap-2"><Button variant={!showCompletedFinal?"primary":"secondary"} onClick={()=>setShowCompletedFinal(false)}>Chờ nhận xét</Button><Button variant={showCompletedFinal?"primary":"secondary"} onClick={()=>setShowCompletedFinal(true)}>Đã hoàn thành</Button></div>}
      {tab === "courses" && (
        <div className="grid gap-4 md:grid-cols-3">
          {ready.map((course) => (
            <article
              key={course.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 text-lg font-bold">{getCourseTitle(course)}</h2>

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
              <div className="flex flex-wrap items-center gap-2">
              <button
                className={button}
                type="button"
                onClick={() => setEditor({ course })}
              >
                Soạn nhận xét
              </button>
              {!showCompletedFinal && <Button variant="successOutline" disabled={completionBusy} onClick={() => completeFinal(course, true)}>Hoàn thành</Button>}
              </div>
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
              ? `Buổi 14 · ${subjectLabel(editor.subject, catalog)}`
              : `Cuối khóa · ${getCourseTitle(editor.course)}`
          }
          isTemplate={Boolean(editor.subject)}
          field={editor.field}
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
