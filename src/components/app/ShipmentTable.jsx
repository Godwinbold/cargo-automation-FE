import React, { useState } from "react";

const ShipmentTable = ({ color, data, setData }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentRowId, setCurrentRowId] = useState(null);
  const [newNote, setNewNote] = useState("");

  // Create Shipment Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newShipment, setNewShipment] = useState({
    airwayBillNumber: "",
    status: "Booked",
    date: "",
    note: "",
  });

  const statusColors = {
    Accepted: "bg-[#F6FEF9] text-[#006428]",
    Booked: "bg-[#FEFCF6] text-[#845E00]",
    Delivered: "bg-[#FDF6FE] text-[#A800C3]",
    Flown: "bg-[#F6F9FE] text-[#0C5EE3]",
  };

  const statusOptions = ["Accepted", "Booked", "Delivered", "Flown"];

  const updateStatus = (id, newStatus) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  const openModal = (id) => {
    const row = data.find((item) => item.id === id);
    setCurrentRowId(id);
    setNewNote(row.note ? row.note.text : ""); // pre-fill if exists
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentRowId(null);
    setNewNote("");
  };

  const saveNote = () => {
    if (!newNote.trim()) return;

    const noteText = newNote.trim();
    const noteDate = new Date().toISOString().split("T")[0]; // today: 2025-11-18

    setData((prev) =>
      prev.map((item) =>
        item.id === currentRowId
          ? { ...item, note: { text: noteText, date: noteDate } }
          : item
      )
    );

    closeModal();
  };

  // Create Shipment Logic
  const handleCreateShipment = () => {
    if (!newShipment.airwayBillNumber || !newShipment.date) return;

    const newId = data.length > 0 ? Math.max(...data.map((i) => i.id)) + 1 : 1;
    const shipmentToAdd = {
      id: newId,
      airwayBillNumber: newShipment.airwayBillNumber,
      status: newShipment.status,
      date: newShipment.date,
      note: newShipment.note
        ? {
            text: newShipment.note,
            date: new Date().toISOString().split("T")[0],
          }
        : null,
    };

    setData((prev) => [...prev, shipmentToAdd]);
    setShowCreateModal(false);
    setNewShipment({
      airwayBillNumber: "",
      status: "Booked",
      date: "",
      note: "",
    });
  };

  const inputClass =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  const currentRow = data.find((item) => item.id === currentRowId);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Shipments</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ backgroundColor: color }}
          className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition shadow-sm font-medium"
        >
          + Create Shipment
        </button>
      </div>

      <div className="overflow-x-auto">
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
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="border-b border-gray-300 px-4 py-3">
                  {item.airwayBillNumber}
                </td>
                <td className="border-b border-gray-300 px-4 py-3">
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value)}
                    className={`px-4 py-3 rounded-full border ${
                      statusColors[item.status]
                    } focus:outline-none focus:ring-1 focus:ring-[#004DCC]`}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border-b border-gray-300 px-4 py-3">
                  {item.date}
                </td>
                <td className="border-b border-gray-300 px-4 py-3">
                  {item.note ? (
                    <div
                      onClick={() => openModal(item.id)}
                      className="cursor-pointer group flex items-center gap-2 max-w-md"
                    >
                      <span className="text-sm text-gray-800 truncate">
                        {item.note.text}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({item.note.date})
                      </span>
                      <span className="opacity-0 group-hover:opacity-100 text-xs text-blue-600 font-medium transition">
                        ✏️ Edit
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => openModal(item.id)}
                      className="px-4 py-2 border rounded-lg text-sm transition hover:bg-gray-100"
                    >
                      + Add Note
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in"
              style={{ animation: "modalPop 0.3s ease-out forwards" }}
            >
              <h3 className="text-xl font-semibold mb-4">
                Note for {currentRow?.airwayBillNumber}
              </h3>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className={`${inputClass} resize-none`}
                rows={5}
                placeholder="Type your note here..."
                autoFocus
              />
              {currentRow?.note && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <strong>Current note:</strong> {currentRow.note.text}{" "}
                  <span className="text-xs">({currentRow.note.date})</span>
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNote}
                  disabled={!newNote.trim()}
                  style={{ backgroundColor: color }}
                  className="px-5 py-2 text-white rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50"
                  data-oid="save-note-btn"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Shipment Modal */}
      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in"
              style={{ animation: "modalPop 0.3s ease-out forwards" }}
            >
              <h3 className="text-xl font-semibold mb-6">
                Create New Shipment
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Airway Bill Number
                  </label>
                  <input
                    type="text"
                    value={newShipment.airwayBillNumber}
                    onChange={(e) =>
                      setNewShipment({
                        ...newShipment,
                        airwayBillNumber: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="e.g. AWB-1008"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={newShipment.status}
                      onChange={(e) =>
                        setNewShipment({
                          ...newShipment,
                          status: e.target.value,
                        })
                      }
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      ▼
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newShipment.date}
                    onChange={(e) =>
                      setNewShipment({ ...newShipment, date: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note
                  </label>
                  <textarea
                    value={newShipment.note}
                    onChange={(e) =>
                      setNewShipment({ ...newShipment, note: e.target.value })
                    }
                    className={`${inputClass} resize-none`}
                    rows={3}
                    placeholder="Optional note"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateShipment}
                  disabled={!newShipment.airwayBillNumber || !newShipment.date}
                  style={{ backgroundColor: color }}
                  className="px-5 py-2 text-white rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50"
                  data-oid="create-shipment-btn"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Animation Keyframes */}
      <style jsx>{`
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
