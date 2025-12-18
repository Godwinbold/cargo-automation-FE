import React, { useState } from "react";
import { Eye, Download } from "lucide-react";

const DocumentsTable = ({ airwayBills, setAirwayBills, color }) => {
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Create Document Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    billNumber: "",
    shipmentDate: "",
  });

  // Filter data based on selected date
  const filteredBills = filterDate
    ? airwayBills.filter((bill) => bill.shipmentDate === filterDate)
    : airwayBills;

  // Pagination
  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBills = filteredBills.slice(startIndex, endIndex);

  const handleView = (billNumber) => {
    alert(`Viewing: ${billNumber}`);
  };

  const handleDownload = (billNumber) => {
    alert(`Downloading: ${billNumber}`);
  };

  const handleUpload = () => {
    alert("Upload scanned document");
  };

  // Create Document Logic
  const handleCreateDocument = () => {
    if (!newDocument.billNumber || !newDocument.shipmentDate) return;

    const newId =
      airwayBills.length > 0
        ? Math.max(...airwayBills.map((i) => i.id)) + 1
        : 1;
    const documentToAdd = {
      id: newId,
      billNumber: newDocument.billNumber,
      shipmentDate: newDocument.shipmentDate,
    };

    setAirwayBills((prev) => [...prev, documentToAdd]);
    setShowCreateModal(false);
    setNewDocument({
      billNumber: "",
      shipmentDate: "",
    });
  };

  const inputClass =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto rounded-lg shadow-sm">
        {/* Filter & Create Section */}
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-sm">Filter by:</span>
            <div className="relative">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="mm/dd/yyyy"
              />
            </div>
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear filter
              </button>
            )}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{ backgroundColor: color }}
            className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition shadow-sm font-medium"
          >
            + Create Document
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Airway Bill Number
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Shipment Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {currentBills.map((bill) => (
                <tr
                  key={bill.id}
                  className="border-b border-gray-300 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {bill.billNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {bill.shipmentDate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleView(bill.billNumber)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(bill.billNumber)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 flex items-center justify-between border-t border-gray-200">
          <button
            onClick={handleUpload}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            Upload Scanned Document
          </button>

          {/* Pagination */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-md text-sm ${
                  currentPage === page
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
            {totalPages > 3 && currentPage < totalPages && (
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Create Document Modal */}
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
                Create New Document
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Airway Bill Number
                  </label>
                  <input
                    type="text"
                    value={newDocument.billNumber}
                    onChange={(e) =>
                      setNewDocument({
                        ...newDocument,
                        billNumber: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="e.g. AWB-2025-013"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipment Date
                  </label>
                  <input
                    type="date"
                    value={newDocument.shipmentDate}
                    onChange={(e) =>
                      setNewDocument({
                        ...newDocument,
                        shipmentDate: e.target.value,
                      })
                    }
                    className={inputClass}
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
                  onClick={handleCreateDocument}
                  disabled={
                    !newDocument.billNumber || !newDocument.shipmentDate
                  }
                  style={{ backgroundColor: color }}
                  className="px-5 py-2 text-white rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          </div>

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
        </>
      )}
    </div>
  );
};

export default DocumentsTable;
