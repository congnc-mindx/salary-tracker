import test from 'node:test';import assert from 'node:assert/strict';
import {parsePayroll,parseSlot,parseNumeric} from '../src/pages/SalaryPage/reconciliation/parser.js';
import {comparePayroll,resolveRow,summaryOf,itemToken,inheritDecisions,changesSince,canonicalClass} from '../src/pages/SalaryPage/reconciliation/model.js';
import {validatePayrollDocument} from '../src/pages/SalaryPage/reconciliation/validation.js';
import {SAMPLE,HEAD,sourceLine} from './fixtures/payrollSample.js';
const rows=parsePayroll(SAMPLE).rows;
const expected=rows.map(r=>{const mapped=resolveRow(r);return {id:'e'+r.stt,title:mapped.classKey,classKey:mapped.classKey,campus:mapped.campus,type:r.type,date:r.date,time:r.time,hours:r.hours,total:r.total,price:r.price,students:null,status:'confirmed'};});
test('provided sample: 50 rows, 97 hours, 15.4M and correct role counts',()=>{const result=parsePayroll(SAMPLE);assert.equal(result.errors.length,0);assert.equal(result.ignored,2);assert.equal(rows.length,50);assert.equal(rows.reduce((n,r)=>n+r.hours,0),97);assert.equal(rows.reduce((n,r)=>n+r.total,0),15400000);assert.equal(rows.filter(r=>r.type==='class').length,44);assert.equal(rows.filter(r=>r.type==='substitute').length,2);assert.equal(rows.filter(r=>r.type==='makeup').length,4);assert.deepEqual(result.months,['2026-10']);});
test('quoted multiline notes and CRLF preserve empty cells',()=>{const text=HEAD+'\r\n'+sourceLine({note:'"Dòng 1\nDòng 2\tghi chú"'});const p=parsePayroll(text);assert.equal(p.errors.length,0);assert.equal(p.rows[0].note,'Dòng 1\nDòng 2\tghi chú');assert.equal(p.rows[0].price,160000);});
test('dates use UTC+7 independent of system timezone and reject impossible dates',()=>{assert.deepEqual(parseSlot('Sat Oct 31 2026 20:00:00 GMT+0000 (UTC)'),{date:'2026-11-01',time:'03:00'});assert.deepEqual(parseSlot('01/10/2026 19:00'),{date:'2026-10-01',time:'19:00'});assert.throws(()=>parseSlot('31/02/2026 19:00'));assert.equal(parseNumeric('160,000',true),160000);assert.equal(parseNumeric('160.000',true),160000);assert.equal(parseNumeric('1,5'),1.5);assert.throws(()=>parseNumeric('abc'));});
test('bad payroll row is reported, not silently omitted; missing header fails',()=>{const p=parsePayroll(HEAD+'\n'+sourceLine({})+'\n'+sourceLine({id:2}).replace('320,000','oops'));assert.equal(p.rows.length,1);assert.equal(p.errors.length,1);assert.throws(()=>parsePayroll(sourceLine({})));});
test('full sample matches one-to-one with identical expected schedule',()=>{const result=comparePayroll(rows,expected);assert.equal(result.length,50);assert.ok(result.every(i=>i.group==='matched'));assert.deepEqual(summaryOf(result),{source:15400000,expected:15400000,needsReview:0});});
test('makeup 10993 flags +80k against 75 percent hourly rule',()=>{const e=expected.map(r=>r.id==='e10993'?{...r,price:120000,total:240000}:r);const result=comparePayroll(rows,e);const issue=result.find(i=>i.source?.stt==='10993');assert.equal(issue.delta,80000);assert.equal(issue.group,'different');assert.ok(issue.issues.includes('Đơn giá dạy bù khác quy tắc'));assert.equal(summaryOf(result).needsReview,1);});
test('canonicalization only strips C4K/ROB; HB/campus aliases require explicit choices',()=>{assert.equal(canonicalClass('OCP-ROB-PREI02'),'OCP-PREI02');const r=rows.find(r=>r.centre==='HN-VHRS');const e={...expected.find(e=>e.id==='e'+r.stt),campus:'LB',classKey:'LB-JSI06'};assert.equal(comparePayroll([r],[e])[0].group,'ambiguous');assert.equal(comparePayroll([r],[e],{campuses:{'HN-VHRS':'LB'},classes:{'VHRS-JSI06-HB':'LB-JSI06'}})[0].group,'matched');});
test('duplicates never consume expected row automatically, nor can manual links consume twice',()=>{const r=rows[0],duplicate={...r,id:r.id+'dup'};const result=comparePayroll([r,duplicate],[expected[0]]);assert.equal(result.filter(i=>i.expected).length,1);assert.equal(result.filter(i=>i.group==='matched').length,0);const linked=comparePayroll([r,duplicate],[expected[0]],{},{[r.id]:expected[0].id,[duplicate.id]:expected[0].id});assert.equal(linked.filter(i=>i.group==='matched').length,0);assert.equal(linked.filter(i=>i.expected).length,1);});
test('time mismatch offers candidates without auto matching; explicit mapping retains discrepancy',()=>{const r={...rows[0],time:'20:00'};let result=comparePayroll([r],[expected[0]]);assert.equal(result[0].expected,null);assert.equal(result[0].candidates.length,1);result=comparePayroll([r],[expected[0]],{},{[r.id]:expected[0].id});assert.ok(result[0].issues.includes('Khác ngày / giờ'));});
test('partial scope never claims missing schedules and unknown roles never auto match',()=>{assert.equal(comparePayroll([],expected,{}, {},{},false).length,0);const r={...rows[0],type:'unknown'};assert.equal(comparePayroll([r],[expected[0]])[0].group,'ambiguous');});
test('resolved marks only survive identical source/expected data and reordered rows',()=>{const result=comparePayroll([rows[0]],[{...expected[0],total:300000}]);const d={status:'resolved',note:'Approved',token:itemToken(result[0])};const old={rows:[rows[0]],links:{},decisions:{[result[0].key]:d}};const next={...rows[0],id:'newLine',line:999};const inherited=inheritDecisions(old,[next]);assert.ok(comparePayroll([next],[{...expected[0],total:300000}],{},inherited.links,inherited.decisions)[0].decision);assert.equal(comparePayroll([{...next,total:310000}],[{...expected[0],total:300000}],{},inherited.links,inherited.decisions)[0].decision,null);});
test('revisions compare original STT, not copied row position',()=>{const next=rows.map(r=>({...r,line:r.line+1,id:r.id+'x'}));assert.deepEqual(changesSince(rows,next),{added:0,removed:0,changed:0});next[0].total++;assert.equal(changesSince(rows,next).changed,1);});
test('history schema rejects malformed records and unknown document names',()=>{assert.throws(()=>validatePayrollDocument('other',{}));assert.throws(()=>validatePayrollDocument('payrollAliases',{classes:[]}));assert.equal(validatePayrollDocument('payrollAliases',{classes:{a:'b'},campuses:{},types:{}}),true);});

test('Firestore key order does not invalidate resolved decisions',()=>{
 const first=comparePayroll([rows[0]],[expected[0]])[0];
 const decision={status:'resolved',note:'Verified',token:itemToken(first)};
 const reverse=o=>Object.fromEntries(Object.entries(o).reverse());
 const next=comparePayroll([reverse(rows[0])],[reverse(expected[0])],{}, {},{[first.key]:decision})[0];
 assert.equal(next.decision?.status,'resolved');
});

test('JSON backup retains payroll snapshots, aliases and decisions',async()=>{
 const {createBackup,validateBackup,COLLECTIONS,portableSetting}=await import('../src/services/dataTransfer/backupModel.js');
 const data=Object.fromEntries(COLLECTIONS.map(n=>[n,[]]));
 const aliases={campuses:{Oceanpark1:'OCP'},classes:{},types:{}};
 const snapshot={schemaVersion:1,complete:true,createdAt:1,month:'2026-10',teacher:'teacher@example.test',scope:['505MK'],rows:[rows[0]],expected:[expected[0]],aliases,links:{},decisions:{}};
 data.settings=[{id:'payrollAliases',data:aliases},{id:'payrollRun_test',data:snapshot}];
 const backup=createBackup(data,'owner');
 assert.ok(portableSetting('payrollRun_test'));
 assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(backup))).collections.settings,data.settings);
});
