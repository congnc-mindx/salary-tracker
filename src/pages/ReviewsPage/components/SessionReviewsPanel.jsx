import { useState } from "react";
import { getCourseTitle } from "../../../utils/courseDisplay";
import { formatDateVN } from "../../../utils/date";
import useSessionTemplates from "../../../hooks/useSessionTemplates";
import { getSuggestedSession } from "../sessionReviewsModel";
import SessionReviewEditor from "./SessionReviewEditor";

export default function SessionReviewsPanel({
  userId,
  courses,
  sessions,
  today,
  onSave,
}) {
  const [selectedId, setSelectedId] = useState("");
  const [editorNo, setEditorNo] = useState(null);
  const [showOld, setShowOld] = useState(false);
  const [search, setSearch] = useState("");
  const visibleCourses = courses.filter((course) => {
    const schedule = sessions.filter((s) => s.courseId === course.id);
    const last = schedule.reduce(
      (date, s) => (s.date > date ? s.date : date),
      "",
    );
    return (
      (showOld ||
        (editorNo !== null && course.id === selectedId) ||
        last >= today ||
        Object.values(course.sessionReviews || {}).some(
          (r) => r.status !== "sent",
        )) &&
      getCourseTitle(course).toLowerCase().includes(search.toLowerCase())
    );
  });
  const course =
    visibleCourses.find((c) => c.id === selectedId) || visibleCourses[0];
  const schedule = course
    ? sessions
        .filter((s) => s.courseId === course.id)
        .sort((a, b) => a.sessionNo - b.sessionNo)
    : [];
  const { templates, loading, error } = useSessionTemplates(
    userId,
    course?.subject,
  );
  const suggested =
    course && getSuggestedSession(schedule, course.sessionReviews, today);
  const currentSession = schedule.find((s) => s.sessionNo === editorNo);
  function openSession(no) {
    setSelectedId(course.id);
    setEditorNo(no);
  }
  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 dark:border-slate-700 dark:bg-slate-900">
        <label className="text-sm font-bold">
          Tìm lớp
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setEditorNo(null);
            }}
            placeholder="Mã lớp hoặc cơ sở…"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent p-3 dark:border-slate-700"
          />
        </label>
        <label className="text-sm font-bold">
          Chọn lớp
          <select
            value={course?.id || ""}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setEditorNo(null);
            }}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
          >
            {!visibleCourses.length && (
              <option value="">Không có lớp phù hợp</option>
            )}
            {visibleCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {getCourseTitle(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={showOld}
            onChange={(e) => {
              setShowOld(e.target.checked);
              setEditorNo(null);
            }}
          />
          Hiện cả lớp cũ đã kết thúc lịch học
        </label>
      </div>
      {course ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">{getCourseTitle(course)}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {course.subject ||
                  "Chưa chọn học phần — vào Sửa lớp để liên kết mẫu."}{" "}
                ·{" "}
                {
                  Object.values(course.sessionReviews || {}).filter(
                    (r) => r.status === "sent",
                  ).length
                }
                /{course.totalSessions || 14} buổi đã gửi
              </p>
            </div>
            {suggested && (
              <button
                type="button"
                disabled={loading || Boolean(error) || !course.subject}
                onClick={() => openSession(suggested.sessionNo)}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                {suggested.date > today ? "Chuẩn bị" : "Nhận xét"} buổi{" "}
                {suggested.sessionNo}
              </button>
            )}
          </div>
          {loading && <p role="status">Đang tải mẫu học phần…</p>}
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-300">
              {error}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {schedule.map((session) => {
              const saved = course.sessionReviews?.[session.sessionNo];
              const blocked = ["cancelled", "leave"].includes(session.status);
              return (
                <button
                  key={session.key || session.sessionNo}
                  type="button"
                  disabled={
                    loading ||
                    Boolean(error) ||
                    !course.subject ||
                    (blocked && !saved)
                  }
                  onClick={() => openSession(session.sessionNo)}
                  className={`rounded-2xl border bg-white p-4 text-left disabled:opacity-50 dark:bg-slate-900 ${suggested?.sessionNo === session.sessionNo ? "border-brand-500" : "border-slate-200 dark:border-slate-700"}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <strong>Buổi {session.sessionNo}</strong>
                    <span
                      className={`text-xs font-bold ${saved?.status === "sent" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}
                    >
                      {saved?.status === "sent"
                        ? "Đã gửi"
                        : saved
                          ? "Bản nháp"
                          : "Chưa soạn"}
                    </span>
                  </span>
                  <span className="mt-2 block text-sm text-slate-500 dark:text-slate-400">
                    {formatDateVN(session.date)} · {session.startTime}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                    {blocked
                      ? "Đã hủy / nghỉ"
                      : session.status === "covered"
                        ? "Có người dạy thay"
                        : session.date > today
                          ? "Chưa đến ngày · có thể soạn trước"
                          : "Đã đến ngày nhận xét"}
                  </span>
                </button>
              );
            })}
          </div>
          {currentSession && (
            <SessionReviewEditor
              key={`${course.id}-${editorNo}`}
              title={getCourseTitle(course)}
              subject={course.subject}
              sessionNo={editorNo}
              total={course.totalSessions || 14}
              saved={course.sessionReviews?.[editorNo]}
              template={templates[editorNo]}
              onClose={() => setEditorNo(null)}
              onSave={(value) =>
                onSave(course.id, editorNo, {
                  ...value,
                  date: currentSession.date,
                })
              }
            />
          )}
        </>
      ) : (
        <p className="p-6 text-center text-sm text-slate-500">
          Không có lớp phù hợp. Bật “Hiện cả lớp cũ” để xem lịch sử.
        </p>
      )}
    </div>
  );
}
