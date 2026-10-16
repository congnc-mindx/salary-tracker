import { useMemo } from "react";

import {
  todayISO,
  dateFromDateTime,
  timeFromDateTime,
  formatDateTimeVN,
} from "../utils/date";

import { extraTitle } from "../utils/extra";
import { applyHolidaysToExtras } from "../utils/holidays";
import useOverviewData from "./useOverviewData";

import {
  generateAllSchedules,
  getTeacherRateForDate,
  getExtraAmount,
  getExtraRawAmount,
  isPaidStatus,
} from "../services/income";

export default function useIncomeSummary({
  courses,
  holidays,
  overrides,
  extras,
  settings,
  selectedMonth,
}) {
  const today = todayISO();

  const { sessions, skippedHolidays } = useMemo(
    () => generateAllSchedules(courses, holidays, overrides, settings),
    [courses, holidays, overrides, settings],
  );

  const overview = useOverviewData({
    sessions,
    skippedHolidays,
    extras,
    holidays,
    overrides,
    settings,
  });

  const summary = useMemo(() => {
    const monthSessions = sessions.filter((item) =>
      item.date.startsWith(selectedMonth),
    );

    const monthSkipped = skippedHolidays.filter((item) =>
      item.date.startsWith(selectedMonth),
    );

    const monthExtras = applyHolidaysToExtras(extras, holidays).filter((item) =>
      dateFromDateTime(item.datetime).startsWith(selectedMonth),
    );

    let teacherBreakdown = 0;
    let makeupBreakdown = 0;
    let substituteBreakdown = 0;
    let judgeBreakdown = 0;
    let trialBreakdown = 0;

    let confirmedIncome = 0;
    let waitingIncome = 0;

    let coveredCount = 0;
    let coveredAmount = 0;

    let extraLeaveCount = 0;
    let extraLeaveAmount = 0;

    for (const item of monthSessions) {
      if (isPaidStatus(item.status)) {
        teacherBreakdown += item.amount;

        if (item.status === "confirmed") {
          confirmedIncome += item.amount;
        } else {
          waitingIncome += item.amount;
        }
      }

      if (item.status === "covered") {
        coveredCount += 1;
        coveredAmount += getTeacherRateForDate(settings, item.date);
      }
    }

    for (const item of monthExtras) {
      // Lịch đã hủy không tham gia bất kỳ khoản thống kê nào.
      if (item.status === "cancelled") continue;

      if (item.status === "leave") {
        extraLeaveCount += 1;
        extraLeaveAmount += getExtraRawAmount(item, settings);
        continue;
      }

      if (!isPaidStatus(item.status)) continue;

      const amount = getExtraAmount(item, settings);

      if (item.status === "confirmed") {
        confirmedIncome += amount;
      } else {
        waitingIncome += amount;
      }

      switch (item.type) {
        case "makeup":
          makeupBreakdown += amount;
          break;
        case "substitute":
          substituteBreakdown += amount;
          break;
        case "judge":
          judgeBreakdown += amount;
          break;
        case "trial":
          trialBreakdown += amount;
          break;
        default:
          break;
      }
    }

    /*
     * Một buổi có thể bị lùi nhiều lần trong cùng tháng.
     * Đếm một lần theo lớp + số buổi để không cộng trùng tiền.
     *
     * Nếu buổi đó có override cancelled thì bỏ qua.
     * Dữ liệu skippedHolidays cũ thiếu sessionNo vẫn đếm theo ngày.
     */
    const cancelledKeys = new Set(
      overrides
        .filter((item) => item.status === "cancelled")
        .map((item) => item.key),
    );

    const postponedBySession = new Map();

    for (const item of [...monthSkipped].sort((a, b) =>
      a.date.localeCompare(b.date),
    )) {
      const sessionKey =
        item.sessionNo != null ? `${item.courseId}-${item.sessionNo}` : null;

      if (sessionKey && cancelledKeys.has(sessionKey)) continue;

      const uniqueKey = sessionKey || `${item.courseId}:${item.date}`;

      if (!postponedBySession.has(uniqueKey)) {
        postponedBySession.set(uniqueKey, item);
      }
    }

    const postponedItems = [...postponedBySession.values()];

    const postponedCount = postponedItems.length;

    const postponedAmount = postponedItems.reduce(
      (total, item) => total + getTeacherRateForDate(settings, item.date),
      0,
    );

    const expectedIncome =
      teacherBreakdown +
      makeupBreakdown +
      substituteBreakdown +
      judgeBreakdown +
      trialBreakdown;

    const leaveSummary = {
      coveredCount,
      coveredAmount,
      extraLeaveCount,
      extraLeaveAmount,
      postponedCount,
      postponedAmount,

      // Khoản không nhận, không bao gồm buổi lùi.
      unpaidAmount: coveredAmount + extraLeaveAmount,
    };

    const upcomingItems = [
      ...monthSessions.map((item) => ({
        id: item.key,
        date: item.date,
        time: item.startTime,
        title: item.courseCode,
        subtitle: `${item.startTime} - ${item.endTime}`,
        status: item.status,
        type: "class",
      })),

      ...monthExtras.map((item) => ({
        id: item.id,
        date: dateFromDateTime(item.datetime),
        time: timeFromDateTime(item.datetime),
        title: extraTitle(item),
        subtitle: `${formatDateTimeVN(item.datetime)}${
          item.type === "trial" ? ` · ${item.studentCount || 0} HS` : ""
        }`,
        status: item.status,
        type: item.type,
      })),
    ]
      .filter((item) => isPaidStatus(item.status))
      .sort((a, b) =>
        `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
      );

    return {
      monthSessions,
      monthSkipped,
      monthExtras,
      expectedIncome,
      confirmedIncome,
      waitingIncome,
      teacherBreakdown,
      makeupBreakdown,
      substituteBreakdown,
      judgeBreakdown,
      trialBreakdown,
      leaveSummary,

      upcomingFuture: upcomingItems
        .filter((item) => item.date >= today)
        .slice(0, 5),

      pastThisMonth: upcomingItems
        .filter((item) => item.date < today)
        .slice(-5)
        .reverse(),
    };
  }, [
    sessions,
    skippedHolidays,
    extras,
    holidays,
    overrides,
    settings,
    selectedMonth,
    today,
  ]);

  return {
    sessions,
    skippedHolidays,
    overview,
    currentTeacherRate: getTeacherRateForDate(settings, today),
    ...summary,
  };
}
