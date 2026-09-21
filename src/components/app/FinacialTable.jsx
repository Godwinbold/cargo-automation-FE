import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { MoreVertical, Edit2, Eye, Trash2, Download, X } from "lucide-react";
import Pagination from "./Pagination";

// Action Menu Portal Component (Mobile Bottom Sheet + Desktop Clamped Popover)
const ActionMenuPortal = ({
  buttonRect,
  onClose,
  onEdit,
  onView,
  onDelete,
  onExport,
  id,
  item,
}) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const [menuPos, setMenuPos] = useState({
    top: 0,
    left: 0,
    openUpwards: false,
  });
  const menuRef = useRef(null);

  // Resize listener to toggle mobile vs desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Desktop coordinate calculation with viewport clamping
  useLayoutEffect(() => {
    if (isMobile || !buttonRect) return;

    const menuHeight = 220;
    const menuWidth = 224; // w-56 = 224px
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const shouldOpenUpwards = spaceBelow < menuHeight && spaceAbove > spaceBelow;

    let top = shouldOpenUpwards
      ? buttonRect.top - menuHeight - 8
      : buttonRect.bottom + 8;

    // Viewport clamping so menu NEVER overflows off the top or bottom edge
    top = Math.max(16, Math.min(window.innerHeight - menuHeight - 16, top));

    // Viewport clamping so menu NEVER overflows off the left or right edge
    let left = buttonRect.right - menuWidth;
    left = Math.max(16, Math.min(window.innerWidth - menuWidth - 16, left));

    setMenuPos({
      top,
      left,
      openUpwards: shouldOpenUpwards,
    });
  }, [buttonRect, isMobile]);

  // Click outside, escape key, and scroll handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    // On mobile: lock background scrolling while sheet is open
    if (isMobile) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }

    // On desktop: close menu when scrolling page
    window.addEventListener("scroll", onClose, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", onClose, true);
    };
  }, [onClose, isMobile]);

  // --- MOBILE BOTTOM SHEET ---
  if (isMobile) {
    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        />

        {/* Bottom Drawer */}
        <div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Financial Actions"
          className="relative z-10 w-full bg-white rounded-t-3xl shadow-2xl p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 ease-out flex flex-col gap-1 pb-8"
        >
          {/* Drag Handle Bar */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 flex-shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Financial Actions
              </p>
              <p className="text-base font-bold text-gray-900 mt-0.5">
                {item?.mawb ? `MAWB: ${item.mawb}` : "Financial Details"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action List */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                onEdit && onEdit(id);
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Edit2 className="w-4 h-4" />
              </div>
              <span>Edit Financial</span>
            </button>

            <button
              onClick={() => {
                onView && onView(id);
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <span>View Financial</span>
            </button>

            <button
              onClick={() => {
                onExport && onExport(id);
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <span>Export as CSV</span>
            </button>

            <div className="h-px bg-gray-100 my-1" />

            <button
              onClick={() => {
                onDelete && onDelete(id);
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <span>Delete Financial</span>
            </button>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full mt-2 py-3 bg-gray-100 active:bg-gray-200 text-gray-700 font-semibold rounded-xl text-center transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>,
      document.body,
    );
  }

  // --- DESKTOP DROPDOWN POPOVER ---
  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: "fixed",
        top: `${menuPos.top}px`,
        left: `${menuPos.left}px`,
      }}
      className={`w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[9999] animate-in fade-in zoom-in duration-200 ${
        menuPos.openUpwards ? "origin-bottom-right" : "origin-top-right"
      }`}
    >
      <button
        onClick={() => {
          onEdit && onEdit(id);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all font-medium"
      >
        <Edit2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
        Edit Financial
      </button>
      <button
        onClick={() => {
          onView && onView(id);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all font-medium"
      >
        <Eye className="w-4 h-4 text-green-500 flex-shrink-0" />
        View Financial
      </button>
      <button
        onClick={() => {
          onExport && onExport(id);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all font-medium"
      >
        <Download className="w-4 h-4 text-blue-600 flex-shrink-0" />
        Export as CSV
      </button>
      <div className="h-px bg-gray-100 my-1 mx-2" />
      <button
        onClick={() => {
          onDelete && onDelete(id);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all font-medium"
      >
        <Trash2 className="w-4 h-4 flex-shrink-0" />
        Delete Financial
      </button>
    </div>,
    document.body,
  );
};

const FinancialTable = ({
  data = [],
  color,
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  onEdit,
  onView,
  onDelete,
  onExport,
}) => {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [buttonRect, setButtonRect] = useState(null);
  const buttonRefs = useRef({});

  // Optimized headers mapping strictly matching user requirements
  const headerMapping = [
    { label: "S/N", key: "sn" },
    { label: "MAWB", key: "mawb" },
    { label: "Agent/Client", key: "agentsOrClients" },
    { label: "Date of Issue", key: "dateOfIssue" },
    { label: "Total Charge", key: "totalChargeNGN" },
    { label: "Product", key: "product" },
    { label: "Flight Number", key: "flightNo" },
    { label: "Gross Weight", key: "grossWeightKg" },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
  };

  const renderCellValue = (item, sn, key) => {
    if (key === "sn") return sn;
    if (key === "dateOfIssue") return formatDate(item[key]);

    const value = item[key];
    if (value === null || value === undefined || value === "") return "-";

    if (key === "totalChargeNGN") {
      const num = typeof value === "number" ? value : parseFloat(value);
      return !Number.isNaN(num)
        ? `₦${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : value;
    }

    if (key === "grossWeightKg") {
      const num = typeof value === "number" ? value : parseFloat(value);
      if (!Number.isNaN(num)) {
        return `${num.toLocaleString()} kg`;
      }
      return `${value} kg`;
    }

    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return value;
  };

  const handleMenuOpen = (id) => {
    if (activeMenuId === id) {
      setActiveMenuId(null);
      setButtonRect(null);
    } else {
      const rect = buttonRefs.current[id].getBoundingClientRect();
      setButtonRect(rect);
      setActiveMenuId(id);
    }
  };

  return (
    <div className="w-full h-full flex flex-col min-w-0">
      <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-20">
              <tr className="bg-gray-50 border-b border-gray-200">
                {headerMapping.map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-x border-gray-200 whitespace-nowrap"
                  >
                    {header.label}
                  </th>
                ))}
                <th className="px-4 py-3.5 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-200 sticky right-0 bg-gray-50 z-30">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item, rowIndex) => (
                <tr
                  key={item.id || rowIndex}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  {headerMapping.map((header, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-3 text-sm text-gray-700 border-x border-gray-100 whitespace-nowrap"
                    >
                      {renderCellValue(
                        item,
                        (currentPage - 1) * pageSize + rowIndex + 1,
                        header.key,
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 border-l border-gray-100 sticky right-0 bg-white group-hover:bg-gray-50 z-10 text-center">
                    <button
                      ref={(el) => (buttonRefs.current[item.id] = el)}
                      onClick={() => handleMenuOpen(item.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                      aria-label="Actions"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render Action Menu in a Portal */}
      {activeMenuId && buttonRect && (
        <ActionMenuPortal
          id={activeMenuId}
          item={data.find((d) => d.id === activeMenuId)}
          buttonRect={buttonRect}
          onClose={() => setActiveMenuId(null)}
          onEdit={onEdit}
          onView={onView}
          onDelete={onDelete}
          onExport={onExport}
        />
      )}

      {/* Pagination component */}
      {totalPages > 0 && (
        <div className="mt-4 flex-none">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            color={color}
          />
        </div>
      )}
    </div>
  );
};

export default FinancialTable;
