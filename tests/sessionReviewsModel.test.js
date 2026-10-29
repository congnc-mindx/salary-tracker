import test from "node:test";
import assert from "node:assert/strict";
import {
  SUBJECTS,
  SUBJECT_GROUPS,
} from "../src/pages/ReviewsPage/reviewsModel.js";
import {
  hasHomework,
  normalizeComments,
  createSessionDraft,
  buildSessionReview,
  getSuggestedSession,
} from "../src/pages/ReviewsPage/sessionReviewsModel.js";
test("Each established group has three levels, including CSI", () => {
  assert(SUBJECTS.includes("CSI"));
  assert(SUBJECT_GROUPS.every((g) => g.subjects.length === 3));
  assert.deepEqual(SUBJECT_GROUPS.find((g) => g.name === "Python").subjects, [
    "PTB",
    "PTA",
    "PTI",
  ]);
});
test("Robotics has no homework, programming does", () => {
  for (const code of ["PREB", "PREA", "PREI", "ARM", "ARMB"])
    assert.equal(hasHomework(code), false);
  assert.equal(hasHomework("PTB"), true);
});
test("Normalize paragraphs and existing bullets without duplication", () => {
  assert.equal(
    normalizeComments("Bảo làm tốt.\n\nThái chủ động."),
    "- Bảo làm tốt.\n- Thái chủ động.",
  );
  const normalized = normalizeComments("- Bảo làm tốt.\n• Thái chủ động.");
  assert.equal(normalizeComments(normalized), normalized);
  assert.equal(
    normalizeComments("Bảo làm tốt\nvà tập trung.\n\nThái chủ động."),
    "- Bảo làm tốt và tập trung.\n- Thái chủ động.",
  );
  assert.equal(normalizeComments(" \r\n "), "");
});
test("New session never inherits personal comments or sent status", () => {
  const draft = createSessionDraft(
    null,
    { content: "Nội dung", comments: "Học sinh cũ", status: "sent" },
    "PTB",
  );
  assert.equal(draft.comments, "");
  assert.equal(draft.status, "draft");
  assert(draft.homework.includes("DENISE"));
});
test("Saved review stays independent of updated template", () => {
  const saved = {
    content: "Bản cũ",
    comments: "Nhận xét",
    homework: "",
    subject: "PTB",
    status: "sent",
  };
  assert.deepEqual(
    createSessionDraft(saved, { content: "Mẫu mới" }, "PREB"),
    saved,
  );
});
test("Output uses exact sections and omits robot homework even from stale data", () => {
  const draft = {
    content: "- Kiến thức",
    comments: "Bảo tốt.",
    homework: "Bài 1: Làm bài",
    subject: "PTB",
  };
  assert.equal(
    buildSessionReview(draft, 2, 14),
    "TỔNG KẾT NỘI DUNG BUỔI SỐ 2/14\n\n1. Nội dung buổi học:\n- Kiến thức\n\n2. Em xin nhận xét riêng từng bạn trong buổi học:\n- Bảo tốt.\n\n3. Bài tập về nhà:\nBài 1: Làm bài",
  );
  assert(
    !buildSessionReview({ ...draft, subject: "PREB" }, 2, 14).includes(
      "3. Bài tập",
    ),
  );
});
test("Suggest latest due unsent; skip cancellations and covered sessions", () => {
  const list = [
    { sessionNo: 1, date: "2026-10-01", status: "confirmed" },
    { sessionNo: 2, date: "2026-10-08", status: "covered" },
    { sessionNo: 3, date: "2026-10-15", status: "cancelled" },
    { sessionNo: 4, date: "2026-11-01", status: "planned" },
  ];
  assert.equal(getSuggestedSession(list, {}, "2026-10-29").sessionNo, 1);
  assert.equal(
    getSuggestedSession(list, { 1: { status: "sent" } }, "2026-10-29")
      .sessionNo,
    4,
  );
});
