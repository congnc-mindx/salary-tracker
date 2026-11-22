import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSlot,parsePayroll} from '../src/pages/SalaryPage/reconciliation/parser.js';
import {importScope} from '../src/pages/SalaryPage/reconciliation/importScope.js';

test('valid nonzero seconds keep their minute after UTC+7 conversion',()=>{
 for(const [raw,date] of [['Wed Feb 11 2026 18:00:40 GMT+0000 (UTC)','2026-02-12'],['Fri Dec 12 2025 18:00:32 GMT+0000 (UTC)','2025-12-13']])
  assert.deepEqual(parseSlot(raw),{date,time:'01:00'});
 assert.deepEqual(parseSlot('2026-02-11 18:00:59'),{date:'2026-02-11',time:'18:00'});
 assert.deepEqual(parseSlot('11/02/2026 18:00:32'),{date:'2026-02-11',time:'18:00'});
});
test('invalid seconds and impossible timezone offsets remain rejected',()=>{
 for(const raw of ['Wed Feb 11 2026 18:00:60 GMT+0000','Wed Feb 11 2026 18:00:00 GMT+1401','2026-02-11 18:00:60','31/02/2026 18:00:32']) assert.throws(()=>parseSlot(raw));
});
test('fixed trial with seconds is preserved in import total',()=>{
 const cells=['STT','Centre shortname','Type','Class name','Teacher email','Class role/Office hour type','Status','Slot time','Slot duration','Student count','Price/h','Total'];
 const row=['1','MK','OFFICE_HOURS','undefined','teacher@example.test','Fixed','CHECKED','Wed Feb 11 2026 18:00:40 GMT+0000',3,2,140000,140000];
 const p=parsePayroll(cells.join('\t')+'\n'+row.join('\t'));
 assert.deepEqual(p.errors,[]);assert.equal(p.rows[0].total,140000);assert.equal(p.rows[0].trialMode,'OFF');
});
test('payroll import retains earlier-month arrears, only explicit campus exclusions filter rows',()=>{
 const rows=[{email:'me',centre:'MK',date:'2025-12-12',total:140000},{email:'me',centre:'OCP',date:'2025-11-28',total:105000},{email:'other',centre:'MK',total:999999}];
 const all=importScope(rows,'me');assert.equal(all.picked.length,2);assert.equal(all.picked.reduce((n,r)=>n+r.total,0),245000);
 assert.equal(importScope(rows,'me',['OCP']).picked.length,1);
});
