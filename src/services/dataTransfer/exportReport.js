import { generateAllSchedules, getExtraAmount } from "../income";
import { defaultSettings } from "../../config/income";
import { applyHolidaysToExtras } from "../../utils/holidays";
import { getCourseTitle } from "../../utils/courseDisplay";
import { extraTitle, extraTypeLabel, getExtraHours } from "../../utils/extra";
import { statusText } from "../../utils/format";
import { createWorkbook } from "./xlsx";

export function reportSheets(backup, year) {
  const { collections: c } = backup;
  const courses = c.courses.map((r) => ({ ...r.data, id: r.id })),
    holidays = c.holidays.map((r) => ({ ...r.data, id: r.id })),
    overrides = c.overrides.map((r) => r.data);
  const settings = {
    ...defaultSettings,
    ...c.settings.find((r) => r.id === "income")?.data,
  };
  const map = new Map(courses.map((c) => [c.id, c]));
  const { sessions, skippedHolidays } = generateAllSchedules(
    courses,
    holidays,
    overrides,
    settings,
  );
  const rows = sessions.filter((s) => s.date.startsWith(String(year)));
  const extras = applyHolidaysToExtras(
    c.extras.map((r) => ({ ...r.data, id: r.id })),
    holidays,
  ).filter((e) => e.datetime.startsWith(String(year)));
  const monthRows = Array.from({ length: 12 }, (_, i) => {
    const month = `${year}-${String(i + 1).padStart(2, "0")}`;
    const items = [
      ...rows
        .filter((s) => s.date.startsWith(month))
        .map((s) => ({ amount: s.amount, status: s.status, hours: 2 })),
      ...extras
        .filter((e) => e.datetime.startsWith(month))
        .map((e) => ({
          amount: getExtraAmount(e, settings),
          status: e.status,
          hours: getExtraHours(e),
        })),
    ].filter((e) => ["confirmed", "planned"].includes(e.status));
    return [
      month,
      items.reduce((n, e) => n + e.amount, 0),
      items
        .filter((e) => e.status === "confirmed")
        .reduce((n, e) => n + e.amount, 0),
      items
        .filter((e) => e.status === "planned")
        .reduce((n, e) => n + e.amount, 0),
      items.length,
      items.reduce((n, e) => n + e.hours, 0),
    ];
  });
  return [
    {
      name: "Tổng hợp tháng",
      rows: [
        [
          "Tháng",
          "Tổng theo lịch (VND)",
          "Đã xác nhận (VND)",
          "Chờ xác nhận (VND)",
          "Số lịch tính thu nhập",
          "Số giờ",
        ],
        ...monthRows,
      ],
    },
    {
      name: "Buổi học",
      rows: [
        ["Ngày", "Giờ", "Lớp", "Cơ sở", "Buổi", "Trạng thái", "Thu nhập (VND)"],
        ...rows.map((s) => [
          s.date,
          s.startTime,
          getCourseTitle(map.get(s.courseId)),
          map.get(s.courseId)?.campus,
          s.sessionNo,
          statusText(s.status),
          s.amount,
        ]),
      ],
    },
    {
      name: "Lịch phát sinh",
      rows: [
        [
          "Ngày giờ",
          "Loại",
          "Lớp",
          "Cơ sở",
          "Số giờ",
          "Số học sinh",
          "Trạng thái",
          "Thu nhập (VND)",
          "Ghi chú",
        ],
        ...extras.map((e) => [
          e.datetime,
          extraTypeLabel(e.type),
          extraTitle(e),
          e.campus,
          getExtraHours(e),
          e.studentCount ?? "",
          statusText(e.status),
          getExtraAmount(e, settings),
          e.note,
        ]),
      ],
    },
    {
      name: "Lớp học",
      rows: [
        ["Lớp", "Cơ sở", "Ngày bắt đầu", "Giờ", "Tổng buổi"],
        ...courses
          .filter(
            (c) =>
              rows.some((s) => s.courseId === c.id) ||
              skippedHolidays.some(
                (s) => s.courseId === c.id && s.date.startsWith(String(year)),
              ),
          )
          .map((c) => [
            getCourseTitle(c),
            c.campus,
            c.startDate,
            c.startTime,
            Number(c.totalSessions),
          ]),
      ],
    },
    {
      name: "Ngày nghỉ",
      rows: [
        ["Từ ngày", "Đến ngày", "Phạm vi", "Ghi chú"],
        ...holidays
          .filter(
            (h) =>
              h.startDate <= `${year}-12-31` && h.endDate >= `${year}-01-01`,
          )
          .map((h) => [
            h.startDate,
            h.endDate,
            h.kind === "personal" || h.applyTo === "all"
              ? "Nghỉ cá nhân"
              : getCourseTitle(map.get(h.applyTo)),
            h.note || h.title,
          ]),
      ],
    },
    {
      name: "Buổi lùi lịch",
      rows: [
        ["Ngày nghỉ", "Lớp", "Buổi"],
        ...skippedHolidays
          .filter((s) => s.date.startsWith(String(year)))
          .map((s) => [
            s.date,
            getCourseTitle(map.get(s.courseId)),
            s.sessionNo,
          ]),
      ],
    },
    {
      name: "Hướng dẫn",
      rows: [
        ["Mục", "Giải thích"],
        [
          "Phạm vi",
          `Dữ liệu năm ${year}, tính lại từ lịch và mức lương hiện tại.`,
        ],
        [
          "Đã xác nhận",
          "Là trạng thái lịch, không phải xác nhận tiền đã nhận.",
        ],
        [
          "Khôi phục",
          "Excel để đối soát. Dùng JSON để sao lưu và khôi phục cả nhận xét/mẫu.",
        ],
        [
          "Buổi nghỉ",
          "Không cộng buổi bị lùi hoặc không tính thu nhập vào tổng tháng.",
        ],
        ["Thời điểm xuất", new Date().toISOString()],
      ],
    },
  ];
}
export function exportWorkbook(backup, year) {
  return createWorkbook(reportSheets(backup, year));
}
