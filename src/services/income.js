import {
  addDays,
  addHoursToTime,
  dateFromDateTime,
  isDateInRange,
  parseDate,
  todayISO,
  toISO,
} from "../utils/date";

export function getTeacherRateForDate(settings, date) {
  const history = [...settings.salaryHistory].sort((a, b) =>
    a.effectiveDate.localeCompare(b.effectiveDate)
  );

  let rate = history[0]?.teacherRatePerSession || 300000;

  for (const item of history) {
    if (item.effectiveDate <= date) {
      rate = item.teacherRatePerSession;
    }
  }

  return rate;
}

export function getMakeupRatePerHour(settings, date) {
  return getTeacherRateForDate(settings, date) * settings.makeUpRatio;
}

export function getDefaultStatusByDate(date) {
  return date < todayISO() ? "confirmed" : "planned";
}

export function isPaidStatus(status) {
  return status === "planned" || status === "confirmed";
}

export function getHolidayForCourse(date, courseId, holidays) {
  return holidays.find(
    (holiday) =>
      isDateInRange(date, holiday.startDate, holiday.endDate) &&
      (holiday.applyTo === "all" || holiday.applyTo === courseId)
  );
}

export function generateCourseSchedule(
  course,
  holidays,
  overrides,
  settings
) {
  const sessions = [];
  const skippedHolidays = [];

  let cursor = parseDate(course.startDate);
  const nativeWeekday = cursor.getDay();

  if (nativeWeekday !== course.weekday) {
    const diff = (course.weekday - nativeWeekday + 7) % 7;
    cursor = addDays(cursor, diff);
  }

  let sessionNo = 1;
  let safety = 0;

  while (sessionNo <= course.totalSessions && safety < 120) {
    const date = toISO(cursor);
    const holiday = getHolidayForCourse(date, course.id, holidays);

    if (holiday) {
      skippedHolidays.push({
        id: `${course.id}-${date}`,
        courseId: course.id,
        courseCode: course.code,
        date,
        title: holiday.title,
      });

      cursor = addDays(cursor, 7);
      safety += 1;
      continue;
    }

    const key = `${course.id}-${sessionNo}`;
    const override = overrides.find((item) => item.key === key);
    const status = override?.status || getDefaultStatusByDate(date);
    const baseAmount = getTeacherRateForDate(settings, date);

    sessions.push({
      key,
      courseId: course.id,
      courseCode: course.code,
      sessionNo,
      date,
      weekday: course.weekday,
      startTime: course.startTime,
      endTime: addHoursToTime(course.startTime, 2),
      status,
      amount: isPaidStatus(status) ? baseAmount : 0,
    });

    sessionNo += 1;
    cursor = addDays(cursor, 7);
    safety += 1;
  }

  return { sessions, skippedHolidays };
}

export function generateAllSchedules(
  courses,
  holidays,
  overrides,
  settings
) {
  const sessions = [];
  const skippedHolidays = [];

  for (const course of courses) {
    const result = generateCourseSchedule(
      course,
      holidays,
      overrides,
      settings
    );

    sessions.push(...result.sessions);
    skippedHolidays.push(...result.skippedHolidays);
  }

  return {
    sessions: sessions.sort((a, b) => a.date.localeCompare(b.date)),
    skippedHolidays: skippedHolidays.sort((a, b) =>
      a.date.localeCompare(b.date)
    ),
  };
}

export function getExtraAmount(item, settings) {
  if (item.status === "cancelled") return 0;

  const date = dateFromDateTime(item.datetime);

  if (item.type === "makeup") {
    return getMakeupRatePerHour(settings, date) * (item.hours || 0);
  }

  if (item.type === "judge") {
    return settings.judgeRatePerSession;
  }

  const studentCount = item.studentCount || 0;

  if (item.trialMode === "ONL") {
    return settings.trialOnlineRatePerStudent * studentCount;
  }

  return (
    settings.trialOfflineBaseRate +
    settings.trialOfflineBonusPerStudent * studentCount
  );
}

export function getExtraRawAmount(item, settings) {
  return getExtraAmount({ ...item, status: "planned" }, settings);
}