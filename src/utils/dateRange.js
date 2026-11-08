// ISO date strings sort chronologically without timezone conversion.
export function overlapsMonth(startDate, endDate, month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month || "") || !startDate) return false;
  const end = endDate || startDate;
  return end >= startDate && startDate.slice(0, 7) <= month && end.slice(0, 7) >= month;
}

export function filterHolidaysByMonth(holidays = [], month) {
  return holidays.filter((item) => overlapsMonth(item.startDate, item.endDate, month))
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || String(a.id).localeCompare(String(b.id)));
}
