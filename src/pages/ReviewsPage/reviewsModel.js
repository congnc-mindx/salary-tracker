export const SUBJECT_GROUPS = [
  { name: "Robotics · PRE", subjects: ["PREB", "PREA", "PREI"] },
  { name: "Scratch", subjects: ["SB", "SA", "SI"] },
  { name: "Game", subjects: ["GB", "GA", "GI"] },
  { name: "Python", subjects: ["PTB", "PTA", "PTI"] },
  { name: "JavaScript", subjects: ["JSB", "JSA", "JSI"] },
  { name: "Computer Science", subjects: ["CSB", "CSA", "CSI"] },
];
export const SUBJECTS = [
  ...SUBJECT_GROUPS.flatMap((group) => group.subjects),
  "ARM",
];
export const EMPTY_REVIEW = { learning: "", recommendation: "" };

export function getFinalSession(course, sessions) {
  const total = Number(course.totalSessions) || 14;
  return sessions.find(
    (session) =>
      session.courseId === course.id &&
      Number(session.sessionNo) === total &&
      !["cancelled", "leave"].includes(session.status),
  );
}

export function isFinalReviewAvailable(course, sessions, today) {
  if (course.finalReview) return true;
  const session = getFinalSession(course, sessions);
  return Boolean(session && session.date <= today);
}

export function reviewText(review) {
  return [review.learning?.trim(), review.recommendation?.trim()]
    .filter(Boolean)
    .join("\n\n");
}
