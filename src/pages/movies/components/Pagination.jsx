import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const Pagination = ({ page, totalPages, onPageChange }) => {
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
      aria-label="Movie pages"
      className="mt-12 flex flex-wrap items-center justify-center gap-2 px-1 py-2 sm:mt-24 sm:gap-3"
    >
      <button
        aria-label="Previous page"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`min-h-11 min-w-11 shrink-0 rounded-xl border-2 border-white/10 p-2.5 transition-all sm:p-3 ${page === 1 ? "cursor-not-allowed opacity-20" : "opacity-100 text-white hover:border-white/20 hover:bg-white/10"}`}
      >
        <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <span
        aria-live="polite"
        className="min-w-0 px-3 text-sm font-bold text-white sm:hidden"
      >
        Page {page} of {totalPages}
      </span>

      {startPage > 1 && (
        <>
          <button
            aria-label="Go to page 1"
            onClick={() => onPageChange(1)}
            className="hidden h-11 w-11 shrink-0 rounded-xl border-2 border-white/10 text-sm font-black text-white transition-all hover:border-white/20 hover:bg-white/10 sm:block lg:h-14 lg:w-14 lg:text-lg"
          >
            1
          </button>
          {startPage > 2 && (
            <span className="hidden text-lg font-black text-gray-500 sm:block">
              ...
            </span>
          )}
        </>
      )}

      {pageNumbers.map((num) => (
        <button
          key={num}
          aria-label={`Go to page ${num}`}
          aria-current={page === num ? "page" : undefined}
          onClick={() => onPageChange(num)}
          className={`hidden h-11 w-11 shrink-0 rounded-xl text-sm font-black transition-all sm:block lg:h-14 lg:w-14 lg:text-lg ${
            page === num
              ? "z-10 scale-105 border-2 border-purple-500 bg-purple-600 text-white shadow-2xl shadow-purple-600/40 sm:scale-110"
              : "border-2 border-white/10 text-white hover:border-white/20 hover:bg-white/10"
          }`}
        >
          {num}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="hidden text-lg font-black text-gray-500 sm:block">
              ...
            </span>
          )}
          <button
            aria-label={`Go to page ${totalPages}`}
            onClick={() => onPageChange(totalPages)}
            className="hidden h-11 w-11 shrink-0 rounded-xl border-2 border-white/10 text-sm font-black text-white transition-all hover:border-white/20 hover:bg-white/10 sm:block lg:h-14 lg:w-14 lg:text-lg"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        aria-label="Next page"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={`min-h-11 min-w-11 shrink-0 rounded-xl border-2 border-white/10 p-2.5 transition-all sm:p-3 ${page === totalPages ? "cursor-not-allowed opacity-20" : "opacity-100 text-white hover:border-white/20 hover:bg-white/10"}`}
      >
        <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </nav>
  );
};

export default Pagination;
