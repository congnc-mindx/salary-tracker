import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export default function SelectField({
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  placeholder = "Chọn một mục",
}) {
  const id = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const isOpen = open && !disabled;

  const selectedIndex = options.findIndex(
    (option) => String(option.value) === String(value),
  );

  const selectedOption = options[selectedIndex];

  function openMenu(direction = 1) {
    if (disabled) return;

    const enabledIndexes = options
      .map((option, index) => (!option.disabled ? index : -1))
      .filter((index) => index !== -1);

    const initialIndex =
      selectedIndex >= 0 && !options[selectedIndex].disabled
        ? selectedIndex
        : direction === -1
          ? enabledIndexes.at(-1)
          : enabledIndexes[0];

    setActiveIndex(initialIndex ?? -1);
    setOpen(true);
  }

  function selectOption(index) {
    const option = options[index];

    if (!option || option.disabled || disabled) return;

    onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function moveActive(direction) {
    const enabledIndexes = options
      .map((option, index) => (!option.disabled ? index : -1))
      .filter((index) => index !== -1);

    if (!enabledIndexes.length) return;

    const currentPosition = enabledIndexes.indexOf(activeIndex);

    const nextPosition =
      currentPosition === -1
        ? direction === 1
          ? 0
          : enabledIndexes.length - 1
        : (currentPosition + direction + enabledIndexes.length) %
          enabledIndexes.length;

    setActiveIndex(enabledIndexes[nextPosition]);
  }

  function handleKeyDown(event) {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      const direction = event.key === "ArrowDown" ? 1 : -1;

      if (isOpen) {
        moveActive(direction);
      } else {
        openMenu(direction);
      }

      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (isOpen) {
        selectOption(activeIndex);
      } else {
        openMenu();
      }

      return;
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      return;
    }

    if (event.key === "Tab") {
      setOpen(false);
      return;
    }

    if (isOpen && (event.key === "Home" || event.key === "End")) {
      event.preventDefault();

      const enabledIndexes = options
        .map((option, index) => (!option.disabled ? index : -1))
        .filter((index) => index !== -1);

      setActiveIndex(
        (event.key === "Home" ? enabledIndexes[0] : enabledIndexes.at(-1)) ??
          -1,
      );
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleFocusOutside(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("focusin", handleFocusOutside);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("focusin", handleFocusOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;

    const list = listRef.current;
    const option = list?.querySelector(`[data-option-index="${activeIndex}"]`);

    if (!list || !option) return;

    const listRect = list.getBoundingClientRect();
    const optionRect = option.getBoundingClientRect();

    if (optionRect.top < listRect.top) {
      list.scrollTop -= listRect.top - optionRect.top;
    } else if (optionRect.bottom > listRect.bottom) {
      list.scrollTop += optionRect.bottom - listRect.bottom;
    }
  }, [isOpen, activeIndex]);

  return (
    <div ref={rootRef} className={`relative min-w-0 ${isOpen ? "z-30" : ""}`}>
      <label
        id={`${id}-label`}
        htmlFor={`${id}-trigger`}
        className="mb-2 block font-black text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>

      <div className="relative">
        <button
          ref={buttonRef}
          id={`${id}-trigger`}
          type="button"
          role="combobox"
          aria-labelledby={`${id}-label`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? `${id}-listbox` : undefined}
          aria-activedescendant={
            isOpen && activeIndex >= 0 && options[activeIndex]
              ? `${id}-option-${activeIndex}`
              : undefined
          }
          disabled={disabled}
          onClick={() => {
            if (isOpen) {
              setOpen(false);
            } else {
              openMenu();
            }
          }}
          onKeyDown={handleKeyDown}
          className={`flex w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left font-bold text-slate-950 outline-none transition-colors focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100 ${
            isOpen
              ? "border-brand-500 ring-2 ring-brand-500/20"
              : "border-slate-200 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500"
          }`}
        >
          <span
            className={`min-w-0 truncate ${
              selectedOption ? "" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {selectedOption?.label ?? placeholder}
          </span>

          <ChevronDown
            size={20}
            aria-hidden="true"
            className={`shrink-0 text-slate-500 transition-transform dark:text-slate-400 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <ul
            ref={listRef}
            id={`${id}-listbox`}
            role="listbox"
            aria-labelledby={`${id}-label`}
            className="absolute left-0 top-full z-40 mt-2 max-h-60 w-full overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-950/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30"
          >
            {options.map((option, index) => {
              const selected = String(option.value) === String(value);
              const active = index === activeIndex;

              return (
                <li
                  key={option.value}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={Boolean(option.disabled)}
                  data-option-index={index}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => {
                    if (!option.disabled) setActiveIndex(index);
                  }}
                  onClick={() => selectOption(index)}
                  className={`flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    option.disabled
                      ? "cursor-not-allowed text-slate-400 opacity-50 dark:text-slate-500"
                      : selected
                        ? "cursor-pointer bg-brand-50 font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-200"
                        : active
                          ? "cursor-pointer bg-slate-100 font-medium text-slate-950 dark:bg-slate-800 dark:text-slate-100"
                          : "cursor-pointer font-medium text-slate-700 dark:text-slate-300"
                  } ${
                    active && !option.disabled
                      ? "ring-1 ring-inset ring-brand-400"
                      : ""
                  }`}
                >
                  <span className="min-w-0 break-words">{option.label}</span>

                  {selected && (
                    <Check size={17} aria-hidden="true" className="shrink-0" />
                  )}
                </li>
              );
            })}

            {options.length === 0 && (
              <li
                role="presentation"
                className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400"
              >
                Chưa có lựa chọn.
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
