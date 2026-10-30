import { DEFAULT_CATALOG, catalogSubjects } from "./subjectCatalog.js";
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

export function isFinalReviewPending(course, sessions, today) {
  return !course.finalReviewCompleted && isFinalReviewAvailable(course, sessions, today);
}

export function reviewText(review) {
  return [review.learning?.trim(), review.recommendation?.trim()]
    .filter(Boolean)
    .join("\n\n");
}

// Explicit selection wins; infer only a recognized subject token followed by a class number.
export function resolveCourseSubject(course, catalog = DEFAULT_CATALOG) {
  const explicit = String(course.subject || "").trim();
  if (explicit) return catalogSubjects(catalog).some(s=>s.id===explicit) ? explicit : explicit.toUpperCase();
  const code = String(course.code || "")
    .trim()
    .toUpperCase();
  const matches = catalogSubjects(catalog).filter((subject) =>
    [subject.code, ...(subject.aliases || [])].some(token => new RegExp(`(?:^|[\\s_-])${token}(?=\\d+(?:$|[\\s_-]))`).test(code)),
  );
  return matches.length === 1 ? matches[0].id : "";
}
