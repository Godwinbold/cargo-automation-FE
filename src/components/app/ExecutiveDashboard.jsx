import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetExecutiveDashboard } from "../../hooks/useExecutive";
import HeaderTitle from "./HeaderTitle";
import CargoUnitSummary from "./CargoUnitSummary";
import ShipmentFilter from "./ShipmentFilter";
import FilteredResult from "./FilteredResult";

const ExecutiveDashboard = () => {
  const [searchParams] = useSearchParams();
  const airlineId = searchParams.get("airlineId") || "";

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const { data: dashboardResponse, isLoading } = useGetExecutiveDashboard({
    airlineId,
    ...filters,
  });

  const dashboardData = dashboardResponse?.data || {};
  const cargoUnits = dashboardData.cargoUnits || [];
  const filteredResult = dashboardData.filteredResult || {
    totalShipments: 0,
    totalRevenue: 0,
    averageWeightKg: 0,
    totalWeightKg: 0,
  };
  return (
    <main>
      <div className="space-y-6">
        <div>
          <h1 className="font-semibold text-[28px] text-[#1A1A1A]">
            Executive Dashboard{" "}
          </h1>
          <p className="text-[18px] font-normal text-[#6B6B6B] mt-1">
            Monitor your cargo operation and shipment performance
          </p>
        </div>
        <ShipmentFilter setFilters={setFilters} />
        <CargoUnitSummary isLoading={isLoading} data={cargoUnits} />

        <FilteredResult isLoading={isLoading} data={filteredResult} />
      </div>
    </main>
  );
};

export default ExecutiveDashboard;
