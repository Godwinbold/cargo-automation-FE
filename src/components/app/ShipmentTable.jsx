import React, { useState } from "react";

const ShipmentTable = ({ color }) => {
  const [data, setData] = useState([
    {
      id: 1,
      airwayBillNumber: "AWB-1001",
      status: "Accepted",
      date: "2025-10-01",
      note: null,
    },
    {
      id: 2,
      airwayBillNumber: "AWB-1002",
      status: "Booked",
      date: "2025-10-01",
      note: null,
    },
    {
      id: 3,
      airwayBillNumber: "AWB-1003",
      status: "Delivered",
      date: "2025-10-01",
      note: null,
    },
    {
      id: 4,
      airwayBillNumber: "AWB-1004",
      status: "Flown",
      date: "2025-10-01",
      note: null,
    },
    {
      id: 5,
      airwayBillNumber: "AWB-1005",
      status: "Booked",
      date: "2025-10-01",
      note: null,
    },
    {
      id: 6,
      airwayBillNumber: "AWB-1006",
      status: "Accepted",
      date: "2025-10-01",
      note: null,
    },
    {
      id: 7,
      airwayBillNumber: "AWB-1007",
      status: "Delivered",
      date: "2025-10-01",
      note: null,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [currentRowId, setCurrentRowId] = useState(null);
  const [newNote, setNewNote] = useState("");

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

  const currentRow = data.find((item) => item.id === currentRowId);

  return (
    <div className="p-6">
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
                    className="px-4 py-2  rounded-lg text-sm transition"
                  >
                    + Add Note
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Animated Modal */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 transform transition-all duration-300 ease-out scale-100 opacity-100 animate-in"
              style={{
                animation: "modalPop 0.3s ease-out forwards",
              }}
            >
              <h3 className="text-xl font-semibold mb-4">
                Note for {currentRow?.airwayBillNumber}
              </h3>

              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                  className="px-5 py-2  disabled:bg-blue-300 text-white rounded-lg transition disabled:cursor-not-allowed"
                >
                  Save Note
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
            transform: scale(0.9) translateY(-20px);
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
