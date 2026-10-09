export const weekdayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function todayISO() {
  return toISO(new Date());
}

export function currentMonthISO() {
  return todayISO().slice(0, 7);
}

export function parseDate(date) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);

  return next;
}

export function formatDateVN(date) {
  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}`;
}

export function formatDateTimeVN(datetime) {
  const [date, time] = datetime.split("T");

  return `${formatDateVN(date)} ${time}`;
}

export function dateFromDateTime(datetime) {
  return datetime.slice(0, 10);
}

export function timeFromDateTime(datetime) {
  return datetime.slice(11, 16);
}

export function datetimeNowLocal() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${toISO(now)}T${hours}:${minutes}`;
}

export function nativeWeekdayToMondayIndex(nativeDay) {
  // JavaScript: Chủ nhật = 0. Lịch giao diện: Thứ hai = 0.
  return nativeDay === 0 ? 6 : nativeDay - 1;
}

export function getNativeWeekday(date) {
  return parseDate(date).getDay();
}

export function getMondayIndex(date) {
  return nativeWeekdayToMondayIndex(getNativeWeekday(date));
}

export function getMonthLabel(month) {
  const [year, monthNumber] = month.split("-");

  return `Tháng ${Number(monthNumber)}/${year}`;
}

function shiftMonth(month, amount) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + amount, 1);

  return toISO(date).slice(0, 7);
}

export function nextMonth(month) {
  return shiftMonth(month, 1);
}

export function prevMonth(month) {
  return shiftMonth(month, -1);
}

export function getDaysInMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();

  return Array.from({ length: lastDay }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");

    return `${year}-${String(monthNumber).padStart(2, "0")}-${day}`;
  });
}

export function addHoursToTime(time, hours) {
  const [hour, minute] = time.split(":").map(Number);
  const totalMinutes = hour * 60 + minute + hours * 60;
  const nextHour = Math.floor(totalMinutes / 60) % 24;
  const nextMinute = totalMinutes % 60;

  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}

export function isDateInRange(date, startDate, endDate) {
  return date >= startDate && date <= endDate;
}