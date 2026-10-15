import {
  formatDateTimeVN,
  addHoursToTime,
  timeFromDateTime,
  parseDate,
  toISO,
} from "./date";

export const teachingTypes = [
  { value: "makeup", label: "Dạy bù" },
  { value: "judge", label: "Giám khảo" },
  { value: "substitute", label: "Dạy thay" },
  { value: "trial", label: "Dạy trải nghiệm" },
];

export function extraTypeLabel(type) {
  return (
    teachingTypes.find((item) => item.value === type)?.label ||
    (type === "judge" ? "Giám khảo" : "Lịch khác")
  );
}

export function getExtraHours(item) {
  return ["judge", "substitute"].includes(item.type)
    ? 2
    : Number(item.hours ?? 1);
}

export function extraTitle(item) {
  if (item.type === "trial") {
    return `Trải nghiệm ${item.trialMode === "ONL" ? "Online" : "Offline"}`;
  }

  if (item.type === "judge") {
    return `Giám khảo · ${item.classCode}`;
  }

  return item.classCode || extraTypeLabel(item.type);
}

export function extraSubtitle(item) {
  const time = timeFromDateTime(item.datetime);
  const hours = getExtraHours(item);
  const [hour, minute] = time.split(":").map(Number);

  const days = Math.floor((hour * 60 + minute + hours * 60) / 1440);

  return [
    `${formatDateTimeVN(item.datetime)} – ${addHoursToTime(
      time,
      hours,
    )}${days > 0 ? ` (+${days} ngày)` : ""}`,
    `${hours} giờ`,
    item.type === "trial" && item.trialMode === "ONL" ? "Online" : item.campus,
    item.studentCount != null ? `${item.studentCount} học sinh` : "",
    item.note,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function validateTeachingExtra(values) {
  if (!teachingTypes.some((item) => item.value === values.type)) {
    return "Loại lịch không hợp lệ.";
  }

  if (values.type !== "trial" && !values.classCode?.trim()) {
    return "Bạn hãy nhập mã lớp.";
  }

  const online = values.type === "trial" && values.trialMode === "ONL";

  if (!online && !values.campus?.trim()) {
    return "Bạn hãy chọn cơ sở.";
  }

  const match = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):[0-5]\d$/.exec(
    values.datetime || "",
  );

  if (!match || toISO(parseDate(match[1])) !== match[1]) {
    return "Ngày giờ không hợp lệ.";
  }

  const hours = Number(values.hours);

  if (!Number.isFinite(hours) || hours <= 0) {
    return "Thời lượng phải lớn hơn 0.";
  }

  if (["substitute", "judge"].includes(values.type) && hours !== 2) {
    return "Mỗi buổi dạy thay hoặc giám khảo kéo dài 2 giờ.";
  }

  if (values.type === "makeup" && (!Number.isInteger(hours) || hours > 5)) {
    return "Số giờ dạy bù phải là số nguyên từ 1 đến 5.";
  }

  // Chỉ dạy bù và trải nghiệm mới cần số học sinh.
  if (["makeup", "trial"].includes(values.type)) {
    const count = Number(values.studentCount);

    if (
      !Number.isInteger(count) ||
      count < 1 ||
      (values.type === "makeup" && count > 5)
    ) {
      return values.type === "makeup"
        ? "Số học sinh phải là số nguyên từ 1 đến 5."
        : "Số học sinh phải là số nguyên từ 1 trở lên.";
    }
  }

  if (values.type === "trial" && !["ONL", "OFF"].includes(values.trialMode)) {
    return "Bạn hãy chọn hình thức trải nghiệm.";
  }

  return "";
}
