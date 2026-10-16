import {
  ClockIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import LiveSearchDropdown from "./LiveSearchDropdown";

const MoviesSearchBar = ({
  activeResultIndex,
  inputValue,
  isLiveSearchLoading,
  liveResults,
  onClear,
  onDeleteHistoryItem,
  onHistoryClearAll,
  onHistorySelect,
  onInputBlur,
  onInputChange,
  onInputFocus,
  onInputKeyDown,
  onResultHover,
  onResultSelect,
  searchHistory,
  searchRef,
  shouldShowHistoryDropdown,
  shouldShowLiveDropdown,
  setHasTypedSinceFocus,
}) => {
  return (
    <div ref={searchRef} className="group relative w-full md:w-96">
      <MagnifyingGlassIcon
        className={`absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
          inputValue
            ? "text-purple-500"
            : "text-gray-500 group-focus-within:text-purple-500"
        }`}
      />

      <input
        aria-autocomplete="list"
        aria-controls="movie-live-search-results"
        aria-expanded={shouldShowLiveDropdown}
        aria-activedescendant={
          activeResultIndex >= 0
            ? `movie-live-result-${liveResults[activeResultIndex]?.id}`
            : undefined
        }
        type="text"
        placeholder="Search movies..."
        value={inputValue}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        onChange={onInputChange}
        onKeyDown={onInputKeyDown}
        className="w-full rounded-2xl border-2 border-white/5 bg-white/5 px-14 py-3.5 font-bold text-white outline-none transition-all placeholder:text-gray-600 focus:border-purple-500/50 focus:bg-white/10 sm:py-4"
      />

      {inputValue && (
        <button
          type="button"
          onClick={() => {
            setHasTypedSinceFocus(true);
            onClear();
          }}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-white"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      )}

      {shouldShowLiveDropdown ? (
        <LiveSearchDropdown
          query={inputValue.trim()}
          results={liveResults}
          isLoading={isLiveSearchLoading}
          activeIndex={activeResultIndex}
          onSelect={onResultSelect}
          onHoverIndex={onResultHover}
        />
      ) : shouldShowHistoryDropdown ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-3">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#1f2023]/95 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.38em] text-gray-500">
                Search history
              </p>
              {searchHistory.length > 0 && (
                <button
                  type="button"
                  onClick={onHistoryClearAll}
                  className="text-[11px] font-bold text-purple-400 transition-colors hover:text-purple-300"
                >
                  Clear all
                </button>
              )}
            </div>

            {searchHistory.length > 0 ? (
              <ul className="max-h-[28rem] overflow-y-auto py-2">
                {searchHistory.map((item) => (
                  <li
                    key={item}
                    className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-white/5"
                  >
                    <button
                      type="button"
                      onClick={() => onHistorySelect(item)}
                      className="flex min-w-0 flex-1 items-center gap-4 text-left"
                    >
                      <ClockIcon className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-purple-400" />
                      <span className="truncate text-[15px] font-medium text-white/95">
                        {item}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHistoryItem(item);
                      }}
                      className="shrink-0 rounded-full p-2 text-gray-500 opacity-0 transition-all hover:bg-white/8 hover:text-white group-hover:opacity-100"
                      aria-label={`Delete ${item} from search history`}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <ClockIcon className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    No recent searches
                  </p>
                  <p className="mt-1 text-xs font-medium text-gray-500">
                    Your recent movie searches will appear here for quick
                    access.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MoviesSearchBar;
