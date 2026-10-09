export default function SelectField({
    label,
    value,
    onChange,
    options,
}) {
    return (<label className="block">
        <span className="mb-2 block font-black text-slate-700">{label}</span>
        <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-blue-500">
            {options.map((item) => (<option key={item.value} value={item.value}>
                {item.label}
            </option>))}
        </select>
    </label>);
}