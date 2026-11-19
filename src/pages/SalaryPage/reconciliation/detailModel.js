import { getCampusPayrollCodes } from '../../../utils/courseDisplay.js';
export function payrollCampusLabel(row, source) {
  if (row.centre) return row.centre;
  if (source?.campus === row.campus && source.centre) return source.centre;
  return getCampusPayrollCodes(row.campusName)[0] || row.campus;
}
export function candidateSessions(expected, source, type, allCampuses = false) {
  return expected.filter(e => e.type === type && (allCampuses || e.campus === source.campus));
}
