import useNow from "../../hooks/useNow";
import { useMemo } from "react";
import {
  getExtraAmount,
  getExtraRawAmount,
  getTeacherRateForDate,
} from "../../services/income";
import { applyHolidaysToExtras } from "../../utils/holidays";
import { getExtraHours, extraTitle } from "../../utils/extra";
import { buildStatistics } from "./statisticsModel";

export default function useStatistics({
  courses,
  sessions,
  extras,
  holidays,
  settings,
  skippedHolidays,
  selectedMonth,
}) {
  const now = useNow();
  return useMemo(() => {
    const coursesById = new Map(courses.map((course) => [course.id, course]));
    const adjusted = applyHolidaysToExtras(extras, holidays, now);
    const rows = [
      ...sessions.map((item) => ({
        id: item.key,
        groupKey: "class:" + item.courseId,
        type: "class",
        title:
          coursesById.get(item.courseId)?.code || item.courseCode || "Lớp học",
        campus: coursesById.get(item.courseId)?.campus || "",
        date: item.date,
        time: item.startTime,
        sessionNo: item.sessionNo,
        amount: item.amount,
        hours: 2,
        status: item.status,
      })),
      ...adjusted.map((item) => ({
        id: item.id,
        groupKey: [
          item.type,
          item.campus || "",
          item.classCode || extraTitle(item),
        ].join(":"),
        type: item.type,
        title: extraTitle(item),
        campus: item.campus || "",
        date: item.datetime.slice(0, 10),
        time: item.datetime.slice(11, 16),
        amount: getExtraAmount(item, settings),
        hours: getExtraHours(item),
        status: item.status,
      })),
    ];
    const stats = buildStatistics(rows, selectedMonth);
    const unpaid = [
      ...sessions
        .filter(
          (item) =>
            item.status === "covered" && item.date.startsWith(selectedMonth),
        )
        .map((item) => ({
          id: item.key,
          title: item.courseCode,
          date: item.date,
          reason: "Người khác dạy thay",
          amount: getTeacherRateForDate(settings, item.date),
        })),
      ...adjusted
        .filter(
          (item) =>
            item.status === "leave" && item.datetime.startsWith(selectedMonth),
        )
        .map((item) => ({
          id: item.id,
          title: extraTitle(item),
          date: item.datetime.slice(0, 10),
          reason: "Lịch phát sinh nghỉ",
          amount: getExtraRawAmount(item, settings),
        })),
    ];
    const sessionMap = new Map(
      sessions.map((item) => [item.courseId + ":" + item.sessionNo, item]),
    );
    const postponed = new Map();
    for (const item of [...skippedHolidays].sort((a, b) =>
      a.date.localeCompare(b.date),
    )) {
      if (!item.date.startsWith(selectedMonth)) continue;
      const key = item.courseId + ":" + (item.sessionNo ?? item.date);
      const next = sessionMap.get(item.courseId + ":" + item.sessionNo);
      if (next?.status === "cancelled" || postponed.has(key)) continue;
      postponed.set(key, {
        ...item,
        id: key,
        nextDate: next?.date,
        amount: getTeacherRateForDate(settings, item.date),
      });
    }
    return { ...stats, unpaid, postponed: [...postponed.values()] };
  }, [
    courses,
    sessions,
    extras,
    holidays,
    settings,
    skippedHolidays,
    selectedMonth,
    now,
  ]);
}
