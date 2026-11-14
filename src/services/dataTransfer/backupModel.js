import { validatePayrollDocument } from "../../pages/SalaryPage/reconciliation/validation.js";
import { validateCatalog } from "../../pages/ReviewsPage/subjectCatalog.js";
export const COLLECTIONS = [
  "courses",
  "holidays",
  "overrides",
  "extras",
  "settings",
];
export const FORMAT = "mindx-teaching-backup";
export const MAX_IMPORT_RECORDS = 400;
const object = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const date = (v) =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
const time = (v) =>
  typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const number = (v, min = 0) =>
  typeof v === "number" && Number.isFinite(v) && v >= min;
export function portableSetting(id) {
  return (
    id === "income" ||
    /^sessionTemplates_[A-Za-z0-9_-]{1,80}$/.test(id) ||
    id === "payrollAliases" ||
    /^payrollRun_[A-Za-z0-9_-]+$/.test(id)
  );
}
function check(ok, message) {
  if (!ok) throw new Error(message);
}
function safeTree(value, depth = 0) {
  check(depth < 40, "Dữ liệu lồng quá sâu.");
  if (Array.isArray(value)) {
    value.forEach((v) => safeTree(v, depth + 1));
    return;
  }
  if (object(value))
    for (const [key, v] of Object.entries(value)) {
      check(
        !["__proto__", "prototype", "constructor"].includes(key),
        "File chứa khóa không hợp lệ.",
      );
      safeTree(v, depth + 1);
    }
  else
    check(
      value === null ||
        ["string", "boolean"].includes(typeof value) ||
        number(value, -Number.MAX_VALUE),
      "Giá trị JSON không hợp lệ.",
    );
}
export function validateBackup(value) {
  check(
    object(value) && value.format === FORMAT && value.version === 1,
    "Chỉ nhận file JSON sao lưu MindX phiên bản 1. Không nhận JSON của expense tracker.",
  );
  check(object(value.collections), "File thiếu dữ liệu sao lưu.");
  safeTree(value);
  for (const name of COLLECTIONS) {
    const rows = value.collections[name];
    check(Array.isArray(rows), `Thiếu danh sách ${name}.`);
    const ids = new Set();
    for (const row of rows) {
      check(
        object(row) &&
          typeof row.id === "string" &&
          row.id.length > 0 &&
          row.id.length < 1400 &&
          !row.id.includes("/") &&
          ![".", ".."].includes(row.id),
        `ID ${name} không hợp lệ.`,
      );
      check(!ids.has(row.id), `Trùng ID trong ${name}.`);
      ids.add(row.id);
      const d = row.data;
      check(
        object(d) &&
          new TextEncoder().encode(JSON.stringify(d)).length < 850000,
        `Bản ghi ${name} không hợp lệ hoặc quá lớn.`,
      );
      if (name === "courses") {
        if (d.sessionReviews)
          check(
            object(d.sessionReviews) &&
              Object.values(d.sessionReviews).every(
                (v) =>
                  object(v) &&
                  ["content", "comments", "homework"].every(
                    (k) => !(k in v) || typeof v[k] === "string",
                  ),
              ),
            "Nhận xét buổi học không hợp lệ.",
          );
        check(
          typeof d.code === "string" &&
            typeof d.campus === "string" &&
            date(d.startDate) &&
            time(d.startTime) &&
            Number.isInteger(Number(d.weekday)) &&
            Number(d.weekday) >= 0 &&
            Number(d.weekday) <= 6 &&
            Number.isInteger(Number(d.totalSessions)) &&
            Number(d.totalSessions) >= 1 &&
            Number(d.totalSessions) <= 300,
          "Lịch lớp trong file không hợp lệ.",
        );
      }
      if (name === "holidays")
        check(
          date(d.startDate) &&
            date(d.endDate) &&
            d.endDate >= d.startDate &&
            typeof d.applyTo === "string" &&
            (!d.decisions ||
              (object(d.decisions) &&
                Object.values(d.decisions).every((v) =>
                  ["postpone", "covered"].includes(v),
                ))),
          "Khoảng nghỉ trong file không hợp lệ.",
        );
      if (name === "overrides")
        check(
          typeof d.key === "string" &&
            ["planned", "confirmed", "covered", "cancelled", "leave"].includes(
              d.status,
            ),
          "Trạng thái buổi học không hợp lệ.",
        );
      if (name === "extras") {
        check(
          ["makeup", "substitute", "trial", "judge"].includes(d.type) &&
            typeof d.datetime === "string" &&
            date(d.datetime.slice(0, 10)) &&
            time(d.datetime.slice(11, 16)) &&
            ["planned", "confirmed", "cancelled", "leave"].includes(d.status),
          "Lịch phát sinh không hợp lệ.",
        );
        if (["makeup", "trial"].includes(d.type))
          check(
            number(Number(d.hours), 1) && number(Number(d.studentCount), 1),
            "Số giờ hoặc số học sinh không hợp lệ.",
          );
      }
      if (name === "settings") {
        check(
          portableSetting(row.id),
          "File có loại cài đặt không được phép khôi phục.",
        );
        if (row.id === "payrollAliases" || row.id.startsWith("payrollRun_")) {
          validatePayrollDocument(row.id, d);
        } else if (row.id === "income") {
          if (d.subjectCatalog) validateCatalog(d.subjectCatalog);
          if (d.finalReviewTemplates)
            check(
              object(d.finalReviewTemplates) &&
                Object.values(d.finalReviewTemplates).every(
                  (v) =>
                    object(v) &&
                    typeof v.learning === "string" &&
                    typeof v.recommendation === "string",
                ),
              "Mẫu cuối khóa không hợp lệ.",
            );
          check(
            (!("salaryHistory" in d) || Array.isArray(d.salaryHistory)) &&
              (d.salaryHistory || []).every(
                (v) => date(v.effectiveDate) && number(v.teacherRatePerSession),
              ),
            "Lịch sử lương không hợp lệ.",
          );
          for (const k of [
            "makeUpRatio",
            "judgeRatePerSession",
            "trialOnlineRatePerStudent",
            "trialOfflineBaseRate",
            "trialOfflineBonusPerStudent",
          ])
            if (k in d)
              check(number(d[k]), "Mức lương trong file không hợp lệ.");
          if (d.campuses)
            check(
              Array.isArray(d.campuses) &&
                d.campuses.every((v) => typeof v === "string"),
              "Danh sách cơ sở không hợp lệ.",
            );
        } else
          check(
            object(d.sessions) &&
              Object.values(d.sessions).every(
                (v) =>
                  object(v) &&
                  typeof v.content === "string" &&
                  typeof v.homework === "string",
              ),
            "Mẫu nhận xét không hợp lệ.",
          );
      }
    }
  }
  return value;
}
export function createBackup(collections, sourceUid, now = new Date()) {
  return {
    format: FORMAT,
    version: 1,
    exportedAt: now.toISOString(),
    sourceUid,
    collections,
  };
}
export function importPlan(incoming, current, mode = "missing") {
  validateBackup(incoming);
  check(["missing", "update"].includes(mode), "Chế độ nhập không hợp lệ.");
  const entries = [];
  let skipped = 0,
    updated = 0,
    added = 0;
  for (const name of COLLECTIONS) {
    const existing = new Map(
      current.collections[name].map((row) => [row.id, row]),
    );
    for (const row of incoming.collections[name]) {
      const previous = existing.get(row.id);
      if (previous && mode === "missing") {
        skipped++;
        continue;
      }
      if (previous) updated++;
      else added++;
      entries.push({ name, ...row, previous: previous?.data ?? null });
    }
  }
  check(
    entries.length <= MAX_IMPORT_RECORDS,
    `Có ${entries.length} bản ghi cần ghi, vượt giới hạn ${MAX_IMPORT_RECORDS} của một lần khôi phục an toàn. Chưa ghi dữ liệu.`,
  );
  check(
    new TextEncoder().encode(JSON.stringify(entries)).length < 7000000,
    "Dữ liệu nhập quá lớn cho một lần khôi phục. Chưa ghi dữ liệu.",
  );
  return { entries, skipped, updated, added };
}
export function stableJSON(v) {
  if (Array.isArray(v)) return "[" + v.map(stableJSON).join(",") + "]";
  if (object(v))
    return (
      "{" +
      Object.keys(v)
        .sort()
        .map((k) => JSON.stringify(k) + ":" + stableJSON(v[k]))
        .join(",") +
      "}"
    );
  return JSON.stringify(v);
}
