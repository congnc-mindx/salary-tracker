import { useState } from "react";
import { getCourseTitle } from "../../../utils/courseDisplay";
import { formatDateVN } from "../../../utils/date";
import useSessionTemplates from "../../../hooks/useSessionTemplates";
import SessionReviewEditor from "./SessionReviewEditor";

export default function PendingSessionCard({
  userId,
  item,
  onSave,
  onComplete,
}) {
  const { course, session } = item;
  const { templates, loading, error } = useSessionTemplates(
    userId,
    course.subject,
  );
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const saved = course.sessionReviews?.[session.sessionNo];
  const template = templates[session.sessionNo];
  const content = saved?.content ?? template?.content;
  async function complete() {
    if (busy) return;
    setBusy(true);
    try {
      if (!(await onComplete(course.id, session.sessionNo, true)))
        setMessage("Chưa đánh dấu được. Hãy thử lại.");
    } catch {
      setMessage("Chưa đánh dấu được. Hãy thử lại.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">{getCourseTitle(course)}</h2>
          <p className="mt-1 text-sm font-bold text-brand-600 dark:text-brand-400">
            Buổi {session.sessionNo}/{course.totalSessions || 14} ·{" "}
            {formatDateVN(session.date)} · {session.startTime}–{session.endTime}
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            checked={false}
            disabled={busy}
            onChange={complete}
            className="h-4 w-4 accent-blue-600"
          />
          Hoàn thành
        </label>
      </div>
      <div className="my-4 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950">
        {!course.subject ? (
          <p>Chưa chọn học phần. Vào Sửa lớp để liên kết đúng mẫu.</p>
        ) : loading && !saved?.content ? (
          <p role="status">Đang lấy mẫu buổi {session.sessionNo}…</p>
        ) : error && !saved?.content ? (
          <p role="alert">{error}</p>
        ) : content ? (
          <>
            <p className="mb-2 font-bold">Nội dung buổi học</p>
            <p className="whitespace-pre-wrap break-words leading-relaxed">
              {content}
            </p>
          </>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">
            Chưa có mẫu {course.subject} · Buổi {session.sessionNo}. Bạn có thể
            nhập trong Mẫu nội dung hoặc soạn trực tiếp.
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={
          !course.subject || (!saved?.content && (loading || Boolean(error)))
        }
        onClick={() => setOpen(true)}
        className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
      >
        Mở nhận xét buổi {session.sessionNo}
      </button>
      {message && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-300">
          {message}
        </p>
      )}
      {open && (
        <SessionReviewEditor
          title={getCourseTitle(course)}
          subject={course.subject}
          sessionNo={session.sessionNo}
          total={course.totalSessions || 14}
          saved={saved}
          template={template}
          onClose={() => setOpen(false)}
          onSave={(value) =>
            onSave(course.id, session.sessionNo, {
              ...value,
              date: session.date,
            })
          }
        />
      )}
    </article>
  );
}
