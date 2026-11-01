import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { getIncomeContext } from "../../services/incomeFirestore";
import { buildSalaryExports } from "../../services/salaryExport";

const FIELDS = ["expectedIncome", "confirmedWork", "waitingWork", "classes", "extras"];
const changed = (a, b) => FIELDS.some((key) => Number(a?.[key] || 0) !== Number(b?.[key] || 0));

/** Publishes read-only per-month income projections for the other Firebase project.
 * Nothing is marked 'received' here. Runs when authenticated Salary Tracker is open.
 */
export default function SalaryIncomePublisher({ userId, data, summary }) {
  const [error, setError] = useState("");
  const projection = useMemo(() => buildSalaryExports({
    sessions: summary.sessions,
    extras: data.extras,
    holidays: data.holidays,
    settings: data.settings,
  }), [summary.sessions, data.extras, data.holidays, data.settings]);

  useEffect(() => {
    if (!userId || data.loading || data.loadError || data.saving) return;
    let cancelled = false;
    const job = setTimeout(async () => {
      try {
        const { db } = getIncomeContext(userId);
        const base = collection(db, "users", userId, "incomeExports");
        const existing = await getDocs(base);
        if (cancelled) return;
        const old = new Map(existing.docs.map((item) => [item.id, item.data()]));
        const next = new Map(projection.map((item) => [item.period, item]));
        // Clear obsolete periods to prevent stale projections after deletion.
        for (const period of old.keys()) {
          if (!next.has(period)) next.set(period, { period, expectedIncome: 0, confirmedWork: 0, waitingWork: 0, classes: 0, extras: 0 });
        }
        const dirty = [...next.values()].filter((item) => changed(old.get(item.period), item) || !old.has(item.period));
        for (let start = 0; start < dirty.length; start += 350) {
          if (cancelled) return;
          const batch = writeBatch(db);
          for (const value of dirty.slice(start, start + 350)) {
            batch.set(doc(db, "users", userId, "incomeExports", value.period), {
              ...value, schemaVersion: 1, updatedAt: Date.now(),
            });
          }
          await batch.commit();
        }
        if (!cancelled) setError("");
      } catch (reason) {
        if (!cancelled) setError("Không xuất được bảng lương cho zWhisFlow: " + (reason?.message || "Lỗi kết nối Firebase"));
      }
    }, 700);
    return () => { cancelled = true; clearTimeout(job); };
  }, [userId, data.loading, data.loadError, data.saving, projection]);
  return error ? <div role="alert" className="mx-4 my-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{error}</div> : null;
}
