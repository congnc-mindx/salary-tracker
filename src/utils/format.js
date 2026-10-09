export function money(value) {
  return Math.round(value).toLocaleString("vi-VN") + "đ";
}

export function statusText(status) {
  if (status === "confirmed") return "Đã xác nhận";
  if (status === "cancelled") return "Hủy / nghỉ";

  return "Dự kiến";
}