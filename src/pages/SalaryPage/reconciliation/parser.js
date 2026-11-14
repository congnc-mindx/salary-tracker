const HEADERS = [
  "STT",
  "Centre shortname",
  "Type",
  "Class name",
  "Teacher name",
  "Teacher email",
  "Username",
  "Class role/Office hour type",
  "Status",
  "Slot time",
  "Slot duration",
  "Student count",
  "Note",
  "Price/h",
  "Total",
];
export const LIMIT_ROWS = 1500;
const key = (s) =>
  String(s ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
// Excel's text clipboard is TSV. Quoted cells may contain tabs/newlines.
export function readTSV(text) {
  const rows = [];
  let row = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' && (quoted || !cell)) {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && (c === "\t" || c === "\n" || c === "\r")) {
      row.push(cell);
      cell = "";
      if (c !== "\t") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        rows.push(row);
        row = [];
      }
    } else cell += c;
  }
  if (quoted)
    throw new Error("Có ô đang mở dấu ngoặc kép. Hãy copy lại đầy đủ bảng.");
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}
export function parseNumeric(value, money = false) {
  const s = String(value ?? "")
    .trim()
    .replace(/[\s\u00a0₫đ]/gi, "");
  if (!s || !/^[+-]?\d[\d.,]*$/.test(s))
    throw new Error("Số không hợp lệ: " + value);
  let clean = s;
  if (s.includes(",") && s.includes(".")) {
    const decimal = s.lastIndexOf(",") > s.lastIndexOf(".") ? "," : ".";
    clean = s.replace(decimal === "," ? /\./g : /,/g, "").replace(decimal, ".");
  } else if (money && /^[+-]?\d{1,3}([,.]\d{3})+$/.test(s))
    clean = s.replace(/[,.]/g, "");
  else clean = s.replace(",", ".");
  const n = Number(clean);
  if (!Number.isFinite(n) || n < 0)
    throw new Error("Số âm hoặc không hợp lệ: " + value);
  return n;
}
const months = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};
function validDate(y, m, d, h, min) {
  const v = new Date(Date.UTC(y, m - 1, d, h, min));
  if (
    v.getUTCFullYear() !== y ||
    v.getUTCMonth() !== m - 1 ||
    v.getUTCDate() !== d ||
    h > 23 ||
    min > 59
  )
    throw new Error("Ngày giờ không hợp lệ.");
  return v;
}
export function parseSlot(value) {
  const s = String(value).trim();
  let m = s.match(
    /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) ([A-Za-z]{3}) (\d{1,2}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) GMT([+-])(\d{2})(\d{2})(?:\s*\([^)]*\))?$/,
  );
  let dt;
  if (m) {
    if (!months[m[1]] || +m[6] !== 0 || +m[8] > 14 || +m[9] > 59)
      throw new Error("Múi giờ hoặc giây không hỗ trợ.");
    dt = validDate(+m[3], months[m[1]], +m[2], +m[4], +m[5]);
    const offset = (+m[8] * 60 + +m[9]) * (m[7] === "+" ? 1 : -1);
    dt = new Date(dt.getTime() + (420 - offset) * 60000);
  } else {
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::00)?$/);
    if (m) dt = validDate(+m[1], +m[2], +m[3], +m[4], +m[5]);
    else {
      m = s.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::00)?$/,
      );
      if (!m) throw new Error("Không nhận diện được ngày giờ.");
      dt = validDate(+m[3], +m[2], +m[1], +m[4], +m[5]);
    }
  }
  return {
    date: dt.toISOString().slice(0, 10),
    time: dt.toISOString().slice(11, 16),
  };
}
export function payrollType(type, role) {
  const t = key(type),
    r = key(role);
  if (t === "class" && r === "lec") return "class";
  if (t === "class" && r === "supply") return "substitute";
  if (t === "office_hours" && r === "makeup") return "makeup";
  return "unknown";
}
export function parsePayroll(text) {
  if (new TextEncoder().encode(text).length > 3000000)
    throw new Error("Bảng quá lớn (tối đa 3 MB). Hãy dán từng tháng.");
  const grid = readTSV(text),
    head = grid.findIndex(
      (row) =>
        row.some((c) => key(c) === "slot time") &&
        row.some((c) => key(c) === "class name"),
    );
  if (head < 0)
    throw new Error(
      "Chưa tìm thấy hàng tiêu đề. Hãy copy cả tên cột từ STT đến Total.",
    );
  const cols = grid[head].map(key);
  const indices = Object.fromEntries(
    HEADERS.map((h) => [h, cols.indexOf(key(h))]),
  );
  const required = HEADERS.filter(
    (h) => !["Note", "Username", "Teacher name"].includes(h),
  );
  const missing = required.filter((h) => indices[h] < 0);
  if (missing.length) throw new Error("Thiếu cột: " + missing.join(", "));
  if (new Set(cols.filter(Boolean)).size !== cols.filter(Boolean).length)
    throw new Error("Tên cột bị trùng. Hãy dán một bảng đầy đủ.");
  const rows = [],
    errors = [];
  let ignored = head;
  for (let i = head + 1; i < grid.length; i++) {
    const cells = grid[i];
    if (cells.every((c) => !c.trim())) continue;
    const get = (h) => (cells[indices[h]] ?? "").trim();
    if (key(get("STT")) === "stt") {
      ignored++;
      continue;
    }
    if (!/^\d+$/.test(get("STT")) && cells.length < 4) {
      ignored++;
      continue;
    }
    try {
      if (!/^\d+$/.test(get("STT"))) throw new Error("STT không hợp lệ.");
      const slot = parseSlot(get("Slot time")),
        hours = parseNumeric(get("Slot duration")),
        students = parseNumeric(get("Student count")),
        price = parseNumeric(get("Price/h"), true),
        total = parseNumeric(get("Total"), true);
      if (hours <= 0 || hours > 24 || !Number.isInteger(students))
        throw new Error("Thời lượng/số học sinh không hợp lệ.");
      if (
        !get("Teacher email") ||
        !get("Centre shortname") ||
        !get("Class name")
      )
        throw new Error("Thiếu giáo viên, cơ sở hoặc mã lớp.");
      rows.push({
        id: `${get("STT")}:${i + 1}`,
        stt: get("STT"),
        line: i + 1,
        centre: get("Centre shortname"),
        rawClass: get("Class name"),
        teacher: get("Teacher name"),
        email: key(get("Teacher email")),
        username: get("Username"),
        rawType: get("Type"),
        role: get("Class role/Office hour type"),
        type: payrollType(get("Type"), get("Class role/Office hour type")),
        status: get("Status").toUpperCase(),
        rawTime: get("Slot time"),
        ...slot,
        hours,
        students,
        price,
        total,
        note: get("Note"),
      });
    } catch (e) {
      errors.push({ line: i + 1, message: e.message });
    }
  }
  if (rows.length > LIMIT_ROWS)
    throw new Error(`Tối đa ${LIMIT_ROWS} dòng mỗi lần dán.`);
  if (!rows.length && !errors.length)
    throw new Error("Bảng chưa có dòng lương.");
  return {
    rows,
    errors,
    ignored,
    months: [...new Set(rows.map((r) => r.date.slice(0, 7)))].sort(),
    teachers: [...new Set(rows.map((r) => r.email))].sort(),
  };
}
