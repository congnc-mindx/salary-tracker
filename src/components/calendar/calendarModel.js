const labels = { makeup: "Dạy bù", substitute: "Dạy thay", judge: "Giám khảo", trial: "Dạy TN" };
export function calendarEventTitle(item) {
  if (!item.isExtra) return item.title;
  const code = String(item.source?.classCode || "").split("-").filter(part => !["C4K", "ROB"].includes(part.toUpperCase())).pop();
  const type = labels[item.kind] || item.kind;
  return code ? `${code} · ${type}` : `${type}${item.kind === "trial" ? ` · ${item.source?.trialMode === "ONL" ? "Online" : "Offline"}` : ""}`;
}
