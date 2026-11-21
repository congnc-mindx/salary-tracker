import {selectMonthlyPayroll} from "./monthly.js";
import {defaultCampus} from "./model.js";
export function scopePayrollExpected(all, r, history) {
    const campuses = new Set(
      r.scope.map((c) => r.aliases.campuses[c] || defaultCampus(c)),
    );
    const ids = new Set(Object.values(r.links || {}).flat().filter(Boolean));
    const monthlyHistory = [...new Set(history.map(h=>h.month))].map(m=>selectMonthlyPayroll(history,m));
    const paidElsewhere = new Set(monthlyHistory.filter(h=>h.month!==r.month).flatMap(h=>Object.values(h.links||{}).flat()));
    const incoming = new Set(monthlyHistory.filter(h=>h.month!==r.month).flatMap(h=>Object.entries(h.deferred||{}).filter(([,m])=>m===r.month).map(([id])=>id)));
    return all.filter(e => ids.has(e.id) || (!paidElsewhere.has(e.id) && (incoming.has(e.id) || (e.date.startsWith(r.month) && campuses.has(e.campus) && !r.deferred?.[e.id]))));
  }
