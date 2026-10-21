import { useLanguage } from "../../../context/LanguageContext";

export default function CollectionTabs({
  tabs,
  activeTab,
  setActiveTab,
  tabRefs,
}) {
  const { t } = useLanguage();
  const activate = (id) => {
    setActiveTab(id);
    tabRefs.current[id]?.focus();
  };
  return (
    <div
      role="tablist"
      aria-label={t("Movie collections")}
      className="flex gap-2 border-b border-[var(--color-border)] sm:gap-6"
    >
      {tabs.map((tab, index) => {
        const TabIcon = tab.icon;
        const selected = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              tabRefs.current[tab.id] = node;
            }}
            id={`profile-tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`profile-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              activate(
                tabs[
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? tabs.length - 1
                      : event.key === "ArrowRight"
                        ? (index + 1) % tabs.length
                        : (index - 1 + tabs.length) % tabs.length
                ].id,
              );
            }}
            className={`inline-flex min-h-14 flex-1 items-center justify-center gap-2 border-b-2 px-2 pb-3 pt-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-purple-500 sm:flex-none sm:px-4 ${selected ? "border-purple-500 text-[var(--color-text)]" : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
          >
            <TabIcon
              className="hidden h-5 w-5 min-[360px]:block"
              aria-hidden="true"
            />
            {tab.title}
            <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-xs tabular-nums">
              {tab.count ?? "..."}
            </span>
          </button>
        );
      })}
    </div>
  );
}
