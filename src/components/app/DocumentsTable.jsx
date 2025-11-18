import React, { useState } from "react";
import { Eye, Download } from "lucide-react";

const DocumentsTable = () => {
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Sample data as array of objects
  const airwayBills = [
    { id: 1, billNumber: "AWB-2025-001", shipmentDate: "2025-10-01" },
    { id: 2, billNumber: "AWB-2025-002", shipmentDate: "2025-10-01" },
    { id: 3, billNumber: "AWB-2025-003", shipmentDate: "2025-10-01" },
    { id: 4, billNumber: "AWB-2025-004", shipmentDate: "2025-10-01" },
    { id: 5, billNumber: "AWB-2025-005", shipmentDate: "2025-10-01" },
    { id: 6, billNumber: "AWB-2025-006", shipmentDate: "2025-10-01" },
    { id: 7, billNumber: "AWB-2025-007", shipmentDate: "2025-10-01" },
    { id: 8, billNumber: "AWB-2025-008", shipmentDate: "2025-10-01" },
    { id: 9, billNumber: "AWB-2025-009", shipmentDate: "2025-10-01" },
    { id: 10, billNumber: "AWB-2025-010", shipmentDate: "2025-09-28" },
    { id: 11, billNumber: "AWB-2025-011", shipmentDate: "2025-09-25" },
    { id: 12, billNumber: "AWB-2025-012", shipmentDate: "2025-10-02" },
  ];

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

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto rounded-lg shadow-sm">
        {/* Filter Section */}
        <div className="p-6 border-b border-gray-200">
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
    </div>
  );
};

export default DocumentsTable;
