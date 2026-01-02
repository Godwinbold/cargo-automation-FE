import FilterAnalytic from "./FilterAnalytic";
import AnalyticalCharts from "./AnalyticalCharts";
import CargoUnitAnalysis from "./CargoUnitAnalysis";

const ExecutiveAnalytical = () => {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="font-semibold text-[28px] text-[#1A1A1A]">Analytical</h1>
        <p className="text-[18px] font-normal text-[#6B6B6B] mt-1">
          Monitor your cargo operation and shipment performance
        </p>
      </div>

      <FilterAnalytic />
      <AnalyticalCharts />
      <CargoUnitAnalysis />
    </main>
  );
};

export default ExecutiveAnalytical;
