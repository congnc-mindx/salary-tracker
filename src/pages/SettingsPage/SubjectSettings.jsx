import {useState} from 'react';
import {getCatalog} from '../ReviewsPage/subjectCatalog';
import SubjectGroupEditor from '../ReviewsPage/components/SubjectGroupEditor';
import Button from '../../components/common/Button';
export default function SubjectSettings({settings,onSave}) {
 const catalog=getCatalog(settings),[editor,setEditor]=useState(null);
 return <section className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-lg font-black">Bộ môn và học phần</h2><Button variant="primary" onClick={()=>setEditor({})}>Thêm bộ môn</Button></div><div className="grid gap-4 md:grid-cols-2">{[['coding','Codings'],['robotics','Robotics']].map(([key,title])=><section key={key} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><h3 className="mb-3 font-bold">{title}</h3><div className="space-y-2">{catalog.filter(g=>g.category===key).map(g=><button key={g.id} type="button" onClick={()=>setEditor(g)} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl bg-slate-100 px-3 py-2 text-left text-sm dark:bg-slate-800"><span><strong>{g.name}</strong><span className="mt-1 block text-xs text-slate-500">{g.subjects.map(s=>s.code).join(' · ')}</span></span><span className="text-brand-500">Chỉnh sửa</span></button>)}</div></section>)}</div>{editor && <SubjectGroupEditor group={editor.id?editor:undefined} catalog={catalog} onSave={onSave} onClose={()=>setEditor(null)}/>}</section>;
}
