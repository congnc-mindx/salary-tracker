import { useEffect, useState } from "react";
import { getCourseTitle } from "../../../utils/courseDisplay";
import { buildPendingReviews } from "../pendingReviewsModel";
import PendingSessionCard from "./PendingSessionCard";

export default function SessionReviewsPanel({
  userId,
  courses,
  sessions,
  onSave,
  onComplete,
}) {
  const [now, setNow] = useState(Date.now);
  const [search, setSearch] = useState("");
  const [lastCompleted, setLastCompleted] = useState(null);
  const [undoBusy, setUndoBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  const pending = buildPendingReviews(courses, sessions, now);
  const visible = pending.filter(({ course }) =>
    getCourseTitle(course).toLowerCase().includes(search.toLowerCase().trim()),
  );
  async function complete(courseId, sessionNo, completed) {
    const success = await onComplete(courseId, sessionNo, completed);
    if (success) {
      setLastCompleted({ courseId, sessionNo });
      setError("");
    }
    return success;
  }
  async function undo() {
    if (undoBusy || !lastCompleted) return;
    setUndoBusy(true);
    try {
      if (
        await onComplete(lastCompleted.courseId, lastCompleted.sessionNo, false)
      )
        setLastCompleted(null);
      else setError("Chưa hoàn tác được. Hãy thử lại.");
    } catch {
      setError("Chưa hoàn tác được. Hãy thử lại.");
    } finally {
      setUndoBusy(false);
    }
  }
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black">
          Cần lấy nhận xét · {pending.length} buổi
        </h2>
        <input
          aria-label="Tìm lớp cần nhận xét"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm mã lớp, cơ sở…"
          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm sm:w-72 dark:border-slate-700 dark:bg-slate-900"
        />
      </div>
      {lastCompleted && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
        >
          <span>
            Đã tích hoàn thành buổi {lastCompleted.sessionNo} ·{" "}
            {getCourseTitle(
              courses.find((c) => c.id === lastCompleted.courseId) || {
                code: "Lớp",
              },
            )}
            .
          </span>
          <button
            type="button"
            disabled={undoBusy}
            onClick={undo}
            className="font-bold underline disabled:opacity-40"
          >
            Hoàn tác
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      <div className="grid items-start gap-4 xl:grid-cols-2">
        {visible.map((item) => (
          <PendingSessionCard
            key={`${item.course.id}-${item.session.sessionNo}`}
            userId={userId}
            item={item}
            onSave={onSave}
            onComplete={complete}
          />
        ))}
      </div>
      {!visible.length && (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {pending.length
            ? "Không có lớp khớp tìm kiếm."
            : "Không có buổi học nào đang chờ lấy nhận xét."}
        </p>
      )}
    </section>
  );
}
