import test from "node:test";
import assert from "node:assert/strict";
import { resolveCourseSubject } from "../src/pages/ReviewsPage/reviewsModel.js";
import { buildPendingReviews } from "../src/pages/ReviewsPage/pendingReviewsModel.js";
import { createSessionDraft } from "../src/pages/ReviewsPage/sessionReviewsModel.js";
const course = { id: "a", code: "MK-JSB45", totalSessions: 14 };
const session = {
  courseId: "a",
  sessionNo: 13,
  date: "2026-10-30",
  startTime: "14:00",
  endTime: "16:00",
  status: "planned",
};
const at = (h) => new Date(2026, 9, 30, h).getTime();
test("Recognize class code with or without campus prefix, honor explicit selection", () => {
  assert.equal(resolveCourseSubject(course), "JSB");
  assert.equal(resolveCourseSubject({ code: "JSB45" }), "JSB");
  assert.equal(resolveCourseSubject({ code: "PREI02" }), "PREI");
  assert.equal(
    resolveCourseSubject({ code: "MK-JSB45", subject: "PTB" }),
    "PTB",
  );
  assert.equal(resolveCourseSubject({ code: "UNKNOWN45" }), "");
  assert.equal(resolveCourseSubject({ code: "JSB45-PTB10" }), "");
});
test("14–16 lesson opens at 14, is in progress at 15 and stays pending after 16", () => {
  assert.equal(buildPendingReviews([course], [session], at(13)).length, 0);
  assert.equal(buildPendingReviews([course], [session], at(14)).length, 1);
  assert.equal(
    buildPendingReviews([course], [session], at(15))[0].inProgress,
    true,
  );
  assert.equal(
    buildPendingReviews([course], [session], at(16))[0].inProgress,
    false,
  );
});
test("Saved draft is retained after lesson ends and template changes; only checkbox completes", () => {
  const saved = {
    content: "Nội dung đã chỉnh",
    comments: "Nhận xét đã nhập",
    homework: "Bài tập",
    subject: "JSB",
    status: "draft",
    completed: false,
  };
  const c = { ...course, sessionReviews: { 13: saved } };
  assert.equal(buildPendingReviews([c], [session], at(17)).length, 1);
  assert.equal(
    createSessionDraft(saved, { content: "Mẫu thay đổi" }, "JSB").comments,
    "Nhận xét đã nhập",
  );
  assert.equal(
    createSessionDraft(saved, { content: "Mẫu thay đổi" }, "JSB").content,
    "Nội dung đã chỉnh",
  );
  assert.equal(
    buildPendingReviews(
      [{ ...c, sessionReviews: { 13: { ...saved, completed: true } } }],
      [session],
      at(17),
    ).length,
    0,
  );
});
test("Final lesson never creates a normal session task, even during class", () => {
  assert.equal(
    buildPendingReviews([course], [{ ...session, sessionNo: 14 }], at(15))
      .length,
    0,
  );
});
