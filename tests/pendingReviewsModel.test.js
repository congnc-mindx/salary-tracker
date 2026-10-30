import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPendingReviews,
  sessionEndTime,
} from "../src/pages/ReviewsPage/pendingReviewsModel.js";
const course = { id: "a", startTime: "19:00", totalSessions: 14 };
const session = (no, date, status = "confirmed") => ({
  courseId: "a",
  sessionNo: no,
  date,
  startTime: "19:00",
  endTime: "21:00",
  status,
});
const now = (d, h = 22) => new Date(2026, 9, d, h).getTime();
test("Open from lesson start, not before it", () => {
  const s = session(1, "2026-10-01");
  assert.equal(buildPendingReviews([course], [s], now(1, 18)).length, 0);
  assert.equal(buildPendingReviews([course], [s], now(1, 21)).length, 1);
});
test("Keep all unfinished tasks across later lessons and dates", () => {
  const ss = [
    session(1, "2026-10-01"),
    session(2, "2026-10-08"),
    session(3, "2026-11-01"),
  ];
  assert.deepEqual(
    buildPendingReviews([course], ss, now(29)).map((x) => x.session.sessionNo),
    [1, 2],
  );
});
test("Save does not complete; checkbox hides only marked lesson; undo restores", () => {
  const ss = [session(1, "2026-10-01"), session(2, "2026-10-08")];
  const c = {
    ...course,
    sessionReviews: { 1: { content: "Saved", status: "draft" } },
  };
  assert.equal(buildPendingReviews([c], ss, now(29)).length, 2);
  c.sessionReviews[1].completed = true;
  assert.deepEqual(
    buildPendingReviews([c], ss, now(29)).map((x) => x.session.sessionNo),
    [2],
  );
  c.sessionReviews[1].completed = false;
  assert.equal(buildPendingReviews([c], ss, now(29)).length, 2);
});
test("Finished course disappears including old pending work", () => {
  assert.equal(
    buildPendingReviews(
      [course],
      [session(1, "2026-10-01"), session(14, "2026-10-29")],
      now(29),
    ).length,
    0,
  );
});
test("Postponed final date does not hide course early; configurable total", () => {
  assert.equal(
    buildPendingReviews(
      [course],
      [session(1, "2026-10-01"), session(14, "2026-11-05")],
      now(29),
    ).length,
    1,
  );
  assert.equal(
    buildPendingReviews(
      [{ ...course, totalSessions: 2 }],
      [session(1, "2026-10-01"), session(2, "2026-10-08")],
      now(29),
    ).length,
    0,
  );
});
test("Skip cancelled, leave, covered lessons and respect legacy sent flags", () => {
  const ss = [
    session(1, "2026-10-01", "cancelled"),
    session(2, "2026-10-08", "covered"),
    session(3, "2026-10-15", "leave"),
    session(4, "2026-10-22"),
  ];
  assert.equal(
    buildPendingReviews(
      [{ ...course, sessionReviews: { 4: { status: "sent" } } }],
      ss,
      now(29),
    ).length,
    0,
  );
  assert.equal(
    buildPendingReviews(
      [
        {
          ...course,
          sessionReviews: { 4: { status: "sent", completed: false } },
        },
      ],
      ss,
      now(29),
    ).length,
    1,
  );
});
test("Fallback duration and midnight end are handled", () => {
  const s = { date: "2026-10-01", startTime: "23:00" };
  assert.equal(sessionEndTime(s, course), new Date(2026, 9, 2, 1).getTime());
});

test("Explicit end time after midnight is on the following day", () => {
  assert.equal(
    sessionEndTime(
      { date: "2026-10-01", startTime: "22:00", endTime: "00:00" },
      course,
    ),
    new Date(2026, 9, 2, 0).getTime(),
  );
});
