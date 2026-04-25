import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Pagination from "./Pagination";
import { useAddShipmentNote, useDeleteShipment } from "../../hooks/useShipment";
import {
  MoreHorizontal,
  Eye,
  MessageSquarePlus,
  Trash2,
  CircleDollarSign,
  FileUp,
  MoreVertical,
} from "lucide-react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import CreateFinancialsModal from "./CreateFinancialsModal";
import UploadDocumentModal from "./UploadDocumentModal";

// Action Menu Portal Component
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
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, openUpwards: false });
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!buttonRect) return;
    const menuHeight = 280; // Approximate height of the menu
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const shouldOpenUpwards = spaceBelow < menuHeight;
    setMenuPos({
      top: shouldOpenUpwards
        ? buttonRect.top - menuHeight - 8
        : buttonRect.bottom + 8,
      left: buttonRect.right - 192, // 192 is w-48
      openUpwards: shouldOpenUpwards,
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
      }}
      className={`w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-[9999] animate-in fade-in zoom-in duration-200 ${
        menuPos.openUpwards ? "origin-bottom-right" : "origin-top-right"
      }`}
    >
      <button
        onClick={() => {
          onView(item.id);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Eye className="w-4 h-4 text-blue-500" />
        View Details
      </button>
      <button
        onClick={() => {
          onAddNote(item.id);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <MessageSquarePlus className="w-4 h-4 text-green-500" />
        Add Note
      </button>
      <button
        onClick={() => {
          onChangeStatus(item.id);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <MessageSquarePlus className="w-4 h-4 text-green-500" />
        Change Status
      </button>
      <button
        onClick={() => {
          onCreateFinancials(item);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <CircleDollarSign className="w-4 h-4 text-orange-500" />
        Create Financials
      </button>
      <button
        onClick={() => {
          onUploadDocument(item);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <FileUp className="w-4 h-4 text-purple-500" />
        Upload Document
      </button>
      <div className="h-px bg-gray-100 my-1" />
      <button
        onClick={() => {
          onDelete(item);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
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
  onOpenCreateModal,
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
}) => {
  const queryClient = useQueryClient();
  const { mutate: addNoteMutation, isLoading: isSavingNote } =
    useAddShipmentNote();
  const { mutate: deleteShipmentMutation, isPending: isDeleting } =
    useDeleteShipment();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add", "edit", "view"
  const [currentRowId, setCurrentRowId] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeMenuDoc, setActiveMenuDoc] = useState(null);
  const [buttonRect, setButtonRect] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState(null);
  const [showFinancialsModal, setShowFinancialsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const buttonRefs = useRef({});
  const menuRef = useRef(null);

  // Close menu on click outside is now handled in ActionMenuPortal
  // but we still need to clear activeMenuId when a modal opens or on item select

  const statusColors = {
    Accepted: "bg-[#F6FEF9] text-[#006428]",
    Booked: "bg-[#FEFCF6] text-[#845E00]",
    Delivered: "bg-[#FDF6FE] text-[#A800C3]",
    Flown: "bg-[#F6F9FE] text-[#0C5EE3]",
  };

  const statusOptions = ["Accepted", "Booked", "Delivered", "Flown"];

  const statusMap = {
    Accepted: 0,
    Booked: 1,
    Delivered: 2,
    Flown: 3,
  };

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
  const saveStatus = () => {
    if (!newStatus.trim()) return;

    addNoteMutation(
      {
        airlineId,
        id: currentRowId,
        data: { status: newStatus },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["shipments", airlineId]);
          toast.success("Status changed successfully");
          closeModal();
        },
        onError: (err) => {
          console.error("Error changing status:", err);
          toast.error("Failed to change status. Please try again.");
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
  const currentRowFirstNote =
    currentRow && currentRow.notes && currentRow.notes.length > 0
      ? currentRow.notes[0]
      : null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Shipments</h2>
      </div>

      <div className="overflow-x-auto">
        <div className="h-[calc(100vh-200px)]">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border-b border-gray-300 px-4 py-3 text-left">
                  Airway Bill Number
                </th>
                <th className="border-b border-gray-300 px-4 py-3 text-left">
                  Status
                </th>
                <th className="border-b border-gray-300 px-4 py-3 text-left">
                  Date
                </th>
                {/* <th className="border-b border-gray-300 px-4 py-3 text-left">
                  Note
                </th> */}
                <th className="border-b border-gray-300 px-4 py-3 text-left">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item) => {
                const firstNote =
                  item.notes && item.notes.length > 0 ? item.notes[0] : null;

                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="border-b border-gray-300 px-4 py-3">
                      {item.airwayBillNumber}
                    </td>
                    <td className="border-b border-gray-300 px-4 py-3">
                      {item.statusDisplay}
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
                            const rect = buttonRefs.current[item.id]?.getBoundingClientRect();
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
            onChangeStatus={(id) => saveStatus(id)}
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

        {data?.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            color={color}
          />
        )}
      </div>

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
