import { useState } from "react";
import { useSubjectCatalog } from "../SubjectCatalogContext";
import { subjectLevel } from "../subjectCatalog";
import { normalizeSearch } from "../../../utils/courseDisplay";
import SubjectGroupEditor from "./SubjectGroupEditor";
import SessionTemplateManager from "./SessionTemplateManager";
import Button from "../../../components/common/Button";

export default function TemplateGroups({ userId, templates = {}, onFinal, onSaveGroup, onSaveSessionTemplate }) {
  const catalog = useSubjectCatalog();
  const storageKey = `mindx-template-subject:${userId}`;
  const [selection, setSelection] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { return {}; }
  });
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState(null);
  const group = catalog.find(g => g.id === selection.groupId) || catalog[0];
  const subject = group?.subjects.find(s => s.id === selection.subjectId) || group?.subjects[0];
  function select(g, s = g.subjects[0]) {
    const value = {groupId:g.id, subjectId:s?.id};
    setSelection(value);
    try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch {}
  }
  const search = normalizeSearch(query);
  const matches = catalog.filter(g => normalizeSearch(`${g.name} ${g.subjects.map(s=>`${s.code} ${s.name}`).join(' ')}`).includes(search));
  const chip = active => `min-h-11 rounded-xl border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-brand-500 ${active ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'border-slate-200 hover:border-brand-400 dark:border-slate-700'}`;
  return <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
    <aside className="lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto min-w-0 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between gap-2"><h2 className="font-black">Bộ môn</h2><span className="text-xs text-slate-500">{catalog.length} bộ môn</span></div>
      <input aria-label="Tìm bộ môn hoặc mã học phần" placeholder="Tìm bộ môn, mã học phần…" value={query} onChange={e=>setQuery(e.target.value)} className="mb-3 min-h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3 text-sm focus-visible:outline-brand-500 dark:border-slate-700"/>
      <nav aria-label="Danh mục bộ môn" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {[["coding","Codings"],["robotics","Robotics"]].map(([category,label])=><details key={category} open className="min-w-0"><summary className="cursor-pointer py-2 text-sm font-bold">{label}</summary><div className="space-y-2">
        {matches.filter(g=>g.category===category).map(g=><div key={g.id} className="min-w-0">
          <button type="button" aria-pressed={group?.id===g.id} onClick={()=>select(g)} className={`${chip(group?.id===g.id)} w-full`}><strong className="block">{g.name}</strong><span className="mt-1 block text-xs opacity-75">{g.subjects.map(s=>s.code).join(' · ')}</span></button>
          {search && <div className="mt-1 flex flex-wrap gap-1">{g.subjects.filter(s=>normalizeSearch(`${g.name} ${s.code} ${s.name}`).includes(search)).map(s=><button type="button" key={s.id} onClick={()=>select(g,s)} className="min-h-9 rounded-lg px-2 text-xs font-bold text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-950">{s.code} →</button>)}</div>}
        </div>)}
      </div></details>)}
      </nav>
      {!matches.length && <p role="status" className="py-4 text-sm text-slate-500">Không tìm thấy bộ môn hoặc học phần.</p>}
    </aside>
    <section className="min-w-0 space-y-4">
      {group && subject ? <>
        <header className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-slate-500">Mẫu nội dung</p><h2 className="mt-1 text-xl font-black">{group.name}</h2></div><Button onClick={()=>setEditor(group)}>Sửa bộ môn</Button></div>
          <nav aria-label="Học phần" className="mt-4 flex flex-wrap gap-2">{group.subjects.map(s=><button type="button" key={s.id} aria-pressed={s.id===subject.id} onClick={()=>select(group,s)} className={chip(s.id===subject.id)}><strong>{s.code}</strong><span className="ml-2 opacity-75">{subjectLevel(s.code) || s.name}</span></button>)}</nav>
        </header>
        <SessionTemplateManager key={subject.id} embedded userId={userId} subject={subject.id} onSave={onSaveSessionTemplate} finalTemplate={templates[subject.id]} onFinal={()=>onFinal(subject.id)}/>

      </> : <p className="rounded-2xl border border-dashed p-6 text-sm text-slate-500">Chưa có học phần. Chọn “Thêm bộ môn” để bắt đầu.</p>}
    </section>
    {editor && <SubjectGroupEditor group={editor} catalog={catalog} onSave={onSaveGroup} onClose={()=>setEditor(null)}/>}
  </div>;
}
