import { useState } from 'react';
import { getCampusCode, getCampusPayrollCodes } from '../../utils/courseDisplay';
import ModalShell from '../../components/common/ModalShell';
import Field from '../../components/common/Field';
import Button from '../../components/common/Button';
export default function CampusEditor({ campuses, onSave, openAdd }) {
 const [payroll,setPayroll]=useState('');
 const [editing,setEditing]=useState(null),[name,setName]=useState(''),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function save(e) { e.preventDefault(); setBusy(true); setError(''); try { const saved = await onSave(editing,name,code,payroll); if (saved === false) { setError("Chưa lưu được. Kiểm tra thông báo lỗi và thử lại; dữ liệu nhập vẫn được giữ."); } else { setEditing(null); } } catch(err) {setError(err.message);} finally {setBusy(false);} }
 return <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
  <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-black">Cơ sở giảng dạy</h2><Button onClick={openAdd}>Thêm cơ sở</Button></div>
  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Thiết lập tên đầy đủ, mã hiển thị và mã cơ sở trong bảng lương để tự nhận diện khi đối soát.</p>
  <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-700">{campuses.map(c=><button type="button" key={c} onClick={()=>{setEditing(c);setName(c);setCode(getCampusCode(c));setPayroll(getCampusPayrollCodes(c).join(", "));setError('');}} className="flex min-h-16 w-full items-center justify-between gap-3 rounded-lg px-2 py-3 text-left hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand-500 dark:hover:bg-slate-800"><span className="break-words font-bold">{c}<span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">Bảng lương: {getCampusPayrollCodes(c).join(", ") || "Chưa thiết lập"}</span></span><span className="flex shrink-0 items-center gap-3"><span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black dark:bg-slate-800">{getCampusCode(c)}</span><span className="text-sm text-brand-700 dark:text-brand-300">Sửa ›</span></span></button>)}</div>
  {editing && <ModalShell title="Sửa cơ sở" description="Tên và mã mới sẽ cập nhật trên các lớp và lịch phát sinh liên quan." onClose={()=>{if(!busy)setEditing(null);}} busy={busy}><form onSubmit={save} className="space-y-4"><Field label="Tên cơ sở" value={name} onChange={setName}/><Field label="Mã viết tắt" value={code} onChange={setCode}/><Field label="Mã cơ sở trong bảng lương" value={payroll} onChange={setPayroll}/><p className="text-xs text-slate-500 dark:text-slate-400">Ví dụ: 505MK. Nhiều mã phân cách bằng dấu phẩy. Khi nhập bảng, hệ thống dùng mã viết tắt ở trên.</p>{error && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{error}</p>}<div className="flex justify-end"><Button type="submit" disabled={busy}>{busy?'Đang lưu…':'Lưu thay đổi'}</Button></div></form></ModalShell>}
 </section>;
}
