import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  weekdayLabels,
  nativeWeekdayToMondayIndex,
  addHoursToTime,
  formatDateVN,
  parseDate,
} from "../../utils/date";

function normalizeCampus(value) {
  return (value || "").trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
}

function getSessionTime(session, course, end = false) {
  const date = parseDate(session.date);
  const [hour, minute] = (session.startTime || course.startTime)
    .split(":")
    .map(Number);

  date.setHours(hour, minute, 0, 0);

  // Mỗi buổi lớp học hiện tại dài 2 tiếng.
  if (end) date.setHours(date.getHours() + 2);

  return date.getTime();
}

function getCourseInfo(course, sessions, skippedHolidays, now) {
  const schedule = sessions
    .filter((item) => item.courseId === course.id)
    .sort((a, b) => a.sessionNo - b.sessionNo);

  const total = Number(course.totalSessions) || 14;

  const completedCount = schedule.filter(
    (item) =>
      item.status === "confirmed" && getSessionTime(item, course, true) <= now,
  ).length;

  const nextSession = schedule.find(
    (item) =>
      item.status !== "cancelled" && getSessionTime(item, course, true) > now,
  );

  const completed = completedCount >= total;

  const firstSession = schedule[0];

  const upcoming = Boolean(
    !completed && firstSession && getSessionTime(firstSession, course) > now,
  );

  const status = completed ? "completed" : upcoming ? "upcoming" : "active";

  return {
    course,
    total,
    completedCount,
    nextSession,
    status,
    campusKey: normalizeCampus(course.campus),
    checkpoint: [5, 9].includes(nextSession?.sessionNo),
    finalSession: nextSession?.sessionNo === total,
    cancelledCount: schedule.filter((item) => item.status === "cancelled")
      .length,
    holidayCount: skippedHolidays.filter((item) => item.courseId === course.id)
      .length,
  };
}

const statusLabels = {
  completed: "Đã hoàn thành",
  upcoming: "Sắp khai giảng",
  active: "Đang học",
};

const statusColors = {
  completed:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  upcoming: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  active: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

function getProgressColor(completedCount, totalSessions) {
  if (completedCount >= totalSessions) {
    return "bg-emerald-500 dark:bg-emerald-400";
  }

  if (completedCount >= 10) {
    return "bg-rose-500 dark:bg-rose-400";
  }

  if (completedCount >= 6) {
    return "bg-amber-500 dark:bg-amber-400";
  }

  return "bg-violet-500 dark:bg-violet-400";
}

function getMilestoneColor(sessionNo) {
  if (sessionNo === 5) {
    return "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300";
  }

  if (sessionNo === 9) {
    return "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300";
  }

  return "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";
}

export default function ClassesPage({
  courses,
  sessions,
  skippedHolidays,
  openAddCourse,
  openEditCourse,
  deleteCourse,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [campusFilter, setCampusFilter] = useState("all");
  const [milestoneFilter, setMilestoneFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const items = courses.map((course) =>
    getCourseInfo(course, sessions, skippedHolidays, now),
  );

  const campusMap = new Map();

  courses.forEach((course) => {
    const key = normalizeCampus(course.campus);

    if (key && !campusMap.has(key)) {
      campusMap.set(key, course.campus.trim().replace(/\s+/g, " "));
    }
  });

  const campuses = [...campusMap.entries()].sort((a, b) =>
    a[1].localeCompare(b[1], "vi"),
  );

  const completedCount = items.filter(
    (item) => item.status === "completed",
  ).length;

  const query = search.trim().toLocaleLowerCase("vi");

  const visibleItems = items.filter((item) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "checkpoint"
        ? item.status === "active" && item.checkpoint
        : item.status === statusFilter);

    const matchesCampus =
      campusFilter === "all" || campusFilter === item.campusKey;

    const matchesMilestone =
      milestoneFilter === "all" ||
      item.nextSession?.sessionNo === Number(milestoneFilter);

    const matchesSearch = (item.course.code || "")
      .toLocaleLowerCase("vi")
      .includes(query);

    return matchesStatus && matchesCampus && matchesMilestone && matchesSearch;
  });

  // Lớp có buổi học gần nhất được đưa lên trước.
  visibleItems.sort((a, b) => {
    const aTime = a.nextSession
      ? getSessionTime(a.nextSession, a.course)
      : Infinity;

    const bTime = b.nextSession
      ? getSessionTime(b.nextSession, b.course)
      : Infinity;

    if (aTime !== bTime) return aTime < bTime ? -1 : 1;

    return a.course.code.localeCompare(b.course.code, "vi");
  });

  const fieldClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 " +
    "text-sm text-slate-900 outline-none focus:border-blue-500 " +
    "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

  function changeStatus(value) {
    setStatusFilter(value);
    setMilestoneFilter("all");
  }

  function resetFilters() {
    setStatusFilter("all");
    setCampusFilter("all");
    setMilestoneFilter("all");
    setSearch("");
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Lớp học của tôi</h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {courses.length} lớp
            {" · "}
            {completedCount} lớp đã hoàn thành
          </p>
        </div>

        <button
          type="button"
          onClick={openAddCourse}
          className="flex shrink-0 items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white"
        >
          <Plus size={18} />
          Thêm lớp
        </button>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2">
            <span className="text-sm font-bold">Tìm mã lớp</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nhập mã lớp…"
              className={fieldClass}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold">Trạng thái</span>
            <select
              value={statusFilter}
              onChange={(event) => changeStatus(event.target.value)}
              className={fieldClass}
            >
              <option value="all">Tất cả lớp</option>
              <option value="upcoming">Sắp khai giảng</option>
              <option value="checkpoint">Sắp kiểm tra</option>
              <option value="completed">Đã hoàn thành</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold">Cơ sở</span>
            <select
              value={campusFilter}
              onChange={(event) => setCampusFilter(event.target.value)}
              className={fieldClass}
            >
              <option value="all">Tất cả cơ sở</option>

              {campuses.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold">Buổi tiếp theo</span>
            <select
              value={milestoneFilter}
              onChange={(event) => setMilestoneFilter(event.target.value)}
              disabled={statusFilter === "completed"}
              className={`${fieldClass} disabled:opacity-50`}
            >
              <option value="all">Tất cả buổi</option>
              <option value="5">Buổi 5</option>
              <option value="9">Buổi 9</option>
              <option value="14">Buổi 14</option>
            </select>
          </label>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hiển thị {visibleItems.length} lớp
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-bold text-blue-600 dark:text-blue-400"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => {
          const { course, nextSession } = item;

          return (
            <article
              key={course.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="break-words text-3xl font-black text-blue-700 dark:text-blue-400">
                    {course.code}
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {course.campus?.trim() || "Chưa cập nhật cơ sở"}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => openEditCourse(course)}
                    aria-label={`Sửa lớp ${course.code}`}
                    className="rounded-full bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteCourse(course.id)}
                    aria-label={`Xóa lớp ${course.code}`}
                    className="rounded-full bg-red-50 p-2 text-red-600 dark:bg-red-950 dark:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${statusColors[item.status]}`}
                >
                  {statusLabels[item.status]}
                </span>

                {item.checkpoint && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${getMilestoneColor(
                      nextSession?.sessionNo,
                    )}`}
                  >
                    Checkpoint buổi {nextSession.sessionNo}
                  </span>
                )}

                {item.finalSession && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${getMilestoneColor(14)}`}
                  >
                    Sắp tới buổi {item.total}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {weekdayLabels[nativeWeekdayToMondayIndex(course.weekday)]}
                {" · "}
                {course.startTime} – {addHoursToTime(course.startTime, 2)}
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Khai giảng: {formatDateVN(course.startDate)}
              </p>

              <div className="mt-4">
                <p className="mb-2 text-sm font-bold">
                  Đã học {item.completedCount}/{item.total} buổi
                </p>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${getProgressColor(
                      item.completedCount,
                      item.total,
                    )}`}
                    style={{
                      width: `${Math.min(
                        100,
                        (item.completedCount / item.total) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {nextSession && (
                <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Buổi {nextSession.sessionNo}
                  {" · "}
                  {formatDateVN(nextSession.date)}
                  {" · "}
                  {nextSession.startTime || course.startTime}
                </p>
              )}

              {(item.cancelledCount > 0 || item.holidayCount > 0) && (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {item.cancelledCount} buổi hủy
                  {" · "}
                  {item.holidayCount} ngày nghỉ theo lịch
                </p>
              )}
            </article>
          );
        })}
      </div>

      {visibleItems.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          {courses.length === 0
            ? "Chưa có lớp nào. Thêm lớp để bắt đầu."
            : "Không có lớp phù hợp với bộ lọc hiện tại."}
        </div>
      )}
    </section>
  );
}
