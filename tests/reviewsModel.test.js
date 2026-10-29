import test from "node:test";
import assert from "node:assert/strict";
import {
  isFinalReviewAvailable,
  reviewText,
} from "../src/pages/ReviewsPage/reviewsModel.js";
const course = { id: "a", totalSessions: 14 };
const session = {
  courseId: "a",
  sessionNo: 14,
  date: "2026-10-29",
  status: "planned",
};
test("Only unlock on final session date", () => {
  assert.equal(isFinalReviewAvailable(course, [session], "2026-10-28"), false);
  assert.equal(isFinalReviewAvailable(course, [session], "2026-10-29"), true);
});
test("Follow postponed date, not original date", () => {
  assert.equal(
    isFinalReviewAvailable(
      course,
      [{ ...session, date: "2026-11-05" }],
      "2026-10-29",
    ),
    false,
  );
});
test("Do not unlock cancelled, leave, missing or other class sessions", () => {
  for (const status of ["cancelled", "leave"])
    assert.equal(
      isFinalReviewAvailable(course, [{ ...session, status }], "2026-10-29"),
      false,
    );
  assert.equal(isFinalReviewAvailable(course, [], "2026-10-29"), false);
  assert.equal(
    isFinalReviewAvailable(
      course,
      [{ ...session, courseId: "b" }],
      "2026-10-29",
    ),
    false,
  );
});
test("Use configured total, and keep saved reviews accessible", () => {
  assert.equal(
    isFinalReviewAvailable(
      { ...course, totalSessions: 10 },
      [{ ...session, sessionNo: 10 }],
      "2026-10-29",
    ),
    true,
  );
  assert.equal(
    isFinalReviewAvailable(
      { ...course, finalReview: { learning: "Saved" } },
      [],
      "2026-10-29",
    ),
    true,
  );
});
test("Copy plain text, preserve paragraphs", () => {
  assert.equal(
    reviewText({ learning: " A\nB ", recommendation: " C " }),
    "A\nB\n\nC",
  );
});
