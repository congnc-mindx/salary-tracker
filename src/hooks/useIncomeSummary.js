import { useMemo } from "react";

import {
  todayISO,
  dateFromDateTime,
  timeFromDateTime,
  formatDateTimeVN,
} from "../utils/date";
import { applyHolidaysToExtras } from "../utils/holidays";
import { extraTitle } from "../utils/extra";

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

    let expectedExtra = 0;
    let confirmedIncome = 0;
    let cancelledIncome = 0;

    // Thu nhập từ các lớp cố định.
    for (const item of monthSessions) {
      if (isPaidStatus(item.status)) {
        teacherBreakdown += item.amount;
      }

      if (item.status === "confirmed") {
        confirmedIncome += item.amount;
      }

      if (["cancelled", "covered"].includes(item.status)) {
        cancelledIncome += getTeacherRateForDate(settings, item.date);
      }
    }

    // Thu nhập từ dạy bù, dạy thay, giám khảo và trải nghiệm.
    for (const item of monthExtras) {
      const amount = getExtraAmount(item, settings);

      expectedExtra += amount;

      if (item.status === "confirmed") {
        confirmedIncome += amount;
      }

      if (["cancelled", "covered"].includes(item.status)) {
        cancelledIncome += getExtraRawAmount(item, settings);
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

    // expectedExtra đã bao gồm tiền dạy thay.
    const expectedIncome = teacherBreakdown + expectedExtra;
    const waitingIncome = expectedIncome - confirmedIncome;

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

    const upcomingFuture = upcomingItems
      .filter((item) => item.date >= today)
      .slice(0, 5);

    const pastThisMonth = upcomingItems
      .filter((item) => item.date < today)
      .slice(-5)
      .reverse();

    return {
      monthSessions,
      monthSkipped,
      monthExtras,
      expectedIncome,
      confirmedIncome,
      cancelledIncome,
      waitingIncome,
      teacherBreakdown,
      makeupBreakdown,
      substituteBreakdown,
      judgeBreakdown,
      trialBreakdown,
      upcomingFuture,
      pastThisMonth,
    };
  }, [
    sessions,
    skippedHolidays,
    extras,
    holidays,
    settings,
    selectedMonth,
    today,
  ]);

  return {
    sessions,
    skippedHolidays,
    currentTeacherRate: getTeacherRateForDate(settings, today),
    ...summary,
  };
}
