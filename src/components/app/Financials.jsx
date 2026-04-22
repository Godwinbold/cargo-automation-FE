import { useState, useEffect } from "react";
import HeaderTitle from "./HeaderTitle";
import FinancialTable from "./FinacialTable";
import { useGetAirlinesFinancials, useDeleteFinancial } from "../../hooks/useShipment";
import { GetFromLocalStorage } from "../../utils/getFromLocals";
import { useSearchParams } from "react-router-dom";
import ShipmentFilters from "./ShipmentFilters";
import EditFinancialsModal from "./EditFinancialsModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Financials = ({ color, name }) => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const airlineIdFromQuery = searchParams.get("airlineId");
  const airlineId = GetFromLocalStorage("airlineId") || airlineIdFromQuery;

  // Filtering and Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Edit/View Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedFinancial, setSelectedFinancial] = useState(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [financialToDelete, setFinancialToDelete] = useState(null);
  const { mutate: deleteFinancial, isPending: isDeleting } = useDeleteFinancial();

  const handleOpenModal = (id, mode = "edit") => {
    const item = financialItems.find((f) => f.id === id);
    if (item) {
      setSelectedFinancial(item);
      setIsViewOnly(mode === "view");
      setIsEditModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedFinancial(null);
    setIsViewOnly(false);
  };

  const handleDeleteClick = (id) => {
    const item = financialItems.find((f) => f.id === id);
    if (item) {
      setFinancialToDelete(item);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (!financialToDelete) return;

    deleteFinancial(
      {
        airlineId,
        shipmentId: financialToDelete.shipmentId,
        financialId: financialToDelete.id,
      },
      {
        onSuccess: () => {
          toast.success("Financial record deleted successfully");
          queryClient.invalidateQueries(["financials", "airline", airlineId]);
          setIsDeleteModalOpen(false);
          setFinancialToDelete(null);
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Failed to delete financial record");
        },
      }
    );
  };

  const handleSearch = () => {
    setAppliedSearch(searchQuery);
  };

  // Reset to first page when search changes or filters applied
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch, startDate, endDate, pageSize]);

  const {
    data: financials,
    isLoading,
    error,
  } = useGetAirlinesFinancials(airlineId, {
    page: currentPage,
    pageSize: pageSize,
    mawbSearch: appliedSearch,
    startDate,
    endDate,
  });

  // Support both { data: items[] } and { data: { items: [], totalPages: 0 } } formats
  const financialItems = Array.isArray(financials?.data) 
    ? financials.data 
    : financials?.data?.items || [];

  const totalPages = financials?.data?.totalPages || 
    Math.ceil((financials?.data?.totalCount || financialItems.length || 0) / pageSize);

  return (
    <div className="flex flex-col p-4 min-h-screen">
      <div className="flex-none flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <HeaderTitle
          title="Financials"
          description="Access shipment billing, airline settlements, and financial summaries, all in one place."
        />
      </div>

      <div className="flex-none px-2 mb-2">
        <ShipmentFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          color={color}
        />
      </div>

      <div className="flex-1 px-2 min-h-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading financials...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100 italic">
            Error loading financials. Please try again.
          </div>
        ) : financialItems.length > 0 ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
              <FinancialTable
                color={color}
                data={[...financialItems].sort(
                  (a, b) =>
                    new Date(b.createdDate || b.date || 0) -
                    new Date(a.createdDate || a.date || 0)
                )}
                airlineId={airlineId}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                onEdit={(id) => handleOpenModal(id, "edit")}
                onView={(id) => handleOpenModal(id, "view")}
                onDelete={handleDeleteClick}
              />
            </div>
          </div>
        ) : (
          <div className="mt-8 p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">
              No financial records found.
            </p>
          </div>
        )}
      </div>

      <EditFinancialsModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        airlineId={airlineId}
        financialData={selectedFinancial}
        isViewOnly={isViewOnly}
        color={color}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Financial Record"
        message="Are you sure you want to delete the financial record for MAWB"
        identifier={financialToDelete?.mawb}
        isDeleting={isDeleting}
        color={color}
      />
    </div>
  );
};

export default Financials;
