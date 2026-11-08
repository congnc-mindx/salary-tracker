import test from "node:test";
import assert from "node:assert/strict";
import {
  buildStatistics,
  monthWindow,
} from "../src/pages/SalaryPage/statisticsModel.js";
const row = (id, overrides = {}) => ({
  id,
  groupKey: id,
  title: id,
  date: "2026-11-08",
  type: "class",
  status: "confirmed",
  amount: 300000,
  hours: 2,
  ...overrides,
});
test("month window crosses years correctly", () => {
  assert.deepEqual(monthWindow("2027-02"), [
    "2026-09",
    "2026-10",
    "2026-11",
    "2026-12",
    "2027-01",
    "2027-02",
  ]);
});
test("totals reconcile across states, work types and campuses", () => {
  const data = [
    row("a"),
    row("b", {
      status: "planned",
      type: "makeup",
      hours: 1,
      amount: 112500,
      campus: "OCP",
    }),
    row("c", { status: "planned", type: "trial", amount: 80000, hours: 1 }),
  ];
  const s = buildStatistics(data, "2026-11");
  assert.equal(s.total, 492500);
  assert.equal(s.confirmed + s.waiting, s.total);
  assert.equal(
    s.types.reduce((sum, x) => sum + x.total, 0),
    s.total,
  );
  assert.equal(
    s.campuses.reduce((sum, x) => sum + x.total, 0),
    s.total,
  );
  assert.equal(
    s.groups.reduce((sum, x) => sum + x.total, 0),
    s.total,
  );
  assert.equal(s.hours, 4);
  assert.equal(s.confirmedHours + s.waitingHours, s.hours);
  assert.equal(
    s.campuses.find((x) => x.title === "Chưa xác định").total,
    380000,
  );
});
test("excluded schedules cannot inflate totals or hours", () => {
  const s = buildStatistics(
    ["leave", "covered", "cancelled"].map((status, i) =>
      row(String(i), { status }),
    ),
    "2026-11",
  );
  assert.equal(s.total, 0);
  assert.equal(s.hours, 0);
  assert.equal(s.count, 0);
});
test("group detail preserves every lesson and separates months", () => {
  const rows = [
    row("1", { groupKey: "course:a" }),
    row("2", { groupKey: "course:a", status: "planned" }),
    row("3", { date: "2026-10-31" }),
  ];
  const s = buildStatistics(rows, "2026-11");
  assert.equal(s.groups.length, 1);
  assert.equal(s.groups[0].rows.length, 2);
  assert.equal(s.trend.at(-2).total, 300000);
  assert.equal(s.total, 600000);
});
test("zero revenue sessions still contribute workload; empty month is safe", () => {
  const s = buildStatistics([row("zero", { amount: 0 })], "2026-11");
  assert.equal(s.total, 0);
  assert.equal(s.hours, 2);
  const empty = buildStatistics([], "2026-11");
  assert.equal(empty.total, 0);
  assert.equal(empty.types.length, 5);
  assert.equal(empty.trend.length, 6);
});
test("non numeric inputs are bounded and input arrays stay unchanged", () => {
  const rows = [
    row("a", { amount: "300000", hours: "2" }),
    row("b", { amount: NaN, hours: undefined }),
  ];
  const before = structuredClone(rows);
  const s = buildStatistics(rows, "2026-11");
  assert.equal(s.total, 300000);
  assert.equal(s.hours, 2);
  assert.deepEqual(rows, before);
});
