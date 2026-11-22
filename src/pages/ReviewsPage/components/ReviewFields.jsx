export default function ReviewFields({ value, onChange, field, compact = false }) {
  return (
    <div className={`grid gap-4 pt-4 ${field || compact ? "" : "lg:grid-cols-2"}`}>
      {[
        ["learning", "Kiến thức đã học"],
        ["recommendation", "Đề xuất từ MindX"],
      ].filter(([key])=>!field || key===field).map(([key, label]) => (
        <label key={key} className="block text-sm font-bold">
          {label}
          <textarea
            rows={compact ? 4 : 12}
            maxLength={10000}
            value={value[key] || ""}
            onChange={(event) =>
              onChange({ ...value, [key]: event.target.value })
            }
            placeholder="Dán nội dung chuẩn vào đây…"
            className="mt-2 block max-h-[50dvh] w-full resize-y rounded-2xl border border-slate-300 bg-white p-3 text-sm font-normal leading-relaxed text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>
      ))}
    </div>
  );
}
