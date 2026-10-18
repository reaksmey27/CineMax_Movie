import React from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";

const PageControl = ({ disabled, href, onClick, ...props }) =>
  disabled ? (
    <button type="button" disabled {...props} />
  ) : (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        onClick();
      }}
    />
  );

const Pagination = ({ page, totalPages, onPageChange }) => {
  const { t } = useLanguage();
  const { pathname, search } = useLocation();
  const pageUrl = (number) => {
    const params = new URLSearchParams(search);
    if (number > 1) params.set("page", String(number));
    else params.delete("page");
    return `${pathname}${params.size ? `?${params}` : ""}`;
  };
  const maxVisiblePages = 5;
  let startPage = Math.max(1, page - 2);
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  return (
    <nav
      aria-label={t("Movie pages")}
      className="mt-12 flex flex-wrap items-center justify-center gap-2 px-1 py-2 sm:mt-24 sm:gap-3"
    >
      <PageControl
        href={pageUrl(page - 1)}
        aria-label={t("Previous page")}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`inline-flex items-center justify-center min-h-11 min-w-11 shrink-0 rounded-xl border-2 border-white/10 p-2.5 transition-all sm:p-3 ${page === 1 ? "cursor-not-allowed opacity-20" : "opacity-100 text-white hover:border-white/20 hover:bg-white/10"}`}
      >
        <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </PageControl>

      <span
        aria-live="polite"
        className="min-w-0 px-3 text-sm font-bold text-white sm:hidden"
      >
        {t("Page {page} of {totalPages}", { page, totalPages })}
      </span>

      {startPage > 1 && (
        <>
          <PageControl
            href={pageUrl(1)}
            aria-label={t("Go to page {page}", { page: 1 })}
            onClick={() => onPageChange(1)}
            className="hidden h-11 w-11 shrink-0 rounded-xl border-2 border-white/10 text-sm font-black text-white transition-all hover:border-white/20 hover:bg-white/10 sm:inline-flex sm:items-center sm:justify-center lg:h-14 lg:w-14 lg:text-lg"
          >
            1
          </PageControl>
          {startPage > 2 && (
            <span className="hidden text-lg font-black text-gray-500 sm:block">
              ...
            </span>
          )}
        </>
      )}

      {pageNumbers.map((num) => (
        <PageControl
          key={num}
          href={pageUrl(num)}
          aria-label={t("Go to page {page}", { page: num })}
          aria-current={page === num ? "page" : undefined}
          onClick={() => onPageChange(num)}
          className={`hidden h-11 w-11 shrink-0 rounded-xl text-sm font-black transition-all sm:inline-flex sm:items-center sm:justify-center lg:h-14 lg:w-14 lg:text-lg ${
            page === num
              ? "z-10 scale-105 border-2 border-purple-500 bg-purple-600 text-white shadow-2xl shadow-purple-600/40 sm:scale-110"
              : "border-2 border-white/10 text-white hover:border-white/20 hover:bg-white/10"
          }`}
        >
          {num}
        </PageControl>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="hidden text-lg font-black text-gray-500 sm:block">
              ...
            </span>
          )}
          <PageControl
            href={pageUrl(totalPages)}
            aria-label={t("Go to page {page}", { page: totalPages })}
            onClick={() => onPageChange(totalPages)}
            className="hidden h-11 w-11 shrink-0 rounded-xl border-2 border-white/10 text-sm font-black text-white transition-all hover:border-white/20 hover:bg-white/10 sm:inline-flex sm:items-center sm:justify-center lg:h-14 lg:w-14 lg:text-lg"
          >
            {totalPages}
          </PageControl>
        </>
      )}

      <PageControl
        href={pageUrl(page + 1)}
        aria-label={t("Next page")}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={`inline-flex items-center justify-center min-h-11 min-w-11 shrink-0 rounded-xl border-2 border-white/10 p-2.5 transition-all sm:p-3 ${page === totalPages ? "cursor-not-allowed opacity-20" : "opacity-100 text-white hover:border-white/20 hover:bg-white/10"}`}
      >
        <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </PageControl>
    </nav>
  );
};

export default Pagination;
