import { useState, useEffect } from "react";
import HeaderTitle from "./HeaderTitle";
import Create from "./Create";
import ShipmentTable from "./ShipmentTable";
import { useCreateShipment, useGetShipments } from "../../hooks/useShipment";
import { GetFromLocalStorage } from "../../utils/getFromLocals";
import { useSearchParams } from "react-router-dom";

import CreateShipmentModal from "./CreateShipmentModal";
import ShipmentFilters from "./ShipmentFilters";
import Pagination from "./Pagination";

const ManageShipping = ({ color, name }) => {
  const [searchParams] = useSearchParams();
  const airlineIdFromQuery = searchParams.get("airlineId");
  const airlineId = GetFromLocalStorage("airlineId") || airlineIdFromQuery;

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filtering and Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSearch = () => {
    setAppliedSearch(searchQuery);
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch, startDate, endDate, pageSize]);

  // The hook is already enabled only when airlineId is truthy
  const {
    data: shipments,
    isLoading,
    error,
  } = useGetShipments(airlineId, {
    page: currentPage,
    pageSize: pageSize,
    awbSearch: appliedSearch,
    startDate,
    endDate,
  });

  const handleCreateShipment = () => {
    setShowCreateModal(true);
  };

  const totalPages =
    shipments?.data?.totalPages ||
    Math.ceil((shipments?.data?.totalCount || 0) / pageSize);

  return (
    <div className="flex flex-col p-4 min-h-screen">
      <div className="flex-none flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <HeaderTitle
          title="Manage Shippings"
          description={
            name
              ? `View and manage all your ${name} shipments.`
              : "View and manage all your airline shipments in one place."
          }
        />
        <button
          onClick={handleCreateShipment}
          style={{ backgroundColor: color }}
          className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition shadow-md font-medium whitespace-nowrap"
        >
          + Create Shipment
        </button>
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

      <div className="flex-1 px-2 scrollbar-hide">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading shipments...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100 italic">
            Error loading shipments. Please try again.
          </div>
        ) : shipments?.data?.items?.length > 0 ? (
          <>
            <ShipmentTable
              color={color}
              data={shipments.data.items}
              airlineId={airlineId}
              onOpenCreateModal={handleCreateShipment}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          </>
        ) : (
          <div className="mt-8">
            <Create
              btnAction="Shipping"
              description={
                searchQuery || startDate || endDate
                  ? "No shipments match your current filters."
                  : "Get started by creating a shipment."
              }
              icon={name ? `${name}-ms.png` : "rwanda-ms.png"}
              key="shipping"
              title={
                searchQuery || startDate || endDate
                  ? "No Match Found"
                  : "No Shipping Data"
              }
              onClick={handleCreateShipment}
              color={color}
            />
          </div>
        )}
      </div>

      <CreateShipmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        airlineId={airlineId}
        color={color}
      />
    </div>
  );
};

export default ManageShipping;
