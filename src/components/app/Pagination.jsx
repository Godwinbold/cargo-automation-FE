import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  color,
}) => {
  const getPages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-row items-center justify-between gap-2 mt-4 px-3 py-2.5 sm:px-4 sm:py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-xs sm:text-sm text-gray-500 whitespace-nowrap">
          Items per page:
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          aria-label="Items per page"
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 sm:px-4 sm:py-1.5 border border-gray-300 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center"
          aria-label="Previous Page"
        >
          <span className="hidden sm:inline">PREV</span>
          <ChevronLeft className="w-4 h-4 sm:hidden" />
        </button>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {getPages().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <span className="px-1 text-gray-400 text-xs sm:text-sm">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full text-xs sm:text-sm font-medium transition flex items-center justify-center border-2 ${
                    currentPage === page
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-800"
                  }`}
                  style={
                    currentPage === page
                      ? { backgroundColor: color || "#000", borderColor: color || "#000" }
                      : {}
                  }
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 sm:px-4 sm:py-1.5 border border-gray-300 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center"
          aria-label="Next Page"
        >
          <span className="hidden sm:inline">NEXT</span>
          <ChevronRight className="w-4 h-4 sm:hidden" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
