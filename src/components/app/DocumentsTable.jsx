import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { MoreVertical, Eye, Download, Trash2, Edit2 } from "lucide-react";
import Pagination from "./Pagination";

// Action Menu Portal Component
const ActionMenuPortal = ({
  buttonRect,
  onClose,
  onView,
  onDownload,
  onEdit,
  onDelete,
  doc,
}) => {
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!buttonRect) return;
    const menuHeight = 160;
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const shouldOpenUpwards = spaceBelow < menuHeight;
    setMenuPos({
      top: shouldOpenUpwards
        ? buttonRect.top - menuHeight - 8
        : buttonRect.bottom + 8,
      left: buttonRect.right - 176,
    });
  }, [buttonRect]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", onClose, true);
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
        width: "15rem",
      }}
      className="bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[9999] animate-in fade-in zoom-in duration-200"
    >
      <button
        onClick={() => {
          onView && onView(doc);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all font-medium"
      >
        <Eye className="w-4 h-4 text-green-500" />
        View / Preview
      </button>
      <button
        onClick={() => {
          onDownload && onDownload(doc);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all font-medium"
      >
        <Download className="w-4 h-4 text-blue-500" />
        Download
      </button>
      <button
        onClick={() => {
          onEdit && onEdit(doc);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all font-medium"
      >
        <Edit2 className="w-4 h-4 text-orange-500" />
        Edit Document
      </button>
      <div className="h-px bg-gray-100 my-1 mx-2" />
      <button
        onClick={() => {
          onDelete && onDelete(doc);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all font-medium"
      >
        <Trash2 className="w-4 h-4" />
        Delete Document
      </button>
    </div>,
    document.body,
  );
};

const DocumentsTable = ({
  data = [],
  color,
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  onView,
  onDownload,
  onEdit,
  onDelete,
  onUpload,
}) => {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeMenuDoc, setActiveMenuDoc] = useState(null);
  const [buttonRect, setButtonRect] = useState(null);
  const buttonRefs = useRef({});

  // Column mapping matching actual API response
  const headerMapping = [
    { label: "S/N", key: "sn" },
    { label: "Airway Bill", key: "airwayBillNumber" },
    { label: "Shipment Date", key: "shipmentDate" },
    { label: "Uploaded By", key: "uploadedByUserId" },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const formatBytes = (bytes) => {
    if (bytes == null) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderCellValue = (item, sn, key) => {
    if (key === "sn") return sn;
    if (key === "shipmentDate" || key === "uploadedAt")
      return formatDate(item[key]);
    if (key === "fileSizeBytes") return formatBytes(item[key]);
    const value = item[key];
    if (value === null || value === undefined || value === "") return "-";
    return value;
  };

  const handleMenuOpen = (id, doc) => {
    if (activeMenuId === id) {
      setActiveMenuId(null);
      setActiveMenuDoc(null);
      setButtonRect(null);
    } else {
      const rect = buttonRefs.current[id]?.getBoundingClientRect();
      if (rect) {
        setButtonRect(rect);
        setActiveMenuId(id);
        setActiveMenuDoc(doc);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col min-w-0">
      {/* Upload Button */}
      {/* <div className="flex-none flex justify-end mb-3">
        <button
          onClick={onUpload}
          style={{ backgroundColor: color }}
          className="px-5 py-2.5 text-white rounded-lg hover:opacity-90 transition shadow-sm font-medium flex items-center gap-2"
        >
          <Upload size={16} />
          Upload Document
        </button>
      </div> */}

      {/* Table */}
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
                      onClick={() => handleMenuOpen(item.id, item)}
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

      {/* Action Menu Portal */}
      {activeMenuId && buttonRect && (
        <ActionMenuPortal
          doc={activeMenuDoc}
          buttonRect={buttonRect}
          onClose={() => {
            setActiveMenuId(null);
            setActiveMenuDoc(null);
          }}
          onView={onView}
          onDownload={onDownload}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}

      {/* Pagination */}
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

export default DocumentsTable;
