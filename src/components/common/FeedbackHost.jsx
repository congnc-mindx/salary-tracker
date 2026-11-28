import {useEffect,useState} from 'react';
import {CheckCircle,Info,TriangleAlert,CircleAlert,X} from 'lucide-react';
import {subscribeFeedback,notify} from './feedback';
import ModalShell from './ModalShell';
import Button from './Button';
const tones={success:'border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',info:'border-sky-600/30 bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200',warning:'border-amber-600/30 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',error:'border-red-600/30 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'};
function Toast({item,onClose}) {
 const [paused,setPaused]=useState(false),[leaving,setLeaving]=useState(false),[busy,setBusy]=useState(false);
 function close(){setLeaving(true);}
 useEffect(()=>{if(!leaving)return;const timer=setTimeout(onClose,180);return ()=>clearTimeout(timer);},[leaving,onClose]);
 useEffect(()=>{if(paused||busy)return;const timer=setTimeout(close,item.duration || (item.action?10000:5000));return ()=>clearTimeout(timer);},[paused,busy,item]);
 const Icon={success:CheckCircle,info:Info,warning:TriangleAlert,error:CircleAlert}[item.type||'success'];
 return <div role={item.type==='error'?'alert':'status'} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocus={()=>setPaused(true)} onBlur={()=>setPaused(false)} className={`feedback-toast flex items-start gap-3 rounded-2xl border p-4 shadow-xl ${tones[item.type||'success']} ${leaving?'opacity-0 translate-y-3':''}`}><Icon size={22} className="shrink-0"/><div className="min-w-0 flex-1 text-sm"><p>{item.message}</p>{item.action&&<button disabled={busy} onClick={async()=>{setBusy(true);try {await item.action();close();}catch{notify('Chưa thực hiện được. Hãy thử lại.',{type:'error'});}finally{setBusy(false);}}} className="mt-2 font-bold underline disabled:opacity-50">{item.actionLabel||'Hoàn tác'}</button>}</div><button aria-label="Đóng thông báo" onClick={close}><X size={18}/></button></div>;
}
export default function FeedbackHost(){
 const [toasts,setToasts]=useState([]),[dialogs,setDialogs]=useState([]);
 useEffect(()=>subscribeFeedback(e=>e.kind==='confirm'?setDialogs(v=>[...v,e]):setToasts(v=>[...v.slice(-3),e])),[]);
 const dialog=dialogs[0];function answer(value){dialog.resolve(value);setDialogs(v=>v.slice(1));}
 return <><div className="pointer-events-auto fixed bottom-5 right-5 z-[200] flex w-[min(400px,calc(100vw-40px))] flex-col gap-3">{toasts.map(t=><Toast key={t.id} item={t} onClose={()=>setToasts(v=>v.filter(x=>x.id!==t.id))}/>)}</div>{dialog&&<div className="relative z-[300]"><ModalShell title={dialog.title||'Xác nhận thao tác'} onClose={()=>answer(false)} footer={<div className="flex justify-end gap-2"><Button onClick={()=>answer(false)}>Hủy</Button><Button variant="primary" onClick={()=>answer(true)}>{dialog.confirmLabel||'Xác nhận'}</Button></div>}><p className="whitespace-pre-wrap text-sm leading-6">{dialog.message}</p></ModalShell></div>}</>;
}
