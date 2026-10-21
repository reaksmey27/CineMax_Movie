import { useEffect, useRef } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";
import { LABEL_CLASS } from "./filterStyles";

// ─── FilterSelect: labelled select control ────────────────────────────────────

const FilterSelect = ({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onClose,
  onChange,
}) => {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const triggerId = `filter-select-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const selected =
    options.find((option) => option.value === value) ?? options[0];

  // ─── Effects: menu listeners & focus ─────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return undefined;

    const optionButtons = menuRef.current?.querySelectorAll('[role="option"]');
    const selectedOption = Array.from(optionButtons ?? []).find(
      (option) => option.getAttribute("aria-selected") === "true",
    );
    selectedOption?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (e) => {
      if (!containerRef.current?.contains(e.target)) onClose();
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // ─── Handlers: keyboard option navigation ────────────────────────────────────

  const handleOptionKeyDown = (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

    const optionButtons = Array.from(
      menuRef.current?.querySelectorAll('[role="option"]') ?? [],
    );
    const currentIndex = optionButtons.indexOf(event.currentTarget);
    if (currentIndex < 0 || optionButtons.length === 0) return;

    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? optionButtons.length - 1
          : (currentIndex +
              (event.key === "ArrowDown" ? 1 : optionButtons.length - 1)) %
            optionButtons.length;
    optionButtons[nextIndex].focus();
  };

  // ─── Render: custom select dropdown ──────────────────────────────────────────

  return (
    <div ref={containerRef} className="relative space-y-2">
      <span className={LABEL_CLASS}>{t(label)}</span>

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${triggerId}-menu`}
        onClick={onToggle}
        className={`group flex w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-2 text-left font-semibold outline-none transition-all sm:py-2.5 ${
          isOpen
            ? "border-purple-500/45 bg-white/8 shadow-[0_0_0_1px_rgba(168,85,247,0.08)]"
            : "border-white/8 bg-white/5 hover:border-white/15 hover:bg-white/8"
        }`}
      >
        <span className="min-w-0 truncate text-[15px] text-white">
          {t(selected.label)}
        </span>
        <ChevronUpDownIcon
          className={`h-3.5 w-3.5 shrink-0 transition-colors ${
            isOpen
              ? "text-purple-500"
              : "text-gray-500 group-hover:text-gray-400"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-50 mt-1 origin-top transition-all duration-150">
          <div className="rounded-lg border border-white/6 bg-slate-950 p-1">
            <ul
              ref={menuRef}
              id={`${triggerId}-menu`}
              role="listbox"
              aria-labelledby={triggerId}
              className="max-h-64 space-y-1 overflow-y-auto overscroll-contain"
            >
              {options.map((option) => {
                const isSelected = option.value === selected.value;

                return (
                  <li key={option.value || "all"}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onKeyDown={handleOptionKeyDown}
                      onClick={() => {
                        onChange(option.value);
                        onClose();
                        triggerRef.current?.focus();
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-2 text-left text-[13px] font-semibold transition-all ${
                        isSelected
                          ? "bg-purple-600 text-white"
                          : "bg-white/5 text-white hover:bg-white/8"
                      }`}
                    >
                      <span className="truncate">{t(option.label)}</span>
                      <CheckIcon
                        className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "opacity-100" : "opacity-0"}`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSelect;
