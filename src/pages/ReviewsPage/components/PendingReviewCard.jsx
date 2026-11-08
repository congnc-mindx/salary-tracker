import { BookOpen, Clock, FileText, Pencil } from "lucide-react";
import { getCourseTitle } from "../../../utils/courseDisplay";
import { formatDateVN } from "../../../utils/date";
import Button from "../../../components/common/Button";

export default function PendingReviewCard({
  item,
  saved,
  content,
  loading,
  error,
  subjectName,
  busy,
  message,
  onComplete,
  onOpen,
  disabled,
}) {
  const { course, session } = item;
  const draft = Boolean(saved?.content || saved?.comments);
  return (
    <article className="flex h-[290px] min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            title={getCourseTitle(course)}
            className="truncate text-lg font-black"
          >
            {getCourseTitle(course)}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {formatDateVN(session.date)} · {session.startTime}–{session.endTime}
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-brand-50 px-2.5 py-1 text-sm font-black text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          Buổi {session.sessionNo}/{course.totalSessions || 14}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
        <span
          className={
            "inline-flex items-center gap-1 rounded-full px-2 py-1 " +
            (item.inProgress
              ? "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")
          }
        >
          <Clock size={12} />
          {item.inProgress ? "Đang học" : "Chờ lấy nhận xét"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {draft ? <FileText size={12} /> : <BookOpen size={12} />}{" "}
          {draft ? "Đã lưu nháp" : content ? "Có mẫu" : "Chưa có mẫu"}
        </span>
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-hidden">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {draft ? "Bản nháp của buổi học" : "Nội dung buổi học"}
        </p>
        <p
          className="line-clamp-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300"
          role={error ? "alert" : undefined}
        >
          {!course.subject
            ? "Chọn học phần trong Sửa lớp để liên kết đúng mẫu."
            : loading && !draft
              ? "Đang tải mẫu…"
              : error && !draft
                ? error
                : content ||
                  "Chưa có mẫu " +
                    subjectName +
                    ". Bạn có thể soạn trực tiếp cho buổi này."}
        </p>
      </div>
      {message && (
        <p role="alert" className="my-1 text-xs text-red-600 dark:text-red-300">
          {message}
        </p>
      )}
      <div className="mt-3 flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <Button
          variant="primary"
          onClick={onOpen}
          disabled={disabled}
          className="px-3"
        >
          <Pencil size={15} />
          {draft ? "Mở bản nháp" : "Soạn nhận xét"}
        </Button>
        <label
          className="flex min-h-11 cursor-pointer items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
          title="Đánh dấu khi đã lấy nhận xét; không xóa bản đã lưu"
        >
          <input
            aria-label={
              "Hoàn thành " +
              getCourseTitle(course) +
              " buổi " +
              session.sessionNo
            }
            type="checkbox"
            checked={false}
            disabled={busy}
            onChange={onComplete}
            className="h-4 w-4 accent-blue-600"
          />
          <span>Hoàn thành</span>
        </label>
      </div>
    </article>
  );
}
