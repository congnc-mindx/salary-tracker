// Configured from the signed-in account settings before rendering its data.
let customCampusCodes = {};
let payrollCampusCodes = {};
export function getCampusPayrollCodes(campus) {
 const key = normalizeSearch(campus).replace(/\s+/g, " ");
 return payrollCampusCodes[key] ?? ({"minh khai":["505MK"],"nguyen van cu":["98NVC"],"long bien":["HN-VHRS"],"oceanpark":["Oceanpark1"],"ocean park":["Oceanpark1"]}[key] || []);
}
export function getPayrollCampusAliases(campuses) {
 return Object.fromEntries(campuses.flatMap(c => getCampusPayrollCodes(c).map(raw => [raw.toUpperCase(), getCampusCode(c)])));
}
export function configureCampusCodes(codes = {}, payroll = {}) { customCampusCodes = { ...codes }; if (customCampusCodes["long bien"] === "LB") customCampusCodes["long bien"] = "VHRS"; payrollCampusCodes = {...payroll}; }
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
  "long bien": "VHRS",
  "nguyen van cu": "NVC",
  oceanpark: "OCP",
  ocp: "OCP",
  nvc: "NVC",
  mk: "MK",
  lb: "VHRS",
  vhrs: "VHRS",
  "ocean park": "OCP",
};

export function getCampusCode(campus) {
  const normalized = normalizeSearch(campus).replace(/\s+/g, " ");

  if (!normalized) return "";

  return (
    customCampusCodes[normalized] || campusCodes[normalized] ||
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
    .toUpperCase().split("-").filter(x => !["C4K", "ROB"].includes(x)).join("-");
  const campusCode = getCampusCode(course?.campus);

  if (!code) return "";
  if (!campusCode) return code;

  // Tránh ghép hai lần nếu mã đã có tiền tố.
  if (normalizeSearch(course?.campus) === "long bien" && /^(LB|VHRS)-/.test(code)) return `${campusCode}-${code.split("-").slice(1).join("-")}`;
  return code.startsWith(`${campusCode}-`) ? code : `${campusCode}-${code}`;
}
