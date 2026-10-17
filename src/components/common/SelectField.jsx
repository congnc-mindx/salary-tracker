import { useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import FloatingPanel from "./FloatingPanel";

export default function SelectField({
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  placeholder = "Chọn một mục",
}) {
  const id = useId();
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);

  function select(option) {
    if (option.disabled) return;

    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function navigate(event) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    const buttons = Array.from(
      event.currentTarget.querySelectorAll("button:not(:disabled)"),
    );

    if (!buttons.length) return;

    const current = buttons.indexOf(document.activeElement);

    let next;

    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = buttons.length - 1;
    else if (event.key === "ArrowDown") {
      next = (current + 1 + buttons.length) % buttons.length;
    } else {
      next = (current - 1 + buttons.length) % buttons.length;
    }

    buttons[next].focus({ preventScroll: true });
    buttons[next].scrollIntoView({ block: "nearest" });
  }

  return (
    <div className="min-w-0">
      <label
        htmlFor={`${id}-trigger`}
        className="mb-2 block font-black text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>

      <button
        ref={triggerRef}
        id={`${id}-trigger`}
        type="button"
        disabled={disabled}
        aria-expanded={open && !disabled}
        aria-controls={open && !disabled ? `${id}-options` : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left font-bold text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        <span className="min-w-0 truncate">
          {selected?.label ?? placeholder}
        </span>

        <ChevronDown
          size={19}
          aria-hidden="true"
          className={`shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !disabled && (
        <FloatingPanel
          id={`${id}-options`}
          anchorRef={triggerRef}
          onClose={() => setOpen(false)}
          label={label}
        >
          <div onKeyDown={navigate} className="space-y-1">
            {options.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  aria-pressed={active}
                  onClick={() => select(option)}
                  className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-40 ${
                    active
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="min-w-0 break-words">{option.label}</span>

                  {active && <Check size={16} className="shrink-0" />}
                </button>
              );
            })}

            {!options.length && (
              <p className="px-3 py-2 text-sm text-slate-500">
                Chưa có lựa chọn.
              </p>
            )}
          </div>
        </FloatingPanel>
      )}
    </div>
  );
}
