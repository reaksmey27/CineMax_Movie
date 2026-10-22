import { useCallback, useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";
const LABEL_CLASS =
  "mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]";

// ─── FilterSelect: labelled select control ────────────────────────────────────

const FilterSelect = ({
  label,
  value,
  options,
  isOpen: controlledOpen,
  onToggle: controlledToggle,
  onClose: controlledClose,
  onChange,
}) => {
  const { t } = useLanguage();
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = controlledOpen ?? localOpen;
  const onToggle = controlledToggle ?? (() => setLocalOpen((open) => !open));
  const onClose = useCallback(() => {
    if (controlledClose) controlledClose();
    else setLocalOpen(false);
  }, [controlledClose]);
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

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
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
    <div
      ref={containerRef}
      className={`relative min-w-0 ${isOpen ? "z-40" : ""}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onClose();
      }}
    >
      <span className={LABEL_CLASS}>{t(label)}</span>

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-label={t(label)}
        data-value={value}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${triggerId}-menu`}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (!isOpen && ["ArrowDown", "ArrowUp"].includes(event.key)) {
            event.preventDefault();
            onToggle();
          }
        }}
        className={`group flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left font-semibold outline-none transition-all sm:py-2.5 ${
          isOpen
            ? "border-purple-500 bg-[var(--color-bg-elevated)] shadow-[0_0_0_1px_rgba(168,85,247,0.08)]"
            : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-purple-500/50"
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
          <div className="rounded-2xl border border-purple-500/25 bg-[var(--color-bg-elevated)] p-1.5 shadow-xl shadow-black/30">
            <ul
              ref={menuRef}
              id={`${triggerId}-menu`}
              role="listbox"
              aria-label={t(label)}
              className="max-h-64 space-y-1 overflow-y-auto overscroll-contain"
            >
              {options.map((option) => {
                const isSelected = option.value === selected.value;

                return (
                  <li role="presentation" key={option.value || "all"}>
                    <button
                      type="button"
                      role="option"
                      data-value={option.value}
                      tabIndex={-1}
                      aria-selected={isSelected}
                      onKeyDown={handleOptionKeyDown}
                      onClick={() => {
                        onChange(option.value);
                        onClose();
                        triggerRef.current?.focus();
                      }}
                      className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm leading-relaxed font-medium transition-colors ${
                        isSelected
                          ? "bg-purple-500/15 text-[var(--color-text)]"
                          : "text-[var(--color-text)] hover:bg-purple-500/10 focus:bg-purple-500/10"
                      }`}
                    >
                      <span className="min-w-0 break-words">
                        {t(option.label)}
                      </span>
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
