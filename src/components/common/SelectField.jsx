import { ChevronDown } from "lucide-react";

export default function SelectField({ label, value, onChange, options = [] }) {
  return (
    <label className="block">
      <span className="mb-2 block font-black text-slate-700 dark:text-slate-200">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="
            w-full appearance-none rounded-2xl
            border border-slate-200 bg-white
            py-3 pl-4 pr-12 font-bold text-slate-950
            outline-none
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
            dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100
          "
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={20}
          aria-hidden="true"
          className="
            pointer-events-none absolute right-4 top-1/2
            -translate-y-1/2 text-slate-500 dark:text-slate-400
          "
        />
      </div>
    </label>
  );
}
