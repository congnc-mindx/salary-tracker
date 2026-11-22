import { normalizeSearch } from "../../../utils/courseDisplay";
import { TYPES } from "./model";

export default function MatchCandidates({ rows, type, search, onSearch, selected = [], onSelect, isLinked = () => false }) {
  const types = search.trim() ? ["makeup", "substitute", "judge", "trial", "class"] : [type];
  return <section className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
    <h4 className="text-sm font-bold">Chọn buổi tương ứng</h4>
    <input aria-label="Tìm buổi tương ứng" placeholder="Tìm mã lớp, ngày, ghi chú hoặc loại ca khác…" value={search} onChange={e=>onSearch(e.target.value)} className="my-2 min-h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"/>
    <div className="max-h-[clamp(96px,calc(100dvh-430px),240px)] space-y-2 overflow-y-auto">
      {types.map(kind=>{
        const matches = rows.filter(r=>r.type===kind && normalizeSearch(`${r.title || r.rawClass} ${r.date} ${r.time} ${TYPES[r.type]} ${r.note || ""}`).includes(normalizeSearch(search)));
        if(search.trim() && !matches.length) return null;
        return <div key={kind}><h5 className="mb-1 text-sm font-semibold">{TYPES[kind]} · {matches.length} buổi</h5>
          {!matches.length && <p className="py-2 text-xs text-slate-500">Không có buổi phù hợp trong tháng này.</p>}
          {matches.map(r=><label key={r.id} className={`flex cursor-pointer items-start gap-3 rounded-lg p-2 text-sm ${selected.includes(r.id) ? "bg-brand-50 dark:bg-brand-950" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
            <input className="mt-1" type="checkbox" checked={selected.includes(r.id)} onChange={()=>onSelect(r.id)}/>
            <span>{r.title || r.rawClass} · {r.date} {r.time} · {TYPES[r.type]}{r.note && <span className="text-slate-500 dark:text-slate-400"> · {r.note}</span>}{isLinked(r.id) && <span className="block text-xs text-amber-600">Đã ghép với dòng khác</span>}</span>
          </label>)}
        </div>;
      })}
      {search.trim() && !rows.some(r=>types.includes(r.type) && normalizeSearch(`${r.title || r.rawClass} ${r.date} ${r.time} ${TYPES[r.type]} ${r.note || ""}`).includes(normalizeSearch(search))) && <p className="text-xs text-slate-500">Không có buổi phù hợp.</p>}
    </div>
  </section>;
}
