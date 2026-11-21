import test from 'node:test';
import assert from 'node:assert/strict';
import {payrollValue} from '../src/pages/SalaryPage/reconciliation/payrollLedger.js';
import {comparePayroll,itemToken} from '../src/pages/SalaryPage/reconciliation/model.js';
const source={id:'r',email:'a',stt:'1',centre:'505MK',rawClass:'MK-PTB44',date:'2026-10-05',time:'21:00',type:'makeup',status:'CHECKED',hours:2,price:160000,total:320000};
const expected=[240000,120000].map((total,i)=>({id:'e'+i,campus:'MK',classKey:'MK-PTB44',title:'MK-PTB44',date:'2026-10-0'+(6+i),time:'18:00',type:'makeup',status:'confirmed',hours:total/120000,total}));
const run={rows:[source],expected,aliases:{},links:{r:['e0','e1']},decisions:{},complete:true};
test('grouped source pays once, not source plus schedule',()=>{assert.equal(payrollValue(run).gross,320000);assert.equal(payrollValue(run).net,288000);});
test('hold removes source payment; resolving restores only source amount',()=>{const item=comparePayroll(run.rows,expected,{},run.links)[0];const hold={...run,decisions:{[item.key]:{status:'ask',note:'',token:itemToken(item)}}};assert.equal(payrollValue(hold).gross,0);assert.equal(payrollValue(hold).held,320000);hold.decisions[item.key].status='resolved';assert.equal(payrollValue(hold).gross,320000);});
test('historical settlement replaces schedules and preserves unknown fields',()=>{assert.deepEqual(payrollValue({...run,settlement:{gross:500000,tax:null,net:null}}),{gross:500000,tax:null,net:null,held:0,actualTax:false});});
test('actual tax is not recomputed as ten percent',()=>{const v=payrollValue({...run,settlement:{gross:500000,tax:20000,net:480000}});assert.equal(v.tax,20000);assert.equal(v.actualTax,true);});
test('partial payroll cannot replace monthly income',()=>assert.equal(payrollValue({...run,complete:false}),null));
import {scopePayrollExpected} from '../src/pages/SalaryPage/reconciliation/scope.js';
test('deferred October session follows November payroll scope without changing teaching date',()=>{
 const e={...expected[0],id:'gb07',date:'2026-10-18'};
 const october={month:'2026-10',scope:['505MK'],aliases:{campuses:{}},links:{},deferred:{gb07:'2026-11'}};
 assert.equal(scopePayrollExpected([e],october,[]).length,0);
 const november={...october,month:'2026-11',deferred:{}};
 assert.equal(scopePayrollExpected([e],november,[october])[0].date,'2026-10-18');
});
test('prior month linked session is included in payment month and excluded from original payroll scope',()=>{
 const e={...expected[0],id:'jsi',date:'2026-09-06'};
 const october={month:'2026-10',scope:['505MK'],aliases:{campuses:{}},links:{r:['jsi']}};
 const september={...october,month:'2026-09',links:{}};
 assert.equal(scopePayrollExpected([e],october,[september]).length,1);
 assert.equal(scopePayrollExpected([e],september,[october]).length,0);
});
import {financialSummary} from '../src/pages/SalaryPage/reconciliation/payrollLedger.js';
test('year statistics replace imported months and retain other schedule estimates',()=>{
 const s=financialSummary([{month:'2026-09',total:0},{month:'2026-10',total:360000},{month:'2026-11',total:120000}],{'2026-09':{gross:100000,tax:5000,net:95000,actualTax:true},'2026-10':{gross:320000,tax:32000,net:288000,actualTax:false}});
 assert.equal(s.gross,540000);assert.equal(s.tax,49000);assert.equal(s.net,491000);assert.equal(s.months,2);
});
test('salary-only imports use table total without inventing sessions',()=>assert.equal(payrollValue({...run,salaryOnly:true,expected:[],links:{}}).gross,320000));
