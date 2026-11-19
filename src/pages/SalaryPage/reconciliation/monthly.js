export function monthlyPayrollId(month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Tháng đối soát không hợp lệ.');
  return `payrollRun_month_${month}`;
}
export function selectMonthlyPayroll(history, month) {
  const canonical = history.find(r => r.id === monthlyPayrollId(month));
  if (canonical) return canonical;
  return history.filter(r => r.month === month)
    .sort((a,b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))[0] || null;
}
