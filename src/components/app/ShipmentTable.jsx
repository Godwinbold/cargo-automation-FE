import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Pagination from "./Pagination";
import {
  useAddShipmentNote,
  useDeleteShipment,
} from "../../hooks/useShipment";
import { MoreHorizontal, Eye, MessageSquarePlus, Trash2 } from "lucide-react";

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
  const { mutate: addNoteMutation, isLoading: isSavingNote } = useAddShipmentNote();
  const { mutate: deleteShipmentMutation } = useDeleteShipment();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add", "edit", "view"
  const [currentRowId, setCurrentRowId] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this shipment?")) {
      deleteShipmentMutation(
        { airlineId, id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(["shipments", airlineId]);
            toast.success("Shipment deleted successfully");
            setActiveMenuId(null);
          },
          onError: (err) => {
            console.error("Error deleting shipment:", err);
            toast.error("Failed to delete shipment.");
          },
        },
      );
    }
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
                    <td className="border-b border-gray-300 px-4 py-3 relative">
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === item.id ? null : item.id)
                        }
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Actions"
                      >
                        <MoreHorizontal className="w-5 h-5 text-gray-500" />
                      </button>

                      {activeMenuId === item.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-4 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-30 animate-in fade-in zoom-in duration-200"
                        >
                          <button
                            onClick={() => openModal(item.id, "view")}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
                            View Details
                          </button>
                          <button
                            onClick={() => openModal(item.id, "add")}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <MessageSquarePlus className="w-4 h-4 text-green-500" />
                            Add Note
                          </button>
                          <div className="h-px bg-gray-100 my-1" />
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Shipment
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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
                    <DetailItem label="Airline ID" value={currentRow?.airlineId} />
                    <DetailItem label="Airway Bill" value={currentRow?.airwayBillNumber} />
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

                  <div className="md:col-span-2 mt-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
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
                    disabled={
                      !newNote.trim() || isSavingNote
                    }
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
