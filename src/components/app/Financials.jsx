import { useState, useEffect } from "react";
import HeaderTitle from "./HeaderTitle";
import FinancialTable from "./FinacialTable";
import { useGetFinancial } from "../../hooks/useShipment";
import { GetFromLocalStorage } from "../../utils/getFromLocals";
import { useSearchParams } from "react-router-dom";
import ShipmentFilters from "./ShipmentFilters";

const Financials = ({ color, name }) => {
  const [searchParams] = useSearchParams();
  const airlineIdFromQuery = searchParams.get("airlineId");
  const airlineId = GetFromLocalStorage("airlineId") || airlineIdFromQuery;

  // Filtering and Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, dateFilter, pageSize]);

  const {
    data: financials,
    isLoading,
    error,
  } = useGetFinancial(airlineId, {
    page: currentPage,
    pageSize: pageSize,
    mawbSearch: debouncedSearch,
    date: dateFilter,
  });

  const totalPages =
    financials?.data?.totalPages ||
    Math.ceil((financials?.data?.totalCount || 0) / pageSize);

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
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
          color={color}
        />
      </div>

      <div className="flex-1 px-2 scrollbar-hide overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading financials...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100 italic">
            Error loading financials. Please try again.
          </div>
        ) : financials?.data?.items?.length > 0 ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
              <FinancialTable
                color={color}
                data={financials.data.items}
                airlineId={airlineId}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
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
    </div>
  );
};

export default Financials;
