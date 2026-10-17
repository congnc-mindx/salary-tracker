export function normalizeSearch(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim();
}

const campusCodes = {
  "minh khai": "MK",
  "long bien": "LB",
  "nguyen van cu": "NVC",
  oceanpark: "OCP",
  "ocean park": "OCP",
};

export function getCampusCode(campus) {
  const normalized = normalizeSearch(campus).replace(/\s+/g, " ");

  if (!normalized) return "";

  return (
    campusCodes[normalized] ||
    normalized
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
  );
}

export function getCourseTitle(course) {
  const code = String(course?.code ?? "")
    .trim()
    .toUpperCase();
  const campusCode = getCampusCode(course?.campus);

  if (!code) return "";
  if (!campusCode) return code;

  // Tránh ghép hai lần nếu mã đã có tiền tố.
  return code.startsWith(`${campusCode}-`) ? code : `${campusCode}-${code}`;
}
