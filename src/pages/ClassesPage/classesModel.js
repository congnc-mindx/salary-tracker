import { formatDateVN, parseDate } from "../../utils/date";
import { normalizeCampus } from "../../utils/campuses";
import { getCourseTitle, normalizeSearch } from "../../utils/courseDisplay";

export const COURSE_GROUPS = {
  normal: { order: 0, bar: "bg-brand-500" },
  session5: { order: 1, bar: "bg-violet-500" },
  session9: { order: 2, bar: "bg-amber-500" },
  session14: { order: 3, bar: "bg-rose-500" },
  completed: { order: 4, bar: "bg-emerald-500" },
};

export const STATUS_LABELS = {
  active: "Đang học",
  upcoming: "Sắp khai giảng",
  completed: "Đã hoàn thành",
};

export const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  campus: "all",
  milestone: "all",
};

export function getProgressColor(group) {
  return COURSE_GROUPS[group]?.bar || COURSE_GROUPS.normal.bar;
}

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

function isScheduledSession(session) {
  return !["cancelled", "leave"].includes(session.status);
}

function getCourseGroup(completed, nextSession) {
  if (completed) return "completed";

  const sessionNo = Number(nextSession?.sessionNo);

  return [5, 9, 14].includes(sessionNo) ? `session${sessionNo}` : "normal";
}

export function buildCourseItems(courses, sessions, skippedHolidays, now) {
  const schedules = new Map();
  const holidayCounts = new Map();

  for (const session of sessions) {
    if (!schedules.has(session.courseId)) {
      schedules.set(session.courseId, []);
    }

    schedules.get(session.courseId).push(session);
  }

  for (const holiday of skippedHolidays) {
    holidayCounts.set(
      holiday.courseId,
      (holidayCounts.get(holiday.courseId) || 0) + 1,
    );
  }

  return courses.map((course) => {
    const schedule = (schedules.get(course.id) || []).sort(
      (a, b) => a.sessionNo - b.sessionNo,
    );

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
            isScheduledSession(session) &&
            getSessionTime(session, course, true) > now,
        );

    const firstSession = schedule.find(isScheduledSession);

    const upcoming = Boolean(
      !completed && firstSession && getSessionTime(firstSession, course) > now,
    );

    const status = completed ? "completed" : upcoming ? "upcoming" : "active";

    const title = getCourseTitle(course);

    return {
      course,
      title,
      total,
      completedCount,
      nextSession,
      status,
      group: getCourseGroup(completed, nextSession),
      campusKey: normalizeCampus(course.campus),
      holidayCount: holidayCounts.get(course.id) || 0,

      nextTime: nextSession ? getSessionTime(nextSession, course) : Infinity,

      searchableText: normalizeSearch(
        `${title} ${course.code || ""} ${course.campus || ""}`,
      ),
    };
  });
}

export function buildCampusOptions(courses) {
  const campuses = new Map();

  for (const course of courses) {
    const key = normalizeCampus(course.campus);

    if (key && !campuses.has(key)) {
      campuses.set(key, course.campus.trim().replace(/\s+/g, " "));
    }
  }

  return [...campuses.entries()]
    .sort((a, b) => a[1].localeCompare(b[1], "vi"))
    .map(([value, label]) => ({ value, label }));
}

export function filterAndSortCourses(items, filters) {
  const query = normalizeSearch(filters.search);
  const words = query.split(/\s+/).filter(Boolean);

  return items
    .filter((item) => {
      const matchesStatus =
        filters.status === "all"
          ? item.status !== "completed" || Boolean(query)
          : filters.status === "checkpoint"
            ? ["session5", "session9", "session14"].includes(item.group)
            : item.status === filters.status;

      const matchesCampus =
        filters.campus === "all" || item.campusKey === filters.campus;

      const matchesMilestone =
        filters.milestone === "all" ||
        Number(item.nextSession?.sessionNo) === Number(filters.milestone);

      const matchesSearch = words.every((word) =>
        item.searchableText.includes(word),
      );

      return (
        matchesStatus && matchesCampus && matchesMilestone && matchesSearch
      );
    })
    .sort((a, b) => {
      const groupDifference =
        COURSE_GROUPS[a.group].order - COURSE_GROUPS[b.group].order;

      if (groupDifference !== 0) return groupDifference;

      if (a.nextTime !== b.nextTime) {
        return a.nextTime < b.nextTime ? -1 : 1;
      }

      return a.title.localeCompare(b.title, "vi");
    });
}

export function hasActiveFilters(filters) {
  return Boolean(
    filters.search.trim() ||
    filters.status !== "all" ||
    filters.campus !== "all" ||
    filters.milestone !== "all",
  );
}

export function getNextSessionText(item) {
  if (item.status === "completed") {
    return "Đã hoàn thành khóa học";
  }

  if (!item.nextSession) {
    return "Chưa có buổi học tiếp theo";
  }

  const session = item.nextSession;

  return `Buổi ${session.sessionNo} · ${formatDateVN(session.date)} · ${
    session.startTime || item.course.startTime
  }`;
}
