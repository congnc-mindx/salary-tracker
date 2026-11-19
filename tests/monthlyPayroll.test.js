import test from 'node:test';
import assert from 'node:assert/strict';
import {monthlyPayrollId,selectMonthlyPayroll} from '../src/pages/SalaryPage/reconciliation/monthly.js';
test('monthly payroll uses a stable ID and rejects invalid months',()=>{
 assert.equal(monthlyPayrollId('2026-10'),'payrollRun_month_2026-10');
 assert.throws(()=>monthlyPayrollId('2026-13'));
});
test('legacy migration picks latest update for selected month; canonical replacement wins',()=>{
 const old={id:'payrollRun_old',month:'2026-10',createdAt:1,updatedAt:5};
 const other={id:'payrollRun_other',month:'2026-09',createdAt:9};
 const newer={id:'payrollRun_new',month:'2026-10',createdAt:3};
 assert.equal(selectMonthlyPayroll([other,newer,old],'2026-10'),old);
 const canonical={id:monthlyPayrollId('2026-10'),month:'2026-10',createdAt:2};
 assert.equal(selectMonthlyPayroll([old,canonical],'2026-10'),canonical);
 assert.equal(selectMonthlyPayroll([old],'2026-11'),null);
});
