import {
  addDays,
  addHoursToTime,
  dateFromDateTime,
  isDateInRange,
  parseDate,
  todayISO,
  toISO,
} from "../utils/date";
import { getHolidayEffect } from "../utils/holidays";

export function getTeacherRateForDate(settings, date) {
  const history = [...settings.salaryHistory].sort((a, b) =>
    a.effectiveDate.localeCompare(b.effectiveDate),
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
  return getHolidayEffect(date, courseId, holidays);
}

export function generateCourseSchedule(course, holidays, overrides, settings) {
  const sessions = [];
  const skippedHolidays = [];

  let cursor = parseDate(course.startDate);

  const diff = (Number(course.weekday) - cursor.getDay() + 7) % 7;

  cursor = addDays(cursor, diff);

  const totalSessions = Number(course.totalSessions);

  if (!Number.isInteger(totalSessions) || totalSessions < 1) {
    throw new Error(`Số buổi của lớp ${course.code} không hợp lệ.`);
  }

  let sessionNo = 1;
  let safety = 0;

  while (sessionNo <= totalSessions) {
    if (++safety > totalSessions + 1040) {
      throw new Error(
        `Không tạo được đủ lịch lớp ${course.code}. Hãy kiểm tra khoảng nghỉ.`,
      );
    }

    const date = toISO(cursor);
    const key = `${course.id}-${sessionNo}`;
    const holiday = getHolidayForCourse(date, course.id, holidays);

    if (holiday?.action === "postpone") {
      skippedHolidays.push({
        id: `${course.id}-${date}`,
        courseId: course.id,
        courseCode: course.code,
        sessionNo,
        date,
        startTime: course.startTime,
        holidayId: holiday.id,
        title: `${course.code} · ${holiday.reason} · Lùi buổi`,
      });

      // Không tăng sessionNo vì lớp chưa học buổi này.
      cursor = addDays(cursor, 7);
      continue;
    }

    const override = overrides.find((item) => item.key === key);

    const originalStatus = override?.status || getDefaultStatusByDate(date);

    const status =
      originalStatus === "cancelled"
        ? "cancelled"
        : holiday?.action === "covered"
          ? "covered"
          : originalStatus;

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
      originalStatus,
      holidayId: holiday?.id || null,
      amount: isPaidStatus(status) ? getTeacherRateForDate(settings, date) : 0,
    });

    // Người khác dạy thay vẫn tiêu thụ một buổi của khóa.
    sessionNo += 1;
    cursor = addDays(cursor, 7);
  }

  return { sessions, skippedHolidays };
}

export function generateAllSchedules(courses, holidays, overrides, settings) {
  const sessions = [];
  const skippedHolidays = [];

  for (const course of courses) {
    const result = generateCourseSchedule(
      course,
      holidays,
      overrides,
      settings,
    );

    sessions.push(...result.sessions);
    skippedHolidays.push(...result.skippedHolidays);
  }

  return {
    sessions: sessions.sort((a, b) => a.date.localeCompare(b.date)),
    skippedHolidays: skippedHolidays.sort((a, b) =>
      a.date.localeCompare(b.date),
    ),
  };
}

export function getExtraAmount(item, settings) {
  if (["cancelled", "leave"].includes(item.status)) return 0;

  const date = dateFromDateTime(item.datetime);

  switch (item.type) {
    case "makeup":
      return getMakeupRatePerHour(settings, date) * (item.hours || 0);

    case "substitute":
      return getTeacherRateForDate(settings, date);

    case "judge":
      return settings.judgeRatePerSession;

    case "trial":
      return item.trialMode === "ONL"
        ? settings.trialOnlineRatePerStudent * (item.studentCount || 0)
        : settings.trialOfflineBaseRate +
            settings.trialOfflineBonusPerStudent * (item.studentCount || 0);

    default:
      return 0;
  }
}

export function getExtraRawAmount(item, settings) {
  return getExtraAmount({ ...item, status: "planned" }, settings);
}
