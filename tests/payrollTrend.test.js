import test from 'node:test';
import assert from 'node:assert/strict';
import {payrollTrend,payrollValue,financialSummary} from '../src/pages/SalaryPage/reconciliation/payrollLedger.js';
const trend=[{month:'2026-07',total:300,hours:2,types:[],waitingCount:1},{month:'2026-08',total:500,types:[],waitingCount:2},{month:'2026-09',total:700,types:[],waitingCount:1}];
test('year chart uses same monthly amounts as headline, without adding schedule estimates twice',()=>{
 const byMonth={'2026-07':{gross:1000,breakdown:{trial:1000}},'2026-08':{gross:2000}};
 const chart=payrollTrend(trend,byMonth,[{key:'trial',label:'Trải nghiệm',color:'#f97316'}]);
 assert.deepEqual(chart.map(m=>m.total),[1000,2000,700]);
 assert.equal(chart.reduce((n,m)=>n+m.total,0),financialSummary(trend,byMonth).gross);
 assert.equal(chart[0].types[0].total,1000);assert.equal(chart[0].waitingCount,0);
 assert.equal(chart[1].types[0].label,'Chưa phân bổ');assert.equal(chart[1].types[0].total,2000);
 assert.equal(chart[2],trend[2]);
});
test('old settlement retains actual tax and net while chart displays its gross',()=>{
 const v=payrollValue({settlement:{gross:15280000,tax:1518000,net:13662000}});
 const chart=payrollTrend(trend,{'2026-08':v},[]);
 assert.equal(chart[1].total,15280000);assert.equal(v.tax,1518000);assert.equal(v.net,13662000);
});
