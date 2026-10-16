import { useEffect, useMemo, useState } from "react";

import {
  addDays,
  parseDate,
  toISO,
  dateFromDateTime,
  timeFromDateTime,
  formatDateVN,
} from "../utils/date";

import { extraTitle, extraSubtitle } from "../utils/extra";
import { applyHolidaysToExtras } from "../utils/holidays";
import { getExtraAmount, isPaidStatus } from "../services/income";

export function getOverviewTone(item) {
  // Ngày nghỉ hoặc buổi người khác dạy thay.
  if (item.kind === "holiday" || ["leave", "covered"].includes(item.status)) {
    return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
  }

  if (item.kind === "class") {
    if (Number(item.sessionNo) === 5) {
      return "bg-violet-50 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200";
    }

    if (Number(item.sessionNo) === 9) {
      return "bg-amber-50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200";
    }

    if (Number(item.sessionNo) === 14) {
      return "bg-rose-50 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200";
    }

    return "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
  }

  // Một màu chung cho toàn bộ lịch phát sinh.
  return "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200";
}

export function sortOverviewEvents(a, b) {
  return (
    `${a.date} ${a.time || "00:00"}`.localeCompare(
      `${b.date} ${b.time || "00:00"}`,
    ) || a.title.localeCompare(b.title, "vi")
  );
}

export default function useOverviewData({
  sessions,
  skippedHolidays,
  extras,
  holidays,
  overrides,
  settings,
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 60_000);

    window.addEventListener("focus", refresh);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return useMemo(() => {
    const today = toISO(new Date(now));

    const cancelledKeys = new Set(
      overrides
        .filter((item) => item.status === "cancelled")
        .map((item) => item.key),
    );

    const classEvents = sessions
      .filter((item) => item.status !== "cancelled")
      .map((item) => ({
        id: `class:${item.key}`,
        kind: "class",
        date: item.date,
        time: item.startTime,
        title: `${item.courseCode} · buổi ${item.sessionNo}`,
        description: `${item.startTime} – ${item.endTime}`,
        sessionNo: item.sessionNo,
        status: item.status,
        amount: item.amount,
        holidayId: item.holidayId,
        source: item,
      }));

    const skippedEvents = skippedHolidays
      .filter(
        (item) =>
          item.sessionNo == null ||
          !cancelledKeys.has(`${item.courseId}-${item.sessionNo}`),
      )
      .map((item) => ({
        id: `skipped:${item.id}`,
        kind: "holiday",
        date: item.date,
        time: item.startTime || "",
        title: `${item.courseCode} · nghỉ`,
        description: `${
          item.startTime ? `${item.startTime} · ` : ""
        }Lùi buổi học`,
        status: "leave",
        amount: 0,
        holidayId: item.holidayId,
        source: item,
      }));

    const extraEvents = applyHolidaysToExtras(extras, holidays)
      .filter((item) => item.status !== "cancelled")
      .map((item) => ({
        id: `extra:${item.id}`,
        kind: item.type,
        date: dateFromDateTime(item.datetime),
        time: timeFromDateTime(item.datetime),
        title: extraTitle(item),
        description: extraSubtitle(item),
        status: item.status,
        amount: getExtraAmount(item, settings),
        holidayId: item.holidayId,
        source: item,
        isExtra: true,
      }))
      .sort(sortOverviewEvents);

    const events = [...classEvents, ...skippedEvents, ...extraEvents].sort(
      sortOverviewEvents,
    );

    const notificationEnd = toISO(addDays(parseDate(today), 13));

    const notifications = classEvents
      .filter(
        (item) =>
          isPaidStatus(item.status) &&
          [5, 9, 14].includes(Number(item.sessionNo)) &&
          item.date <= notificationEnd &&
          new Date(`${item.date}T${item.time}`).getTime() >= now,
      )
      .sort(sortOverviewEvents);

    const todayDate = parseDate(today);
    const mondayOffset = (todayDate.getDay() + 6) % 7;
    const monday = addDays(todayDate, -mondayOffset);

    function buildWeek(offset, title) {
      const startDate = toISO(addDays(monday, offset));
      const endDate = toISO(addDays(monday, offset + 6));

      return {
        title,
        startDate,
        endDate,
        dateLabel: `${formatDateVN(startDate)} – ${formatDateVN(endDate)}`,
        items: extraEvents.filter(
          (item) => item.date >= startDate && item.date <= endDate,
        ),
      };
    }

    return {
      today,
      events,
      notifications,
      weeks: [
        buildWeek(0, "Lịch phát sinh tuần này"),
        buildWeek(7, "Lịch phát sinh tuần tới"),
      ],
    };
  }, [now, sessions, skippedHolidays, extras, holidays, overrides, settings]);
}
