export const WORK_TYPES = [
  { key: "class", label: "Lớp học", color: "#10b981" },
  { key: "makeup", label: "Dạy bù", color: "#3b82f6" },
  { key: "substitute", label: "Dạy thay", color: "#ec4899" },
  { key: "judge", label: "Giám khảo", color: "#a855f7" },
  { key: "trial", label: "Trải nghiệm", color: "#f97316" },
];
const number = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
export function summarizeRows(rows) {
  return rows.reduce(
    (result, row) => {
      const amount = number(row.amount),
        hours = number(row.hours);
      result.total += amount;
      result.hours += hours;
      result.count++;
      if (row.status === "confirmed") {
        result.confirmed += amount;
        result.confirmedHours += hours;
        result.confirmedCount++;
      } else {
        result.waiting += amount;
        result.waitingHours += hours;
        result.waitingCount++;
      }
      return result;
    },
    {
      total: 0,
      confirmed: 0,
      waiting: 0,
      hours: 0,
      confirmedHours: 0,
      waitingHours: 0,
      count: 0,
      confirmedCount: 0,
      waitingCount: 0,
    },
  );
}
export function monthWindow(month, count = 6) {
  const [year, m] = month.split("-").map(Number);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(year, m - count + index, 1);
    return (
      date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0")
    );
  });
}
export function buildStatistics(source, month, mode = "month") {
  const paid = source.filter(
    (row) =>
      ["confirmed", "planned"].includes(row.status) &&
      WORK_TYPES.some((type) => type.key === row.type),
  );
  const rows = paid.filter((row) => row.date?.startsWith(mode === "year" ? month.slice(0, 4) + "-" : month));
  const types = WORK_TYPES.map((type) => ({
    ...type,
    ...summarizeRows(rows.filter((row) => row.type === type.key)),
  }));
  const groups = new Map(),
    campusGroups = new Map();
  for (const row of rows) {
    const groupKey = row.groupKey || row.id;
    if (!groups.has(groupKey))
      groups.set(groupKey, {
        key: groupKey,
        title: row.title,
        campus: row.campus || "Chưa xác định",
        type: row.type,
        rows: [],
      });
    groups.get(groupKey).rows.push(row);
    const campus = row.campus || "Chưa xác định";
    if (!campusGroups.has(campus)) campusGroups.set(campus, []);
    campusGroups.get(campus).push(row);
  }
  return {
    ...summarizeRows(rows),
    rows,
    types,
    groups: [...groups.values()]
      .map((group) => ({ ...group, ...summarizeRows(group.rows) }))
      .sort(
        (a, b) => b.total - a.total || a.title.localeCompare(b.title, "vi"),
      ),
    campuses: [...campusGroups]
      .map(([title, rows]) => ({ key: title, title, rows, ...summarizeRows(rows) }))
      .sort((a, b) => b.total - a.total),
    classes: [...rows.reduce((map, row) => {
      if (!row.classLabel) return map;
      const key = (row.campus || "") + ":" + row.classLabel;
      if (!map.has(key)) map.set(key, { key, title: row.classLabel, rows: [] });
      map.get(key).rows.push(row);
      return map;
    }, new Map()).values()].map(group => ({ ...group, ...summarizeRows(group.rows) }))
      .sort((a,b) => b.total-a.total || a.title.localeCompare(b.title, "vi")),
    trend: (mode === "year" ? Array.from({ length: 12 }, (_, i) => month.slice(0, 4) + "-" + String(i + 1).padStart(2, "0")) : monthWindow(month)).map((key) => {
      const monthRows = paid.filter((row) => row.date?.slice(0, 7) === key);
      return {
        month: key,
        ...summarizeRows(monthRows),
        types: WORK_TYPES.map((type) => ({
          ...type,
          ...summarizeRows(monthRows.filter((row) => row.type === type.key)),
        })),
      };
    }),
  };
}

export const percent = (value, total) =>
  total > 0
    ? ((value / total) * 100).toLocaleString("vi-VN", {
        maximumFractionDigits: 1,
      }) + "%"
    : "0%";
