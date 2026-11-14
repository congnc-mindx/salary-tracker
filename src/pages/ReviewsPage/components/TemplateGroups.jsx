import { useState } from "react";
import { useSubjectCatalog } from "../SubjectCatalogContext";
import { subjectLevel } from "../subjectCatalog";
import SubjectGroupEditor from "./SubjectGroupEditor";
import SessionTemplateManager from "./SessionTemplateManager";
import Button from "../../../components/common/Button";

export default function TemplateGroups({ userId, templates = {}, onFinal, onSaveGroup, onSaveSessionTemplate }) {
  const catalog = useSubjectCatalog();
  const [groupId, setGroupId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [kind, setKind] = useState("sessions");
  const [editor, setEditor] = useState(null);
  const group = catalog.find(g => g.id === groupId);
  const subject = group?.subjects.find(s => s.id === subjectId);
  const input = "mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-brand-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950";
  return <div className="space-y-5">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-black">Mẫu nội dung</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Chọn bộ môn và học phần để chỉnh mẫu dùng chung cho các lớp.</p></div>{group && <Button onClick={() => setEditor(group)}>Sửa bộ môn</Button>}</div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">Bộ môn<select className={input} value={group?.id || ""} onChange={e=>{setGroupId(e.target.value);setSubjectId("");}}><option value="">Chọn bộ môn</option>{catalog.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
        <label className="text-sm font-bold">Học phần<select className={input} disabled={!group} value={subject?.id || ""} onChange={e=>setSubjectId(e.target.value)}><option value="">Chọn học phần</option>{group?.subjects.map(s=><option key={s.id} value={s.id}>{subjectLevel(s.code) || s.name || "Học phần hiện có"} · {s.code}</option>)}</select></label>
      </div>
    </section>
    {!subject ? <div role="status" className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{group ? "Chọn học phần để xem mẫu từng buổi và mẫu cuối khóa." : "Chọn bộ môn để bắt đầu. Các mẫu chỉ hiển thị sau khi bạn chọn học phần."}</div> : <>
      <nav aria-label="Loại mẫu nhận xét" className="flex flex-wrap gap-2">{[["sessions","Từng buổi"],["final","Cuối khóa"]].map(([key,label])=><Button key={key} variant={kind===key?"primary":"secondary"} aria-pressed={kind===key} onClick={()=>setKind(key)}>{label}</Button>)}</nav>
      {kind === "sessions" ? <SessionTemplateManager key={subject.id} embedded userId={userId} subject={subject.id} onSave={onSaveSessionTemplate}/> : <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><h3 className="text-lg font-bold">{group.name} · {subjectLevel(subject.code) || subject.code} · Cuối khóa</h3><p className="my-3 text-sm text-slate-500 dark:text-slate-400">{templates[subject.id] ? "Đã có mẫu cuối khóa. Chỉnh sửa mẫu dùng chung cho học phần này." : "Chưa có mẫu cuối khóa cho học phần này."}</p><Button variant="primary" onClick={()=>onFinal(subject.id)}>{templates[subject.id] ? "Chỉnh sửa mẫu" : "Soạn mẫu"}</Button></section>}
    </>}
    {editor && <SubjectGroupEditor group={editor} catalog={catalog} onSave={onSaveGroup} onClose={()=>setEditor(null)}/>}
  </div>;
}
