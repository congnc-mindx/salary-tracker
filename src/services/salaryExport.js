import { getExtraAmount, isPaidStatus } from "./income.js";
import { applyHolidaysToExtras } from "../utils/holidays.js";
import { dateFromDateTime } from "../utils/date.js";

const ROUND = (value) => Math.max(0, Math.round(Number(value) || 0));
const validPeriod = (period) => /^20\d\d-(0[1-9]|1[0-2])$/.test(period);

/** Reuse the Salary Tracker's calculated sessions and its pay-rate helpers.
 * Confirmed teaching sessions mean performed work, NOT cash received.
 */
export function buildSalaryExports({ sessions = [], extras = [], holidays = [], settings }) {
  const periods = new Map();
  const entry = (period) => {
    if (!validPeriod(period)) return null;
    if (!periods.has(period)) periods.set(period, { period, expectedIncome: 0, confirmedWork: 0, waitingWork: 0, classes: 0, extras: 0 });
    return periods.get(period);
  };
  for (const session of sessions) {
    if (!isPaidStatus(session.status)) continue;
    const row = entry(String(session.date || "").slice(0, 7));
    if (!row) continue;
    const amount = ROUND(session.amount);
    row.expectedIncome += amount;
    row.classes += amount;
    if (session.status === "confirmed") row.confirmedWork += amount;
    else row.waitingWork += amount;
  }
  for (const extra of applyHolidaysToExtras(extras, holidays)) {
    if (!isPaidStatus(extra.status)) continue;
    const row = entry(String(dateFromDateTime(extra.datetime) || "").slice(0, 7));
    if (!row) continue;
    const amount = ROUND(getExtraAmount(extra, settings));
    row.expectedIncome += amount;
    row.extras += amount;
    if (extra.status === "confirmed") row.confirmedWork += amount;
    else row.waitingWork += amount;
  }
  return [...periods.values()].sort((a, b) => a.period.localeCompare(b.period));
}
