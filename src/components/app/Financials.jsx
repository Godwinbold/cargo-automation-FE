import { useState, useEffect, useMemo } from "react";
import HeaderTitle from "./HeaderTitle";
import FinancialTable from "./FinacialTable";
import {
  useGetAirlinesFinancials,
  useDeleteFinancial,
  useGetShipments,
} from "../../hooks/useShipment";
import { GetFromLocalStorage } from "../../utils/getFromLocals";
import { useSearchParams } from "react-router-dom";
import ShipmentFilters from "./ShipmentFilters";
import EditFinancialsModal from "./EditFinancialsModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { formatShipmentId } from "../../utils/shipmentUtils";

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

  // Fetch shipments to determine shipment status for each financial
  const { data: shipmentsData } = useGetShipments(airlineId, {
    pageSize: 1000,
  });

  const shipmentStatusMap = useMemo(() => {
    const map = {};
    const list = shipmentsData?.data?.items || shipmentsData?.data || [];
    if (Array.isArray(list)) {
      list.forEach((s) => {
        if (s.id) {
          map[s.id] = s.statusDisplay;
        }
      });
    }
    return map;
  }, [shipmentsData]);

  const getShipmentStatus = (item) => {
    return (
      item?.shipmentStatus ||
      item?.shipment?.statusDisplay ||
      (item?.shipmentId ? shipmentStatusMap[item.shipmentId] : null) ||
      "Accepted"
    );
  };

  const isFinancialLocked = (item) => {
    const status = getShipmentStatus(item);
    return ["Booked", "Flown", "Delivered"].includes(status);
  };

  const handleOpenModal = (id, mode = "edit") => {
    const item = financialItems.find((f) => f.id === id);
    if (item) {
      const locked = isFinancialLocked(item);
      setSelectedFinancial({
        ...item,
        isLocked: locked,
        shipmentStatus: getShipmentStatus(item),
      });
      setIsViewOnly(mode === "view" || locked);
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
      if (isFinancialLocked(item)) {
        toast.error(
          "Financial records cannot be deleted after a shipment has been booked.",
        );
        return;
      }
      setFinancialToDelete(item);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (!financialToDelete) return;

    if (isFinancialLocked(financialToDelete)) {
      toast.error(
        "Financial records cannot be deleted after a shipment has been booked.",
      );
      setIsDeleteModalOpen(false);
      setFinancialToDelete(null);
      return;
    }

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
          toast.error(
            err.response?.data?.message || "Failed to delete financial record",
          );
        },
      },
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

  const filteredFinancials = useMemo(() => {
    let items = [...financialItems];
    if (appliedSearch.trim()) {
      const q = appliedSearch.trim().toLowerCase();
      items = items.filter((item) => {
        const mawbMatch = item.mawb && item.mawb.toLowerCase().includes(q);
        const rawIdMatch =
          item.shipmentId && item.shipmentId.toLowerCase().includes(q);
        const friendlyIdMatch =
          item.shipmentId &&
          formatShipmentId(item.shipmentId).toLowerCase().includes(q);
        const agentMatch =
          item.agentsOrClients &&
          item.agentsOrClients.toLowerCase().includes(q);
        return mawbMatch || rawIdMatch || friendlyIdMatch || agentMatch;
      });
    }
    return items.sort(
      (a, b) =>
        new Date(b.createdDate || b.date || 0) -
        new Date(a.createdDate || a.date || 0),
    );
  }, [financialItems, appliedSearch]);

  const totalPages = financials?.data?.totalPages || 
    Math.ceil((financials?.data?.totalCount || financialItems.length || 0) / pageSize);

  const handleExportCSV = () => {
    const exportData = filteredFinancials && filteredFinancials.length > 0 ? filteredFinancials : financialItems;
    if (!exportData || exportData.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const headerMapping = [
      { label: "S/N", key: "sn" },
      { label: "Shipment ID", key: "shipmentId" },
      { label: "MAWB", key: "mawb" },
      { label: "Date of Issue", key: "dateOfIssue" },
      { label: "Agents/Clients", key: "agentsOrClients" },
      { label: "Product", key: "product" },
      { label: "Routing", key: "routing" },
      { label: "Flight No", key: "flightNo" },
      { label: "Pieces", key: "pieces" },
      { label: "Chargeable Weight (Kg)", key: "chargeableWeightKg" },
      { label: "Gross Weight (Kg)", key: "grossWeightKg" },
      { label: "Spot Rate", key: "spotRate" },
      { label: "Published Rates", key: "publishedRates" },
      { label: "ROE", key: "roe" },
      { label: "Freight Amt (NGN)", key: "freightAmountNGN" },
      { label: "NCAA (5%)", key: "ncaaCharges5Percent" },
      { label: "Total Charge (NGN)", key: "totalChargeNGN" },
      { label: "Charges Collect", key: "chargesCollect" },
      { label: "Fuel Surcharge", key: "fuelSurcharge" },
      { label: "SEC Surcharge", key: "secSurcharge" },
      { label: "Handling Surcharge", key: "handlingSurcharge" },
      { label: "Surcharge (Agent)", key: "surchargeDueAgent" },
      { label: "AWB Fee", key: "awbFee" },
      { label: "GSA Commission (NGN)", key: "gsaCommissionNGN" },
      { label: "VAT (Commission)", key: "vatOnCommission" },
      { label: "Amt Due Airline", key: "amtDueAirline" },
      { label: "Due APG Inc", key: "dueAPGInc" },
      { label: "Due SLC", key: "dueSLC" },
    ];

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };

    const csvRows = [];
    csvRows.push(headerMapping.map((h) => `"${h.label}"`).join(","));

    exportData.forEach((item, index) => {
      const row = headerMapping.map((header) => {
        let value;
        if (header.key === "sn") {
          value = index + 1;
        } else if (header.key === "shipmentId") {
          value = formatShipmentId(item.shipmentId || item.shipment?.id);
        } else if (header.key === "dateOfIssue") {
          value = formatDate(item[header.key]);
        } else {
          value = item[header.key];
          if (typeof value === "number" && header.key.toLowerCase().endsWith("weightkg")) {
            value = (value / 1000).toFixed(2);
          }
        }
        
        if (value !== null && value !== undefined) {
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }
        return "-";
      });
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Financials_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully");
  };

  return (
    <div className="flex flex-col p-4 min-h-screen">
      <div className="flex-none flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <HeaderTitle
          title="All Financials"
          description={
            name
              ? `Access ${name} shipment billing, airline settlements, and financial summaries.`
              : "Access shipment billing, airline settlements, and financial summaries, all in one place."
          }
        />
        <div>
          <button
            onClick={handleExportCSV}
            disabled={!filteredFinancials || filteredFinancials.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export All Financials (CSV)</span>
          </button>
        </div>
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
        ) : filteredFinancials.length > 0 ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
              <FinancialTable
                color={color}
                data={filteredFinancials}
                airlineId={airlineId}
                shipmentStatusMap={shipmentStatusMap}
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
        isLocked={isFinancialLocked(selectedFinancial)}
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
