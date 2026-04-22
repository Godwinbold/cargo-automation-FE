import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Search, Plus, Edit2, Trash2, AlertTriangle } from "lucide-react";
import Pagination from "../Pagination";
import AirlineModal from "./AirlineModal";
import { useGetAllAirlines, useDeleteAirline } from "../../../hooks/useGeneral";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AdminAirlines = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState(null);
  const [airlineToDelete, setAirlineToDelete] = useState(null);
  
  const { data: airlinesData, isLoading } = useGetAllAirlines();
  const { mutate: deleteAirline, isPending: isDeleting } = useDeleteAirline();
  const queryClient = useQueryClient();

  const airlines = airlinesData?.data || [];

  const filteredAirlines = airlines
    .filter((airline) =>
      airline.airlineName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      (a.airlineName || "").localeCompare(b.airlineName || "")
    );

  const totalPages = Math.ceil(filteredAirlines.length / pageSize) || 1;
  const paginatedAirlines = filteredAirlines.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenCreateModal = () => {
    setSelectedAirline(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (airline) => {
    setSelectedAirline(airline);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (airline) => {
    setAirlineToDelete(airline);
  };

  const confirmDelete = () => {
    if (!airlineToDelete) return;

    deleteAirline(airlineToDelete.id, {
      onSuccess: () => {
        toast.success("Airline deleted successfully!");
        queryClient.invalidateQueries(["allAirlines"]);
        setAirlineToDelete(null);
      },
      onError: (error) => {
        const message =
          error.response?.data?.errors?.[0]?.message ||
          error.response?.data?.message ||
          "Failed to delete airline.";
        toast.error(message);
        setAirlineToDelete(null);
      },
    });
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Airlines Management</h1>
          <p className="text-sm text-gray-500">
            View, create, edit, and manage all partner airlines
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-[#3DA5E0] hover:bg-[#2b8bc2] text-white px-4 py-2 rounded-lg font-medium transition-colors"
          onClick={handleOpenCreateModal}
        >
          <Plus size={18} />
          <span>Add Airline</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-full max-w-sm">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search airlines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DA5E0] focus:border-transparent text-sm"
            />
          </div>
          <div className="text-sm text-gray-500 font-medium hidden sm:block">
            Total Airlines: {filteredAirlines.length}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-semibold">Airline Name</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="2"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-[#3DA5E0]"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Loading airlines...
                    </div>
                  </td>
                </tr>
              ) : paginatedAirlines.length > 0 ? (
                paginatedAirlines.map((airline) => (
                  <tr
                    key={airline.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-[#E6F3FA] text-[#1D81B9] rounded-full flex items-center justify-center font-bold text-sm uppercase">
                          {airline.airlineName?.substring(0, 2)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {airline.airlineName}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {airline.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleOpenEditModal(airline)}
                          className="text-gray-400 hover:text-[#3DA5E0] transition-colors p-1"
                          title="Edit Airline"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(airline)}
                          disabled={isDeleting}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
                          title="Delete Airline"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="2"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No airlines found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredAirlines.length > 0 && !isLoading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Create / Edit Airline Modal */}
      <AirlineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedAirline={selectedAirline}
      />

      {/* Delete Confirmation Modal */}
      {airlineToDelete && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
            onClick={() => !isDeleting && setAirlineToDelete(null)}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div
              className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in"
              style={{ animation: "modalPop 0.3s ease-out forwards" }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Delete Airline</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete <span className="font-semibold text-gray-800">{airlineToDelete.airlineName}</span>? This action cannot be undone.
                </p>

                <div className="flex justify-center w-full gap-3">
                  <button
                    onClick={() => setAirlineToDelete(null)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium disabled:opacity-50 flex items-center justify-center"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes modalPop {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </>,
        document.body
      )}
    </div>
  );
};

export default AdminAirlines;
