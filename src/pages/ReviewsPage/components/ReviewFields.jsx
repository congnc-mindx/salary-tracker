export default function ReviewFields({ value, onChange }) {
  return (
    <div className="space-y-4">
      {[
        ["learning", "Kiến thức và kỹ năng đã học"],
        ["recommendation", "Đề xuất từ MindX"],
      ].map(([key, label]) => (
        <label key={key} className="block text-sm font-bold">
          {label}
          <textarea
            rows={key === "learning" ? 8 : 5}
            maxLength={10000}
            value={value[key] || ""}
            onChange={(event) =>
              onChange({ ...value, [key]: event.target.value })
            }
            placeholder="Dán nội dung chuẩn vào đây…"
            className="mt-2 block w-full resize-y rounded-2xl border border-slate-300 bg-white p-3 text-sm font-normal leading-relaxed text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>
      ))}
    </div>
  );
}
