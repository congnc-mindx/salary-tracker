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
