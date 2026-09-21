import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Pagination from "./Pagination";
import {
  useAddShipmentNote,
  useDeleteShipment,
  useChangeShipmentStatus,
} from "../../hooks/useShipment";
import {
  Eye,
  MessageSquarePlus,
  Trash2,
  CircleDollarSign,
  FileUp,
  MoreVertical,
  RefreshCw,
  X,
} from "lucide-react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import CreateFinancialsModal from "./CreateFinancialsModal";
import UploadDocumentModal from "./UploadDocumentModal";
import ChangeStatusModal from "./ChangeStatusModal";

const STATUS_FLOW = ["Accepted", "Booked", "Flown", "Delivered"];

const statusColors = {
  Accepted: "bg-[#F6FEF9] text-[#006428]",
  Booked: "bg-[#FEFCF6] text-[#845E00]",
  Delivered: "bg-[#FDF6FE] text-[#A800C3]",
  Flown: "bg-[#F6F9FE] text-[#0C5EE3]",
};

// Action Menu Portal Component (Mobile Bottom Sheet + Desktop Clamped Popover)
const ActionMenuPortal = ({
  buttonRect,
  onClose,
  onView,
  onAddNote,
  onChangeStatus,
  onCreateFinancials,
  onUploadDocument,
  onDelete,
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

  // Track window resize to toggle mobile bottom sheet vs desktop dropdown
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

    const menuHeight = 320;
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
        {/* Backdrop Overlay */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        />

        {/* Bottom Drawer */}
        <div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Shipment Actions"
          className="relative z-10 w-full bg-white rounded-t-3xl shadow-2xl p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 ease-out flex flex-col gap-1 pb-8"
        >
          {/* Drag Handle Bar */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 flex-shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Shipment Actions
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-bold text-gray-900">
                  {item?.airwayBillNumber || "Shipment"}
                </span>
                {item?.statusDisplay && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      statusColors[item.statusDisplay] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.statusDisplay}
                  </span>
                )}
              </div>
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
                onView(item.id);
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <span>View Details</span>
            </button>

            <button
              onClick={() => {
                onAddNote(item.id);
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <MessageSquarePlus className="w-4 h-4" />
              </div>
              <span>Add Note</span>
            </button>

            <button
              onClick={() => {
                onChangeStatus(item);
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <span>
                {item?.statusDisplay === "Delivered"
                  ? "Status (Delivered)"
                  : "Change Status"}
              </span>
            </button>

            <button
              onClick={() => {
                onCreateFinancials(item);
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                <CircleDollarSign className="w-4 h-4" />
              </div>
              <span>Create Financials</span>
            </button>

            <button
              onClick={() => {
                onUploadDocument(item);
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                <FileUp className="w-4 h-4" />
              </div>
              <span>Upload Document</span>
            </button>

            <div className="h-px bg-gray-100 my-1" />

            <button
              onClick={() => {
                onDelete(item);
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <span>Delete Shipment</span>
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
          onView(item.id);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
      >
        <Eye className="w-4 h-4 text-blue-500 flex-shrink-0" />
        View Details
      </button>
      <button
        onClick={() => {
          onAddNote(item.id);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
      >
        <MessageSquarePlus className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        Add Note
      </button>
      <button
        onClick={() => {
          onChangeStatus(item);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
      >
        <RefreshCw className="w-4 h-4 text-amber-500 flex-shrink-0" />
        {item?.statusDisplay === "Delivered"
          ? "Status (Delivered)"
          : "Change Status"}
      </button>
      <button
        onClick={() => {
          onCreateFinancials(item);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
      >
        <CircleDollarSign className="w-4 h-4 text-orange-500 flex-shrink-0" />
        Create Financials
      </button>
      <button
        onClick={() => {
          onUploadDocument(item);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
      >
        <FileUp className="w-4 h-4 text-purple-500 flex-shrink-0" />
        Upload Document
      </button>
      <div className="h-px bg-gray-100 my-1" />
      <button
        onClick={() => {
          onDelete(item);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
      >
        <Trash2 className="w-4 h-4 flex-shrink-0" />
        Delete Shipment
      </button>
    </div>,
    document.body,
  );
};

const ShipmentTable = ({
  color,
  data,
  airlineId,
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
}) => {
  const queryClient = useQueryClient();
  const { mutate: addNoteMutation, isPending: isSavingNote } =
    useAddShipmentNote();
  const { mutate: deleteShipmentMutation, isPending: isDeleting } =
    useDeleteShipment();
  const { mutate: changeStatusMutation, isPending: isUpdatingStatus } =
    useChangeShipmentStatus();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add", "edit", "view"
  const [currentRowId, setCurrentRowId] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeMenuDoc, setActiveMenuDoc] = useState(null);
  const [buttonRect, setButtonRect] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState(null);
  const [showFinancialsModal, setShowFinancialsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const buttonRefs = useRef({});

  // Close menu on click outside is now handled in ActionMenuPortal
  // but we still need to clear activeMenuId when a modal opens or on item select

  const openModal = (id, mode = "add") => {
    setCurrentRowId(id);
    setModalMode(mode);
    setNewNote(""); // Keep it empty for adding notes
    setShowModal(true);
    setActiveMenuId(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentRowId(null);
    setNewNote("");
    setModalMode("add");
  };

  const saveNote = () => {
    if (!newNote.trim()) return;

    addNoteMutation(
      {
        airlineId,
        id: currentRowId,
        data: { content: newNote },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["shipments", airlineId]);
          toast.success("Note added successfully");
          closeModal();
        },
        onError: (err) => {
          console.error("Error adding note:", err);
          toast.error("Failed to add note. Please try again.");
        },
      },
    );
  };

  const handleStatusUpdate = (status) => {
    if (!selectedShipment) return;

    const currentStatus = selectedShipment.statusDisplay || "Accepted";
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);

    if (currentStatus === "Delivered" || currentIndex === STATUS_FLOW.length - 1) {
      toast.error("Delivered status is final and cannot be modified.");
      return;
    }

    const nextAllowed = STATUS_FLOW[currentIndex + 1];
    if (status !== nextAllowed) {
      toast.error(`Invalid status transition. Next status must be "${nextAllowed}".`);
      return;
    }

    changeStatusMutation(
      {
        airlineId,
        id: selectedShipment.id,
        data: { status },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["shipments", airlineId]);
          toast.success(`Status updated to ${status} successfully`);
          setShowStatusModal(false);
          setSelectedShipment(null);
        },
        onError: (err) => {
          console.error("Error changing status:", err);
          const message =
            err.response?.data?.message ||
            "Failed to change status. Please try again.";
          toast.error(message);
        },
      },
    );
  };

  const handleDeleteClick = (shipment) => {
    setShipmentToDelete(shipment);
    setShowDeleteModal(true);
    setActiveMenuId(null);
  };

  const confirmDelete = () => {
    if (!shipmentToDelete) return;

    deleteShipmentMutation(
      { airlineId, id: shipmentToDelete.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["shipments", airlineId]);
          toast.success("Shipment deleted successfully");
          setShowDeleteModal(false);
          setShipmentToDelete(null);
        },
        onError: (err) => {
          console.error("Error deleting shipment:", err);
          toast.error("Failed to delete shipment.");
          setShowDeleteModal(false);
        },
      },
    );
  };

  const inputClass =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  const DetailItem = ({ label, value, className = "" }) => (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">
        {label}
      </label>
      <div
        className={`px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 shadow-sm ${className}`}
      >
        {value || "N/A"}
      </div>
    </div>
  );

  const currentRow = data.find((item) => item.id === currentRowId);

  return (
    <div className="p-1 sm:p-6">
      <div className="flex justify-between items-center mb-3 sm:mb-6 px-1 sm:px-0">
        <h2 className="text-xl font-bold text-gray-800">Shipments</h2>
      </div>

      {/* Mobile Card View (md:hidden) */}
      <div className="block md:hidden space-y-2.5">
        {data?.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500 shadow-sm">
            No shipments found.
          </div>
        ) : (
          data?.map((item) => (
            <div
              key={`card-${item.id}`}
              className="bg-white rounded-xl border border-gray-200/90 p-3.5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Row 1: Airway Bill Number (left) & Action Button (right) */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Airway Bill Number
                  </div>
                  <div className="font-bold text-gray-900 text-base tracking-tight truncate">
                    {item.airwayBillNumber}
                  </div>
                </div>
                <button
                  ref={(el) => (buttonRefs.current[`mobile-${item.id}`] = el)}
                  onClick={() => {
                    if (activeMenuId === item.id) {
                      setActiveMenuId(null);
                      setButtonRect(null);
                      setActiveMenuDoc(null);
                    } else {
                      const rect =
                        buttonRefs.current[
                          `mobile-${item.id}`
                        ]?.getBoundingClientRect() || {
                          top: 0,
                          bottom: 0,
                          left: 0,
                          right: 0,
                        };
                      setButtonRect(rect);
                      setActiveMenuId(item.id);
                      setActiveMenuDoc(item);
                    }
                  }}
                  className="p-1.5 -mr-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                  aria-label={`Actions for ${item.airwayBillNumber}`}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Row 2: Status (left) & Date (right) */}
              <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      statusColors[item.statusDisplay] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.statusDisplay}
                  </span>
                </div>
                <div className="text-xs font-medium text-gray-500">
                  {item.shipmentDate
                    ? new Date(item.shipmentDate).toLocaleDateString()
                    : item.date}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (hidden md:block) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="min-h-[350px]">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="border-b border-gray-200 px-4 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Airway Bill Number
                </th>
                <th className="border-b border-gray-200 px-4 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="border-b border-gray-200 px-4 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="border-b border-gray-200 px-4 py-3.5 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-20 whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item) => {
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="border-b border-gray-300 px-4 py-3 font-medium text-gray-900">
                      {item.airwayBillNumber}
                    </td>
                    <td className="border-b border-gray-300 px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          statusColors[item.statusDisplay] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.statusDisplay}
                      </span>
                    </td>
                    <td className="border-b border-gray-300 px-4 py-3">
                      {item.shipmentDate
                        ? new Date(item.shipmentDate).toLocaleDateString()
                        : item.date}
                    </td>
                    {/* <td className="border-b truncate max-w-xs border-gray-300 px-4 py-3">
                      {item.notes?.length > 0 ? item.notes[0].content : ""}
                    </td> */}
                    <td className="border-b border-gray-300 px-4 py-3 text-center">
                      <button
                        ref={(el) => (buttonRefs.current[item.id] = el)}
                        onClick={() => {
                          if (activeMenuId === item.id) {
                            setActiveMenuId(null);
                            setButtonRect(null);
                            setActiveMenuDoc(null);
                          } else {
                            const rect =
                              buttonRefs.current[
                                item.id
                              ]?.getBoundingClientRect();
                            if (rect) {
                              setButtonRect(rect);
                              setActiveMenuId(item.id);
                              setActiveMenuDoc(item);
                            }
                          }
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors inline-block"
                        aria-label="Actions"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination component */}
      {data?.length > 0 && (
        <div className="mt-2.5 sm:mt-4">
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

      {/* Action Menu Portal */}
      {activeMenuId && buttonRect && (
        <ActionMenuPortal
          item={activeMenuDoc}
          buttonRect={buttonRect}
          onClose={() => {
            setActiveMenuId(null);
            setActiveMenuDoc(null);
            setButtonRect(null);
          }}
          onView={(id) => openModal(id, "view")}
          onAddNote={(id) => openModal(id, "add")}
          onChangeStatus={(item) => {
            setSelectedShipment(item);
            setShowStatusModal(true);
          }}
          onCreateFinancials={(item) => {
            setSelectedShipment(item);
            setShowFinancialsModal(true);
          }}
          onUploadDocument={(item) => {
            setSelectedShipment(item);
            setShowUploadModal(true);
          }}
          onDelete={handleDeleteClick}
        />
      )}

      <ChangeStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusUpdate}
        currentStatus={selectedShipment?.statusDisplay}
        airwayBillNumber={selectedShipment?.airwayBillNumber}
        isUpdating={isUpdatingStatus}
        color={color}
      />

      {/* Note Modal */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeModal}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className={`bg-white rounded-xl shadow-2xl ${
                modalMode === "view" ? "max-w-2xl" : "max-w-lg"
              } w-full p-6 animate-in overflow-y-auto max-h-[90vh]`}
              style={{ animation: "modalPop 0.3s ease-out forwards" }}
            >
              <h3 className="text-xl font-bold text-center border-b border-gray-300 pb-4 mb-6 text-gray-800">
                {modalMode === "view"
                  ? `Shipment Details: ${currentRow?.airwayBillNumber}`
                  : `${modalMode} Note: ${currentRow?.airwayBillNumber}`}
              </h3>

              {modalMode === "view" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <DetailItem label="Shipment ID" value={currentRow?.id} />
                    <DetailItem
                      label="Airline ID"
                      value={currentRow?.airlineId}
                    />
                    <DetailItem
                      label="Airway Bill"
                      value={currentRow?.airwayBillNumber}
                    />
                  </div>
                  <div className="space-y-3">
                    <DetailItem
                      label="Status"
                      className={`font-semibold ${statusColors[currentRow?.statusDisplay] || ""}`}
                      value={currentRow?.statusDisplay}
                    />
                    <DetailItem
                      label="Shipment Date"
                      value={
                        currentRow?.shipmentDate
                          ? new Date(currentRow.shipmentDate).toLocaleString()
                          : "N/A"
                      }
                    />
                    <DetailItem
                      label="Created Date"
                      value={
                        currentRow?.createdDate
                          ? new Date(currentRow.createdDate).toLocaleString()
                          : "N/A"
                      }
                    />
                    <DetailItem
                      label="Updated Date"
                      value={
                        currentRow?.updatedDate
                          ? new Date(currentRow.updatedDate).toLocaleString()
                          : "N/A"
                      }
                    />
                  </div>

                  <div className="md:col-span-2 mt-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide space-y-3">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-0.5">
                      Notes history
                    </h4>
                    {currentRow?.notes && currentRow.notes.length > 0 ? (
                      <div className="space-y-3">
                        {currentRow.notes.map((note, idx) => (
                          <div
                            key={note.id || idx}
                            className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm"
                          >
                            <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                              {note.content || note.text}
                            </p>
                            <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-60"></span>
                              {note.createdDate
                                ? new Date(note.createdDate).toLocaleString()
                                : "No date"}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
                        No notes available for this shipment.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Airway Bill Number
                    </label>
                    <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                      {currentRow?.airwayBillNumber}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipment Note
                    </label>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className={`${inputClass} resize-none`}
                      rows={5}
                      placeholder="Type your note here..."
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
                >
                  {modalMode === "view" ? "Close" : "Cancel"}
                </button>
                {modalMode !== "view" && (
                  <button
                    onClick={saveNote}
                    disabled={!newNote.trim() || isSavingNote}
                    style={{ backgroundColor: color }}
                    className="px-5 py-2 text-white rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 min-w-[120px]"
                  >
                    {isSavingNote ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      "Save Note"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        airwayBillNumber={shipmentToDelete?.airwayBillNumber}
        isDeleting={isDeleting}
        color={color}
      />

      <CreateFinancialsModal
        isOpen={showFinancialsModal}
        onClose={() => setShowFinancialsModal(false)}
        airlineId={airlineId}
        shipmentId={selectedShipment?.id}
        airwayBillNumber={selectedShipment?.airwayBillNumber}
        color={color}
      />

      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        airlineId={airlineId}
        shipmentId={selectedShipment?.id}
        airwayBillNumber={selectedShipment?.airwayBillNumber}
        color={color}
      />

      {/* Modal Animation Keyframes */}
      <style>{`
        @keyframes modalPop {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ShipmentTable;
