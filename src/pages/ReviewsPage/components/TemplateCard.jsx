export default function TemplateCard({title,content,onClick}) {
 const filled=Boolean(content?.trim());
 return <button type="button" onClick={onClick} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-2 text-left hover:border-brand-500 focus-visible:outline-brand-500 sm:p-3 dark:border-slate-700 dark:bg-slate-900">
  <span className="flex flex-wrap items-center justify-between gap-1"><strong className="break-words text-sm sm:text-base">{title}</strong><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${filled?'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300':'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{filled?'Có nội dung':'Chưa soạn'}</span></span>
  <span className="mt-2 line-clamp-2 min-h-10 whitespace-pre-line break-words text-xs leading-5 text-slate-500 dark:text-slate-400">{content?.trim() || 'Thêm nội dung mẫu.'}</span>
  <span className="mt-2 block border-t border-slate-200 pt-2 text-xs font-bold text-brand-600 dark:border-slate-700 dark:text-brand-400">{filled?'Chỉnh sửa →':'Soạn mẫu →'}</span>
 </button>;
}
