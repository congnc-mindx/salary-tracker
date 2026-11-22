// The selected payroll month owns every imported payment, including arrears.
// Teaching dates are retained for reconciliation, never used to drop payments.
export function importScope(rows, teacher, excluded = []) {
  const ownRows = rows.filter(row => row.email === teacher);
  const centres = [...new Set(ownRows.map(row => row.centre))];
  const scope = centres.filter(centre => !excluded.includes(centre));
  return {rows: ownRows, centres, scope, picked: ownRows.filter(row => scope.includes(row.centre))};
}
