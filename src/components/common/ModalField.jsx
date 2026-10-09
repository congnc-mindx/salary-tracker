export default function Field({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    min,
    step,
}) {
    return (
        <label className="block">
            <span className="mb-2 block font-black text-slate-700">{label}</span>
            <input type={type} min={min} step={step} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-blue-500" />
        </label>);
}