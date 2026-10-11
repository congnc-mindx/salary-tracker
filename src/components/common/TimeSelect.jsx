import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function TimeSelect({
  label,
  value,
  onChange,
  options,
}) {
  const id = useId();
  const [open, setOpen] = useState(false);

  function selectTime(time) {
    onChange(time);
    setOpen(false);
    document.getElementById(`${id}-trigger`)?.focus();
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      document.getElementById(`${id}-trigger`)?.focus();
    }
  }

  return (
    <div onKeyDown={handleKeyDown}>
      <p
        id={`${id}-label`}
        className="mb-2 font-black text-slate-700 dark:text-slate-200"
      >
        {label}
      </p>

      <button
        id={`${id}-trigger`}
        type="button"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-expanded={open}
        aria-controls={`${id}-options`}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left font-bold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        <span id={`${id}-value`}>
          {value || 'Chọn giờ bắt đầu'}
        </span>

        <ChevronDown
          size={20}
          aria-hidden="true"
          className={`shrink-0 text-slate-500 transition-transform dark:text-slate-400 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        id={`${id}-options`}
        hidden={!open}
        className="mt-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
      >
        <div
          role="group"
          aria-labelledby={`${id}-label`}
          className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto overscroll-contain p-1 sm:grid-cols-4"
        >
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => selectTime(option.value)}
                className={`rounded-xl px-2 py-3 text-sm font-bold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                  selected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-blue-950 dark:hover:text-blue-200'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}