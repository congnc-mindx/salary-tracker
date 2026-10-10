import { useMemo } from 'react';

import {
  todayISO,
  dateFromDateTime,
  timeFromDateTime,
  formatDateTimeVN,
} from '../utils/date';

import {
  generateAllSchedules,
  getTeacherRateForDate,
  getExtraAmount,
  getExtraRawAmount,
  isPaidStatus,
} from '../services/income';

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
    [courses, holidays, overrides, settings]
  );

  const summary = useMemo(() => {
    const monthSessions = sessions.filter((item) =>
      item.date.startsWith(selectedMonth)
    );

    const monthSkipped = skippedHolidays.filter((item) =>
      item.date.startsWith(selectedMonth)
    );

    const monthExtras = extras.filter((item) =>
      dateFromDateTime(item.datetime).startsWith(selectedMonth)
    );

    let teacherBreakdown = 0;
    let makeupBreakdown = 0;
    let judgeBreakdown = 0;
    let trialBreakdown = 0;

    let expectedExtra = 0;
    let confirmedIncome = 0;
    let cancelledIncome = 0;

    for (const item of monthSessions) {
      if (isPaidStatus(item.status)) {
        teacherBreakdown += item.amount;
      }

      if (item.status === 'confirmed') {
        confirmedIncome += item.amount;
      }

      if (item.status === 'cancelled') {
        cancelledIncome += getTeacherRateForDate(settings, item.date);
      }
    }

    for (const item of monthExtras) {
      const amount = getExtraAmount(item, settings);

      expectedExtra += amount;

      if (item.status === 'confirmed') {
        confirmedIncome += amount;
      }

      if (item.status === 'cancelled') {
        cancelledIncome += getExtraRawAmount(item, settings);
      }

      if (item.type === 'makeup') {
        makeupBreakdown += amount;
      } else if (item.type === 'judge') {
        judgeBreakdown += amount;
      } else if (item.type === 'trial') {
        trialBreakdown += amount;
      }
    }

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
        type: 'class',
      })),

      ...monthExtras.map((item) => ({
        id: item.id,
        date: dateFromDateTime(item.datetime),
        time: timeFromDateTime(item.datetime),
        title:
          item.type === 'trial'
            ? `Trial ${item.trialMode}`
            : item.type === 'judge'
              ? `Giám khảo · ${item.classCode}`
              : `Dạy bù · ${item.classCode}`,
        subtitle: `${formatDateTimeVN(item.datetime)}${
          item.type === 'trial'
            ? ` · ${item.studentCount || 0} HS`
            : ''
        }`,
        status: item.status,
        type: item.type,
      })),
    ]
      .filter((item) => item.status !== 'cancelled')
      .sort((a, b) =>
        `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
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
      judgeBreakdown,
      trialBreakdown,
      upcomingFuture,
      pastThisMonth,
    };
  }, [
    sessions,
    skippedHolidays,
    extras,
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