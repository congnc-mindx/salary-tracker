import { useEffect, useState } from "react";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";

import Field from "../../components/common/Field";
import SelectField from "../../components/common/SelectField";
import ModalShell from "../../components/common/ModalShell";

import {
  weekdayLabels,
  nativeWeekdayToMondayIndex,
  addHoursToTime,
  formatDateVN,
  parseDate,
} from "../../utils/date";

import { normalizeCampus } from "../../utils/campuses";
import { getCourseTitle, normalizeSearch } from "../../utils/courseDisplay";

const groups = [
  {
    key: "normal",
    label: "Lớp học thường",
    dot: "bg-slate-400",
    bar: "bg-brand-500",
  },
  {
    key: "session5",
    label: "Chuẩn bị buổi 5",
    dot: "bg-violet-500",
    bar: "bg-violet-500",
  },
  {
    key: "session9",
    label: "Chuẩn bị buổi 9",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  {
    key: "session14",
    label: "Chuẩn bị buổi 14",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
  {
    key: "completed",
    label: "Đã hoàn thành",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
];

const statusLabels = {
  active: "Đang học",
  upcoming: "Sắp khai giảng",
  completed: "Đã hoàn thành",
};

function getSessionTime(session, course, end = false) {
  const date = parseDate(session.date);
  const time =
    end && session.endTime
      ? session.endTime
      : session.startTime || course.startTime;

  const [hour, minute] = time.split(":").map(Number);

  date.setHours(hour, minute, 0, 0);

  if (end && !session.endTime) {
    date.setHours(date.getHours() + 2);
  }

  return date.getTime();
}

function getCourseInfo(course, sessions, skippedHolidays, now) {
  const schedule = sessions
    .filter((session) => session.courseId === course.id)
    .sort((a, b) => a.sessionNo - b.sessionNo);

  const total = Math.max(1, Number(course.totalSessions) || 14);

  const completedCount = schedule.filter(
    (session) =>
      ["confirmed", "covered"].includes(session.status) &&
      getSessionTime(session, course, true) <= now,
  ).length;

  const completed = completedCount >= total;

  const nextSession = completed
    ? undefined
    : schedule.find(
        (session) =>
          !["cancelled", "leave"].includes(session.status) &&
          getSessionTime(session, course, true) > now,
      );

  const firstSession = schedule.find(
    (session) => !["cancelled", "leave"].includes(session.status),
  );

  const upcoming = Boolean(
    !completed && firstSession && getSessionTime(firstSession, course) > now,
  );

  const status = completed ? "completed" : upcoming ? "upcoming" : "active";

  const sessionNo = Number(nextSession?.sessionNo);

  const group = completed
    ? "completed"
    : sessionNo === 5
      ? "session5"
      : sessionNo === 9
        ? "session9"
        : sessionNo === 14
          ? "session14"
          : "normal";

  return {
    course,
    title: getCourseTitle(course),
    total,
    completedCount,
    nextSession,
    status,
    group,
    campusKey: normalizeCampus(course.campus),
    holidayCount: skippedHolidays.filter(
      (session) => session.courseId === course.id,
    ).length,
  };
}

function getNextSessionText(item) {
  if (item.status === "completed") return "Đã hoàn thành khóa học";
  if (!item.nextSession) return "Chưa có buổi học tiếp theo";

  const session = item.nextSession;

  return `Buổi ${session.sessionNo} · ${formatDateVN(session.date)} · ${
    session.startTime || item.course.startTime
  }`;
}

function CourseProgress({ item, color }) {
  const percent = Math.min(
    100,
    Math.max(0, (item.completedCount / item.total) * 100),
  );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-500 dark:text-slate-400">
          Đã học
        </span>

        <span className="font-bold tabular-nums text-slate-700 dark:text-slate-200">
          {item.completedCount}/{item.total} buổi
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={`Tiến độ lớp ${item.title}`}
        aria-valuemin={0}
        aria-valuemax={item.total}
        aria-valuenow={Math.min(item.completedCount, item.total)}
        className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
      >
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 py-3 text-sm">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>

      <dd className="break-words text-right font-semibold text-slate-900 dark:text-slate-100">
        {children}
      </dd>
    </div>
  );
}

export default function ClassesPage({
  courses = [],
  sessions = [],
  skippedHolidays = [],
  openEditCourse,
  deleteCourse,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [campusFilter, setCampusFilter] = useState("all");
  const [milestoneFilter, setMilestoneFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    function refresh() {
      setNow(Date.now());
    }

    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
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

  const query = normalizeSearch(search);
  const words = query.split(/\s+/).filter(Boolean);

  const visibleItems = items
    .filter((item) => {
      const matchesStatus =
        statusFilter === "all"
          ? item.status !== "completed" || Boolean(query)
          : statusFilter === "checkpoint"
            ? ["session5", "session9", "session14"].includes(item.group)
            : item.status === statusFilter;

      const matchesCampus =
        campusFilter === "all" || item.campusKey === campusFilter;

      const matchesMilestone =
        milestoneFilter === "all" ||
        Number(item.nextSession?.sessionNo) === Number(milestoneFilter);

      const searchableText = normalizeSearch(
        `${item.title} ${item.course.code} ${item.course.campus || ""}`,
      );

      const matchesSearch = words.every((word) =>
        searchableText.includes(word),
      );

      return (
        matchesStatus && matchesCampus && matchesMilestone && matchesSearch
      );
    })
    .sort((a, b) => {
      const aTime = a.nextSession
        ? getSessionTime(a.nextSession, a.course)
        : Infinity;

      const bTime = b.nextSession
        ? getSessionTime(b.nextSession, b.course)
        : Infinity;

      if (aTime !== bTime) return aTime < bTime ? -1 : 1;

      return a.title.localeCompare(b.title, "vi");
    });

  const orderedItems = groups.flatMap((group) =>
    visibleItems.filter((item) => item.group === group.key),
  );
  const selectedItem = items.find((item) => item.course.id === selectedId);

  const hasFilters = Boolean(
    search.trim() ||
    statusFilter !== "all" ||
    campusFilter !== "all" ||
    milestoneFilter !== "all",
  );

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

  function editSelected() {
    if (!selectedItem) return;

    setSelectedId(null);
    openEditCourse(selectedItem.course);
  }

  return (
    <section>
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field
            label="Tìm kiếm"
            type="search"
            value={search}
            onChange={setSearch}
            placeholder="Mã lớp, cơ sở..."
          />

          <SelectField
            label="Trạng thái"
            value={statusFilter}
            onChange={changeStatus}
            options={[
              { value: "all", label: "Mặc định" },
              { value: "active", label: "Đang học" },
              { value: "upcoming", label: "Sắp khai giảng" },
              { value: "checkpoint", label: "Sắp tới buổi 5, 9, 14" },
              { value: "completed", label: "Đã hoàn thành" },
            ]}
          />

          <SelectField
            label="Cơ sở"
            value={campusFilter}
            onChange={setCampusFilter}
            options={[
              { value: "all", label: "Tất cả cơ sở" },
              ...campuses.map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />

          <SelectField
            label="Buổi tiếp theo"
            value={milestoneFilter}
            onChange={setMilestoneFilter}
            disabled={statusFilter === "completed"}
            options={[
              { value: "all", label: "Tất cả buổi" },
              { value: "5", label: "Buổi 5" },
              { value: "9", label: "Buổi 9" },
              { value: "14", label: "Buổi 14" },
            ]}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p
            role="status"
            className="text-sm text-slate-500 dark:text-slate-400"
          >
            Hiển thị {visibleItems.length} lớp
            {statusFilter === "all" && !query
              ? " · Đang ẩn lớp đã hoàn thành"
              : ""}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-3">
        {orderedItems.map((item) => {
          const group = groups.find((entry) => entry.key === item.group);

          return (
            <button
              key={item.course.id}
              type="button"
              onClick={() => setSelectedId(item.course.id)}
              aria-label={`Xem chi tiết lớp ${item.title}`}
              aria-haspopup="dialog"
              className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition-colors hover:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-400"
            >
              <div className="mb-3 flex w-full items-center justify-between gap-2">
                <span className="min-w-0 break-words text-lg font-black leading-tight text-brand-700 dark:text-brand-400">
                  {item.title}
                </span>

                <ChevronRight
                  size={17}
                  aria-hidden="true"
                  className="shrink-0 text-slate-400"
                />
              </div>

              {item.status === "upcoming" && (
                <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Sắp khai giảng
                </p>
              )}

              <div className="mt-auto w-full">
                <CourseProgress
                  item={item}
                  color={group?.bar || "bg-brand-500"}
                />

                <p className="mt-2.5 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                  {getNextSessionText(item)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {visibleItems.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          {courses.length === 0
            ? "Chưa có lớp nào. Thêm lớp để bắt đầu."
            : !hasFilters
              ? "Không có lớp đang triển khai. Chọn “Đã hoàn thành” để xem các lớp cũ."
              : "Không tìm thấy lớp phù hợp với bộ lọc."}
        </div>
      )}

      {selectedItem && (
        <ModalShell
          title={selectedItem.title}
          description={statusLabels[selectedItem.status]}
          onClose={() => setSelectedId(null)}
        >
          <dl className="divide-y divide-slate-200 dark:divide-slate-800">
            <DetailRow label="Mã lớp">{selectedItem.course.code}</DetailRow>

            <DetailRow label="Cơ sở">
              {selectedItem.course.campus || "Chưa cập nhật"}
            </DetailRow>

            <DetailRow label="Khai giảng">
              {formatDateVN(selectedItem.course.startDate)}
            </DetailRow>

            <DetailRow label="Lịch cố định">
              {
                weekdayLabels[
                  nativeWeekdayToMondayIndex(selectedItem.course.weekday)
                ]
              }
              {" · "}
              {selectedItem.course.startTime}
              {" – "}
              {addHoursToTime(selectedItem.course.startTime, 2)}
            </DetailRow>

            <DetailRow label="Buổi tiếp theo">
              {getNextSessionText(selectedItem)}
            </DetailRow>

            {selectedItem.holidayCount > 0 && (
              <DetailRow label="Lịch nghỉ">
                {selectedItem.holidayCount} lượt nghỉ theo lịch
              </DetailRow>
            )}
          </dl>

          <div className="mt-5">
            <CourseProgress
              item={selectedItem}
              color={
                groups.find((group) => group.key === selectedItem.group).bar
              }
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => deleteCourse(selectedItem.course.id)}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
            >
              <Trash2 size={17} />
              Xóa lớp
            </button>

            <button
              type="button"
              onClick={editSelected}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-bold text-white hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              <Pencil size={17} />
              Sửa lớp
            </button>
          </div>
        </ModalShell>
      )}
    </section>
  );
}
