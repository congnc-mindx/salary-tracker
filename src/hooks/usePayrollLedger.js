import {useEffect,useState} from 'react';
import {collection,query,orderBy,documentId,startAt,endAt,onSnapshot} from 'firebase/firestore';
import {getIncomeContext} from '../services/incomeFirestore';
import {selectMonthlyPayroll} from '../pages/SalaryPage/reconciliation/monthly';
import {payrollValue} from '../pages/SalaryPage/reconciliation/payrollLedger';
export default function usePayrollLedger(userId,month,year=false){
 const [runs,setRuns]=useState([]),[error,setError]=useState('');
 useEffect(()=>{setRuns([]);if(!userId)return;try{const {db}=getIncomeContext(userId);return onSnapshot(query(collection(db,'users',userId,'settings'),orderBy(documentId()),startAt('payrollRun_'),endAt('payrollRun_\uf8ff')),s=>{setRuns(s.docs.map(d=>({...d.data(),id:d.id})));setError('');},e=>setError(e.message));}catch(e){setError(e.message);}},[userId]);
 const months=year?Array.from({length:12},(_,i)=>month.slice(0,4)+'-'+String(i+1).padStart(2,'0')):[month];
 const values=months.map(m=>payrollValue(selectMonthlyPayroll(runs,m))).filter(Boolean);
 return {value:values.length?{gross:values.reduce((n,v)=>n+v.gross,0),tax:values.every(v=>v.tax!=null)?values.reduce((n,v)=>n+v.tax,0):null,net:values.every(v=>v.net!=null)?values.reduce((n,v)=>n+v.net,0):null,actualTax:values.every(v=>v.actualTax),months:values.length}:null,error};
}
