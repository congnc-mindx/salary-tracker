import test from 'node:test';
import assert from 'node:assert/strict';
import {payrollCampusLabel,candidateSessions} from '../src/pages/SalaryPage/reconciliation/detailModel.js';
test('display payroll codes consistently without hiding a campus mismatch',()=>{
 const source={centre:'98NVC',campus:'NVC'};
 assert.equal(payrollCampusLabel(source,source),'98NVC');
 assert.equal(payrollCampusLabel({campus:'NVC',campusName:'Nguyễn Văn Cừ'},source),'98NVC');
 assert.equal(payrollCampusLabel({campus:'MK',campusName:'Minh Khai'},source),'505MK');
});
test('manual pairing defaults to same campus and explicit type, allows expanding campus scope',()=>{
 const rows=[{id:1,campus:'NVC',type:'makeup'},{id:2,campus:'NVC',type:'class'},{id:3,campus:'MK',type:'makeup'}];
 assert.deepEqual(candidateSessions(rows,{campus:'NVC'},'makeup').map(r=>r.id),[1]);
 assert.deepEqual(candidateSessions(rows,{campus:'NVC'},'makeup',true).map(r=>r.id),[1,3]);
});
