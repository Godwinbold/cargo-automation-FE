import HeaderTitle from "./HeaderTitle";
import CargoUnitSummary from "./CargoUnitSummary";
import ShipmentFilter from "./ShipmentFilter";
import FilteredResult from "./FilteredResult";

const ExecutiveDashboard = () => {
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

        <CargoUnitSummary />
        <ShipmentFilter />
        <FilteredResult />
      </div>
    </main>
  );
};

export default ExecutiveDashboard;
