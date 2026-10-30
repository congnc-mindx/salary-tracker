export function sessionStartTime(session, course) {
  const time = session.startTime || course.startTime;
  if (!session.date || !time) return Infinity;
  const [year, month, day] = session.date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const result = new Date(year, month - 1, day, hour, minute).getTime();
  return Number.isNaN(result) ? Infinity : result;
}
export function sessionEndTime(session, course) {
  const date = session.date;
  const time = session.endTime || session.startTime || course.startTime;
  if (!date || !time) return Infinity;
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const result = new Date(year, month - 1, day, hour, minute);
  if (!session.endTime) result.setMinutes(result.getMinutes() + 120);
  else {
    const [startHour, startMinute] = (
      session.startTime ||
      course.startTime ||
      "00:00"
    )
      .split(":")
      .map(Number);
    if (hour * 60 + minute < startHour * 60 + startMinute)
      result.setDate(result.getDate() + 1);
  }
  return Number.isNaN(result.getTime()) ? Infinity : result.getTime();
}
export function isReviewCompleted(review) {
  return review?.completed ?? review?.status === "sent";
}
export function buildPendingReviews(courses, sessions, now) {
  const grouped = new Map();
  for (const session of sessions) {
    if (!grouped.has(session.courseId)) grouped.set(session.courseId, []);
    grouped.get(session.courseId).push(session);
  }
  const pending = [];
  for (const course of courses) {
    const schedule = grouped.get(course.id) || [];
    const last = schedule.find(
      (s) => Number(s.sessionNo) === (Number(course.totalSessions) || 14),
    );
    // Once the last real lesson has finished, this class belongs to end-of-course work.
    if (
      last &&
      !["cancelled", "leave"].includes(last.status) &&
      sessionEndTime(last, course) <= now
    )
      continue;
    for (const session of schedule) {
      if (["cancelled", "leave", "covered"].includes(session.status)) continue;
      if (Number(session.sessionNo) >= (Number(course.totalSessions) || 14))
        continue;
      const startedAt = sessionStartTime(session, course);
      const endedAt = sessionEndTime(session, course);
      if (
        startedAt > now ||
        isReviewCompleted(course.sessionReviews?.[session.sessionNo])
      )
        continue;
      pending.push({
        course,
        session,
        startedAt,
        endedAt,
        inProgress: now < endedAt,
      });
    }
  }
  return pending.sort(
    (a, b) =>
      a.endedAt - b.endedAt ||
      String(a.course.id).localeCompare(String(b.course.id)),
  );
}
