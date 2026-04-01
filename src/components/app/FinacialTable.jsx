import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { MoreVertical, Edit2, Eye, Trash2 } from "lucide-react";
import Pagination from "./Pagination";

// Action Menu Portal Component
const ActionMenuPortal = ({
  buttonRect,
  onClose,
  onEdit,
  onView,
  onDelete,
  id,
}) => {
  const [menuPos, setMenuPos] = useState({
    top: 0,
    left: 0,
    openUpwards: false,
  });
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!buttonRect) return;

    const menuHeight = 160; // Approximate height of the menu
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const shouldOpenUpwards = spaceBelow < menuHeight;

    setMenuPos({
      top: shouldOpenUpwards
        ? buttonRect.top - menuHeight - 8
        : buttonRect.bottom + 8,
      left: buttonRect.right - 176, // 176 is the menu width (w-44)
      openUpwards: shouldOpenUpwards,
    });
  }, [buttonRect]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", onClose, true); // Close on any scroll
    window.addEventListener("resize", onClose);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: `${menuPos.top}px`,
        left: `${menuPos.left}px`,
        width: "15rem", // w-44
      }}
      className="bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[9999] animate-in fade-in zoom-in duration-200"
    >
      <button
        onClick={() => {
          onEdit && onEdit(id);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all font-medium"
      >
        <Edit2 className="w-4 h-4 text-blue-500" />
        Edit Financial
      </button>
      <button
        onClick={() => {
          onView && onView(id);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all font-medium"
      >
        <Eye className="w-4 h-4 text-green-500" />
        View Financial
      </button>
      <div className="h-px bg-gray-100 my-1 mx-2" />
      <button
        onClick={() => {
          onDelete && onDelete(id);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all font-medium"
      >
        <Trash2 className="w-4 h-4" />
        Delete Financial
      </button>
    </div>,
    document.body,
  );
};

const FinancialTable = ({
  data = [],
  color,
  airlineId,
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  onEdit,
  onView,
  onDelete,
}) => {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [buttonRect, setButtonRect] = useState(null);
  const buttonRefs = useRef({});

  // All headers mapping to JSON keys
  const headerMapping = [
    { label: "S/N", key: "sn" },
    { label: "MAWB", key: "mawb" },
    { label: "Date of Issue", key: "dateOfIssue" },
    { label: "Agents/Clients", key: "agentsOrClients" },
    { label: "Product", key: "product" },
    { label: "Routing", key: "routing" },
    { label: "Flight No", key: "flightNo" },
    { label: "Pieces", key: "pieces" },
    { label: "Chargeable Weight (Kg)", key: "chargeableWeightKg" },
    { label: "Gross Weight (Kg)", key: "grossWeightKg" },
    { label: "Spot Rate", key: "spotRate" },
    { label: "Published Rates", key: "publishedRates" },
    { label: "ROE", key: "roe" },
    { label: "Freight Amt (NGN)", key: "freightAmountNGN" },
    { label: "NCAA (5%)", key: "ncaaCharges5Percent" },
    { label: "Total Charge (NGN)", key: "totalChargeNGN" },
    { label: "Charges Collect", key: "chargesCollect" },
    { label: "Fuel Surcharge", key: "fuelSurcharge" },
    { label: "SEC Surcharge", key: "secSurcharge" },
    { label: "Handling Surcharge", key: "handlingSurcharge" },
    { label: "Surcharge (Agent)", key: "surchargeDueAgent" },
    { label: "AWB Fee", key: "awbFee" },
    { label: "GSA Commission (NGN)", key: "gsaCommissionNGN" },
    { label: "VAT (Commission)", key: "vatOnCommission" },
    { label: "Amt Due Airline", key: "amtDueAirline" },
    { label: "Due APG Inc", key: "dueAPGInc" },
    { label: "Due SLC", key: "dueSLC" },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderCellValue = (item, sn, key) => {
    if (key === "sn") return sn;
    if (key === "dateOfIssue") return formatDate(item[key]);

    const value = item[key];
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return value || "-";
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
        <div className="overflow-auto flex-1">
          <table className="w-full border-collapse min-w-max">
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
                      className="px-4 py-3 text-sm text-gray-600 border-x border-gray-100 whitespace-nowrap"
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
          buttonRect={buttonRect}
          onClose={() => setActiveMenuId(null)}
          onEdit={onEdit}
          onView={onView}
          onDelete={onDelete}
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
