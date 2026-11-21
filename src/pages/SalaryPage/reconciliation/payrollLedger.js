import {comparePayroll} from './model.js';
export function payrollValue(run) {
 if (!run) return null;
 if (run.settlement) return {...run.settlement,held:0,actualTax:run.settlement.tax != null};
 if (!run.complete) return null;
 const items=comparePayroll(run.rows,run.expected||[],run.aliases,run.links,run.decisions,true);
 const held=items.filter(i=>i.decision?.status==='ask').reduce((n,i)=>n+(i.source?.total||0),0);
 const gross=run.rows.reduce((n,r)=>n+r.total,0)-held;
 return {gross,tax:Math.round(gross*.1),net:gross-Math.round(gross*.1),held,actualTax:false};
}

// Replace each month's schedule estimate with its payroll, never add both.
export function financialSummary(scheduleMonths, byMonth) {
 const values=scheduleMonths.map(m=>byMonth[m.month] || {gross:m.total,tax:Math.round(m.total*.1),net:m.total-Math.round(m.total*.1),actualTax:m.total===0});
 return {gross:values.reduce((n,v)=>n+v.gross,0),tax:values.every(v=>v.tax!=null)?values.reduce((n,v)=>n+v.tax,0):null,net:values.every(v=>v.net!=null)?values.reduce((n,v)=>n+v.net,0):null,actualTax:values.every(v=>v.actualTax),months:scheduleMonths.filter(m=>byMonth[m.month]).length};
}
