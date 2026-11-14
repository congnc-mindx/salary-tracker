import { useState } from "react";
import StatPanel from "./StatPanel";
import ModalShell from "../../../components/common/ModalShell";
import { money } from "../../../utils/format";
import { formatDateVN } from "../../../utils/date";
import { percent, WORK_TYPES } from "../statisticsModel";
const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";
const hours = value => value.toLocaleString("vi-VN");
export function LessonDetails({ title, rows, onClose }) {
  return <ModalShell title={title} description={`${rows.length} buổi · ${money(rows.reduce((s,r)=>s+Number(r.amount || 0),0))}`} onClose={onClose}>
    <div className="space-y-3">{[...rows].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).map((r,i)=><article key={r.type+":"+r.id+":"+i} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex flex-wrap justify-between gap-2"><strong className="break-words">{r.classLabel || r.title}</strong><strong className="tabular-nums">{money(r.amount)}</strong></div>
      <p className="mt-2 text-sm">{formatDateVN(r.date)} · {r.time}{r.sessionNo ? ` · Buổi ${r.sessionNo}` : ""}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{r.campus || "Chưa xác định cơ sở"} · {WORK_TYPES.find(t=>t.key===r.type)?.label} · {hours(r.hours)} giờ · {r.status === "confirmed" ? "Đã ghi nhận" : "Còn dự kiến"}</p>
    </article>)}</div>
  </ModalShell>;
}
export function SourceProgress({ stats, mode }) {
  const [typeKey,setTypeKey]=useState(null);
  const types=[...stats.types].filter(t=>t.count>0).sort((a,b)=>b.total-a.total);
  const max=Math.max(1,...types.map(t=>t.total));
  const current=types.find(t=>t.key===typeKey);
  return <>
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <StatPanel title="Tiền công đến từ đâu?" description="Sắp theo giá trị · Chọn thanh để xem các buổi">
        <div className="space-y-3">{types.map(t=><button key={t.key} type="button" onClick={()=>setTypeKey(t.key)} className={`block min-h-16 w-full rounded-xl py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${focus}`}>
          <span className="flex flex-wrap justify-between gap-2 text-sm font-bold"><span><span aria-hidden="true" className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{background:t.color}}/>{t.label}</span><span className="tabular-nums">{money(t.total)}</span></span>
          <span className="my-2 flex h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
            <span style={{width:`${t.confirmed/max*100}%`,background:t.color}}/>
            <span style={{width:`${t.waiting/max*100}%`,backgroundColor:t.color,backgroundImage:"repeating-linear-gradient(135deg, transparent 0 3px, #0f172a 3px 5px)"}}/>
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-300">{t.count} buổi · {hours(t.hours)} giờ · {percent(t.total,stats.total)}</span>
          <span className="sr-only"> · Đã ghi nhận {money(t.confirmed)} · Còn dự kiến {money(t.waiting)}</span>
        </button>)}</div>
        {!types.length && <p className="py-8 text-sm text-slate-500 dark:text-slate-400">Chưa có buổi tính công trong kỳ này.</p>}
        <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300"><span>■ Đã ghi nhận</span><span>▧ Còn lại dự kiến</span></div>
      </StatPanel>
      <StatPanel title={mode === "year" ? "Tiến độ năm" : "Tiến độ tháng"} description="Theo lịch sau điều chỉnh">
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-3xl font-black">{stats.confirmedCount}<span className="text-base text-slate-500 dark:text-slate-400"> / {stats.count} buổi</span></p><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">{percent(stats.confirmedCount,stats.count)} đã ghi nhận</span></div>
        <div role="progressbar" aria-label="Tiến độ giảng dạy" aria-valuemin={0} aria-valuemax={stats.count || 1} aria-valuenow={stats.confirmedCount} className="my-5 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-brand-600" style={{width:`${stats.count ? stats.confirmedCount/stats.count*100 : 0}%`}}/></div>
        <div className="flex justify-between text-sm"><div><strong>{stats.confirmedCount}</strong><p className="mt-1">Đã ghi nhận</p></div><div className="text-right"><strong>{stats.waitingCount}</strong><p className="mt-1">Còn lại</p></div></div>
        <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-700"><div><p className="text-xs text-slate-500 dark:text-slate-400">Tổng thời lượng</p><strong className="text-lg">{hours(stats.hours)} giờ</strong></div><div className="text-right text-xs leading-6 text-slate-500 dark:text-slate-400">{hours(stats.confirmedHours)} giờ đã ghi nhận<br/>{hours(stats.waitingHours)} giờ còn lại</div></div>
      </StatPanel>
    </div>
    {current && <LessonDetails title={current.label} rows={stats.rows.filter(r=>r.type===typeKey)} onClose={()=>setTypeKey(null)}/>}
  </>;
}
export function ContributionCard({ title, items, total, campus = false }) {
  const [open,setOpen]=useState(false), [selected,setSelected]=useState(null);
  const max=Math.max(1,...items.map(i=>i.total));
  const active=items.find(i=>i.key===selected);
  const itemView=item=><div><div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1"><strong className="min-w-0 break-words">{item.title}</strong><strong className="tabular-nums">{money(item.total)}</strong></div>{campus && <div className="my-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-brand-500" style={{width:`${item.total/max*100}%`}}/></div>}<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.count} buổi · {hours(item.hours)} giờ{campus ? ` · ${percent(item.total,total)} tổng thu nhập` : ""}</p></div>;
  return <>
    <section className="flex min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 sm:p-6">
      <h2 className="text-lg font-black">{title}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sắp theo tổng thu nhập · Bao gồm phần dự kiến</p>
      {items.length>4 ? <button type="button" onClick={()=>setOpen(true)} aria-label={`${title}: xem tất cả ${items.length} mục`} className={`mt-4 flex flex-1 flex-col rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${focus}`}><div className="w-full">{items.slice(0,4).map(item=><div key={item.key} className="min-h-24 border-b border-slate-200 py-4 text-sm dark:border-slate-700">{itemView(item)}</div>)}</div><span className="mt-auto block min-h-12 pt-4 text-sm font-bold text-brand-700 dark:text-brand-300">Còn {items.length-4} {campus?"cơ sở":"lớp"} · Xem tất cả {items.length} →</span></button> : <><div className="mt-4 flex-1">{items.map(item=><button key={item.key} type="button" onClick={()=>setSelected(item.key)} className={`block min-h-24 w-full rounded-lg border-b border-slate-200 py-4 text-left text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 ${focus}`}>{itemView(item)}</button>)}{!items.length && <p className="py-8 text-sm text-slate-500 dark:text-slate-400">Chưa có dữ liệu trong kỳ này.</p>}</div><p className="min-h-12 pt-4 text-xs text-slate-500 dark:text-slate-400">{items.length ? "Đã hiển thị tất cả · Chọn mục để xem từng buổi" : ""}</p></>}
    </section>
    {open && <ModalShell title={title} description={`${items.length} mục · Chọn mục để xem các buổi`} onClose={()=>setOpen(false)}><div className="space-y-2">{items.map(item=><button key={item.key} type="button" onClick={()=>setSelected(item.key)} className={`block min-h-20 w-full rounded-xl border border-slate-200 p-4 text-left text-sm dark:border-slate-700 ${focus}`}>{itemView(item)}</button>)}</div></ModalShell>}
    {active && <LessonDetails title={active.title} rows={active.rows} onClose={()=>setSelected(null)}/>}
  </>;
}
