import test from "node:test";
import assert from "node:assert/strict";
import { overlapsMonth, filterHolidaysByMonth } from "../src/utils/dateRange.js";

test("includes single day and both month boundaries", () => {
  for (const day of ["2026-11-01", "2026-11-30"]) assert.ok(overlapsMonth(day, day, "2026-11"));
  assert.equal(overlapsMonth("2026-10-31", "2026-10-31", "2026-11"), false);
  assert.equal(overlapsMonth("2026-12-01", "2026-12-01", "2026-11"), false);
});
test("cross-month leave belongs to both months and retains full range", () => {
  const holiday = { id: "a", startDate: "2026-10-30", endDate: "2026-11-03" };
  for (const month of ["2026-10", "2026-11"]) assert.deepEqual(filterHolidaysByMonth([holiday], month), [holiday]);
});
test("handles year crossing and leap day", () => {
  assert.ok(overlapsMonth("2026-12-30", "2027-01-03", "2027-01"));
  assert.ok(overlapsMonth("2024-02-29", "2024-03-02", "2024-02"));
  assert.ok(overlapsMonth("2026-01-01", "2026-12-31", "2026-06"));
});
test("legacy single day, reversed ranges and invalid month", () => {
  assert.ok(overlapsMonth("2026-11-07", null, "2026-11"));
  assert.equal(overlapsMonth("2026-11-10", "2026-11-01", "2026-11"), false);
  assert.equal(overlapsMonth("2026-11-07", null, "2026-13"), false);
  assert.equal(overlapsMonth("", "", "2026-11"), false);
});
test("sorts chronologically without changing source data used by salary calculations", () => {
  const source = [
    { id: "b", startDate: "2026-11-20", endDate: "2026-11-20", kind: "personal" },
    { id: "old", startDate: "2026-08-01", endDate: "2026-08-07" },
    { id: "a", startDate: "2026-11-01", endDate: "2026-11-01", applyTo: "class1" },
  ];
  const before = structuredClone(source);
  assert.deepEqual(filterHolidaysByMonth(source, "2026-11").map(x => x.id), ["a", "b"]);
  assert.deepEqual(source, before);
  assert.deepEqual(filterHolidaysByMonth(source, "2027-01"), []);
});
