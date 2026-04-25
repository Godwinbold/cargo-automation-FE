import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Calendar, X } from "lucide-react";
import { useGetExecutiveAnalytical } from "../../hooks/useExecutive";
import FilterAnalytic from "./FilterAnalytic";
import AnalyticalCharts from "./AnalyticalCharts";
import CargoUnitAnalysis from "./CargoUnitAnalysis";
import CargoAirlinesTable from "./CargoAirlinesTable";

const ExecutiveAnalytical = () => {
  const [pendingFilters, setPendingFilters] = useState({
    airlineId: "",
    startDate: "",
    endDate: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    airlineId: "",
    startDate: "",
    endDate: "",
  });

  // Temp date state inside the modal
  const [modalDates, setModalDates] = useState({ startDate: "", endDate: "" });
  const [showDateModal, setShowDateModal] = useState(false);

  const { data: analyticalResponse, isLoading } = useGetExecutiveAnalytical(appliedFilters);

  const analyticalData = analyticalResponse?.data || {};
  const hasLogged = useRef(false);

  useEffect(() => {
    if (analyticalResponse && !hasLogged.current) {
      console.log("[/executive/analytical] Full API response:", analyticalResponse);
      hasLogged.current = true;
    }
  }, [analyticalResponse]);

  const openDateModal = () => {
    setModalDates({ startDate: pendingFilters.startDate, endDate: pendingFilters.endDate });
    setShowDateModal(true);
  };

  const applyDates = () => {
    setPendingFilters((p) => ({ ...p, ...modalDates }));
    setShowDateModal(false);
  };

  const clearDates = () => {
    setModalDates({ startDate: "", endDate: "" });
  };

  const handleApply = () => {
    setAppliedFilters({ ...pendingFilters });
  };

  const handleReset = () => {
    const empty = { airlineId: "", startDate: "", endDate: "" };
    setPendingFilters(empty);
    setAppliedFilters(empty);
    setModalDates({ startDate: "", endDate: "" });
  };

  const dateLabel =
    pendingFilters.startDate && pendingFilters.endDate
      ? `${pendingFilters.startDate} → ${pendingFilters.endDate}`
      : pendingFilters.startDate
      ? `From ${pendingFilters.startDate}`
      : "Date Range";

  return (
    <main className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-semibold text-[22px] md:text-[28px] text-[#1A1A1A]">Analytical</h1>
        <p className="text-[14px] md:text-[18px] font-normal text-[#6B6B6B] mt-1">
          Monitor your cargo operation and shipment performance
        </p>
      </div>

      {/* ─── Filter Panel ─── */}
      <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#D3EBF8] p-6">
        <h3 className="text-[16px] font-bold text-[#1A1A1A] mb-4">Filter</h3>

        <div className="flex flex-col md:flex-row items-end gap-4">
          {/* Cargo Unit */}
          <div className="w-full md:flex-1">
            <label className="block text-sm font-normal text-[#6B6B6B] mb-2">
              Cargo Unit
            </label>
            <div className="relative">
              <select
                value={pendingFilters.airlineId}
                onChange={(e) =>
                  setPendingFilters((p) => ({ ...p, airlineId: e.target.value }))
                }
                className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-[#1A1A1A] appearance-none focus:outline-none focus:border-[#3DA5E0] transition-colors cursor-pointer font-medium"
              >
                <option value="">All Airlines</option>
                {(analyticalData.cargoUnits || []).map((unit) => (
                  <option key={unit.airlineId} value={unit.airlineId}>
                    {unit.airlineName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Range trigger */}
          <div className="w-full md:flex-1">
            <label className="block text-sm font-normal text-[#6B6B6B] mb-2">
              Date Range
            </label>
            <button
              onClick={openDateModal}
              className="w-full flex items-center gap-2 pl-4 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-left focus:outline-none focus:border-[#3DA5E0] transition-colors font-medium"
            >
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span
                className={`truncate text-sm ${
                  pendingFilters.startDate ? "text-[#1A1A1A]" : "text-gray-400"
                }`}
              >
                {dateLabel}
              </span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleReset}
              className="flex-1 md:flex-none whitespace-nowrap py-3 px-6 rounded-lg border border-gray-200 text-[#6B6B6B] font-semibold hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-1 md:flex-none whitespace-nowrap py-3 px-10 rounded-lg text-white font-semibold bg-[#3DA5E0] hover:opacity-90 transition-opacity"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* ─── Date Range Modal ─── */}
      {showDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDateModal(false)}
          />

          {/* Modal card */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[18px] font-bold text-[#1A1A1A]">
                  Select Date Range
                </h3>
                <p className="text-sm text-[#6B6B6B] mt-0.5">
                  Filter analytics by a specific period
                </p>
              </div>
              <button
                onClick={() => setShowDateModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Date inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6B6B6B] mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={modalDates.startDate}
                  onChange={(e) =>
                    setModalDates((d) => ({ ...d, startDate: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#3DA5E0] transition-colors font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6B6B6B] mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={modalDates.endDate}
                  min={modalDates.startDate || undefined}
                  onChange={(e) =>
                    setModalDates((d) => ({ ...d, endDate: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#3DA5E0] transition-colors font-medium"
                />
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={clearDates}
                className="flex-1 py-3 rounded-lg border border-gray-200 text-[#6B6B6B] font-semibold hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={applyDates}
                className="flex-1 py-3 rounded-lg text-white font-semibold bg-[#3DA5E0] hover:opacity-90 transition-opacity"
              >
                Apply Dates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <FilterAnalytic
        isLoading={isLoading}
        data={{
          totalShipments: analyticalData.totalShipments,
          totalRevenue: analyticalData.totalRevenue,
          averageWeight: analyticalData.averageWeight,
        }}
      />

      {/* Monthly Trends & Average Weight */}
      <AnalyticalCharts 
        isLoading={isLoading} 
        monthlyData={analyticalData.monthlyData} 
        averageWeight={analyticalData.averageWeight}
      />

      {/* Airline Performance Charts */}
      <CargoUnitAnalysis
        isLoading={isLoading}
        cargoUnits={analyticalData.cargoUnits}
      />

      {/* Cargo Airlines Data Table */}
      <CargoAirlinesTable 
        isLoading={isLoading}
        data={analyticalData.cargoUnits}
      />
    </main>
  );
};

export default ExecutiveAnalytical;
