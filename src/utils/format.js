export function money(value) {
  return Math.round(value).toLocaleString("vi-VN") + "đ";
}

export function statusText(status) {
  if (status === "confirmed") return "Đã xác nhận";
  if (status === "cancelled") return "Đã hủy";
  if (status === "covered") return "Người khác dạy thay";
  if (status === "leave") return "Nghỉ cá nhân";

  return "Dự kiến";
}
