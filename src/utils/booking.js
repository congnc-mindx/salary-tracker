const HOUR_MS = 60 * 60 * 1000;

function createSlot(datetime, hours, label) {
  const start = new Date(datetime).getTime();
  const duration = Number(hours);

  if (!Number.isFinite(start) || !Number.isFinite(duration) || duration <= 0) {
    throw new Error(
      `Lịch "${label}" có ngày giờ hoặc thời lượng không hợp lệ.`,
    );
  }

  return {
    start,
    end: start + duration * HOUR_MS,
    label,
  };
}

export function getBookingSlots(sessions = [], extras = []) {
  const classSlots = sessions
    .filter((item) => item.status !== "cancelled")
    .map((item) =>
      createSlot(
        `${item.date}T${item.startTime}`,
        2,
        `Lớp ${item.courseCode} · buổi ${item.sessionNo}`,
      ),
    );

  const extraSlots = extras
    .filter((item) => item.status !== "cancelled")
    .map((item) => {
      const title =
        item.type === "judge"
          ? "Giám khảo"
          : item.type === "makeup"
            ? "Dạy bù"
            : "Dạy trải nghiệm";

      return createSlot(
        item.datetime,
        item.type === "judge" ? 2 : (item.hours ?? 1),
        `${title}${item.classCode ? ` · ${item.classCode}` : ""}`,
      );
    });

  return [...classSlots, ...extraSlots];
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function getBookingConflictMessage(candidates, existing) {
  for (const candidate of candidates) {
    const conflict = existing.find(
      (item) => candidate.start < item.end && candidate.end > item.start,
    );

    if (conflict) {
      return (
        `Không thể lưu vì trùng lịch ${conflict.label}: ` +
        `${formatTime(conflict.start)} – ${formatTime(conflict.end)}. ` +
        "Bạn hãy chọn ngày hoặc giờ khác."
      );
    }
  }

  return "";
}
