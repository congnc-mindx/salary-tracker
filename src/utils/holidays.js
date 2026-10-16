import { addDays, parseDate, toISO } from "./date";
import { getExtraHours } from "./extra";

export function holidayKey(courseId, date) {
  return `${courseId}:${date}`;
}

export function isPersonalHoliday(item) {
  // Tương thích dữ liệu ngày nghỉ cũ.
  return item.kind ? item.kind === "personal" : item.applyTo === "all";
}

export function holidayContains(item, date) {
  return date >= item.startDate && date <= item.endDate;
}

export function validateHoliday(item, courses = []) {
  for (const value of [item.startDate, item.endDate]) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value || "") ||
      toISO(parseDate(value)) !== value
    ) {
      return "Bạn hãy chọn ngày nghỉ hợp lệ.";
    }
  }

  if (item.endDate < item.startDate) {
    return "Ngày kết thúc không được trước ngày bắt đầu.";
  }

  if (
    !isPersonalHoliday(item) &&
    !courses.some((course) => course.id === item.applyTo)
  ) {
    return "Bạn hãy chọn lớp cần nghỉ.";
  }

  if (
    Object.values(item.decisions || {}).some(
      (value) => !["postpone", "covered"].includes(value),
    )
  ) {
    return "Cách xử lý buổi học không hợp lệ.";
  }

  return "";
}

export function getHolidayEffect(date, courseId, holidays) {
  const matching = holidays.filter(
    (item) =>
      holidayContains(item, date) &&
      (isPersonalHoliday(item) || item.applyTo === courseId),
  );

  // Lớp đã nghỉ thì không còn buổi học để người khác dạy thay.
  const classHoliday = matching.find((item) => !isPersonalHoliday(item));

  if (classHoliday) {
    return {
      ...classHoliday,
      action: "postpone",
      reason: "Lớp nghỉ",
    };
  }

  if (!matching.length) return null;

  const key = holidayKey(courseId, date);

  // Với dữ liệu cũ bị trùng khoảng, ưu tiên lùi buổi nếu
  // có ít nhất một bản ghi yêu cầu lùi.
  const holiday =
    matching.find((item) => item.decisions?.[key] !== "covered") || matching[0];

  return {
    ...holiday,
    action: holiday.decisions?.[key] || "postpone",
    reason: "Nghỉ cá nhân",
  };
}

export function getExtraHoliday(item, holidays) {
  const start = new Date(item.datetime).getTime();
  const end = start + getExtraHours(item) * 60 * 60 * 1000;

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return null;
  }

  return (
    holidays.find((holiday) => {
      if (!isPersonalHoliday(holiday)) return false;

      const leaveStart = parseDate(holiday.startDate).getTime();

      // Ngày kết thúc được tính trọn ngày.
      const leaveEnd = addDays(parseDate(holiday.endDate), 1).getTime();

      // Có tính cả ca chạy qua nửa đêm.
      return start < leaveEnd && end > leaveStart;
    }) || null
  );
}

export function applyHolidaysToExtras(extras, holidays) {
  return extras.map((item) => {
    const holiday = getExtraHoliday(item, holidays);

    if (!holiday || item.status === "cancelled") {
      return item;
    }

    return {
      ...item,
      originalStatus: item.status,
      status: "leave",
      holidayId: holiday.id,
    };
  });
}
