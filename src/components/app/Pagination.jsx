import React from "react";

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
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Items per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-1.5 border border-gray-300 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          PREV
        </button>

        <div className="flex items-center gap-1.5">
          {getPages().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <span className="px-2 text-gray-400">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition flex items-center justify-center border-2 ${
                    currentPage === page
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-800"
                  }`}
                  style={currentPage === page ? { backgroundColor: "#000" } : {}}
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
          className="px-4 py-1.5 border border-gray-300 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          NEXT
        </button>
      </div>
    </div>
  );
};

export default Pagination;
