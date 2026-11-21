import test from 'node:test';
import assert from 'node:assert/strict';
import {comparePayroll,summaryOf} from '../src/pages/SalaryPage/reconciliation/model.js';
const source={id:'r',email:'a',stt:'1',centre:'505MK',rawClass:'MK-PTB44',date:'2026-10-05',time:'21:00',type:'makeup',status:'CHECKED',hours:2,price:160000,total:320000};
const expected=[240000,120000].map((total,i)=>({id:'e'+i,campus:'MK',classKey:'MK-PTB44',title:'MK-PTB44',date:'2026-10-0'+(6+i),time:'18:00',type:'makeup',status:'confirmed',hours:total/120000,total}));
test('two sessions grouped once retain full totals and expose 40k discrepancy',()=>{
 const rows=comparePayroll([source],expected,{}, {r:['e0','e1']});
 assert.equal(rows.length,1);assert.equal(rows[0].delta,-40000);
 assert.equal(summaryOf(rows).expected,360000);assert.equal(rows[0].expected.members.length,2);
});
test('overlapping grouped links never consume the same session twice',()=>{
 const rows=comparePayroll([source,{...source,id:'r2',stt:'2',time:'22:00'}],expected,{}, {r:['e0','e1'],r2:['e0']});
 assert.equal(summaryOf(rows).expected,360000);
 assert.ok(rows.filter(r=>r.source).every(r=>r.issues.some(x=>x.includes('trùng'))));
});
