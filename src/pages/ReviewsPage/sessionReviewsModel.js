import { DEFAULT_CATALOG, catalogHasHomework } from "./subjectCatalog.js";
export const DEFAULT_HOMEWORK =
  "Bài 1: Hoàn thành bài tập trên DENISE. Hạn chót: Trước khi bắt đầu buổi học tiếp theo\nBài 2: Xem và làm lại các nội dung kiến thức học trên lớp để nắm vững kiến thức.";
export function hasHomework(subject = "", catalog = DEFAULT_CATALOG) {
  return catalogHasHomework(subject, catalog);
}
export function normalizeComments(text = "") {
  const clean = text.replace(/\r\n?/g, "\n").trim();
  if (!clean) return "";
  // Mỗi đoạn là một học sinh. Nếu không có dòng trống, mỗi dòng là một mục.
  const blocks = /\n\s*\n/.test(clean)
    ? clean.split(/\n\s*\n/)
    : clean.split("\n");
  return blocks
    .flatMap((block) => block.split(/\n(?=\s*[-•*]\s+)/))
    .map((block) =>
      block
        .trim()
        .replace(/^(?:[-•*]\s+)+/, "")
        .replace(/\n\s*/g, " "),
    )
    .filter(Boolean)
    .map((block) => `- ${block}`)
    .join("\n");
}
export function createSessionDraft(saved, template, subject, catalog = DEFAULT_CATALOG) {
  if (saved)
    return { ...createSessionDraft(null, template, subject, catalog), ...saved };
  return {
    content: template?.content || "",
    comments: "",
    homework: hasHomework(subject, catalog)
      ? (template?.homework ?? DEFAULT_HOMEWORK)
      : "",
    subject,
    status: "draft",
  };
}
export function buildSessionReview(value, sessionNo, total, catalog = DEFAULT_CATALOG) {
  const parts = [
    `TỔNG KẾT NỘI DUNG BUỔI SỐ ${sessionNo}/${total}`,
    `1. Nội dung buổi học:\n${value.content.trim()}`,
    `2. Em xin nhận xét riêng từng bạn trong buổi học:\n${normalizeComments(value.comments)}`,
  ];
  if (hasHomework(value.subject, catalog) && value.homework?.trim())
    parts.push(`3. Bài tập về nhà:\n${value.homework.trim()}`);
  return parts.join("\n\n");
}
export function getSuggestedSession(sessions, reviews, today) {
  const eligible = sessions.filter(
    (s) => !["cancelled", "leave", "covered"].includes(s.status),
  );
  const due = eligible.filter(
    (s) => s.date <= today && reviews?.[s.sessionNo]?.status !== "sent",
  );
  return due.at(-1) || eligible.find((s) => s.date > today) || eligible.at(-1);
}
