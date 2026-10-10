export default function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  min,
  max,
  step,
  required = false,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-black text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        required={required}
        disabled={disabled}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </label>
  );
}