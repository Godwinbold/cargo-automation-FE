import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

const ShipmentFilter = ({ setFilters }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleApply = () => {
    if (setFilters) {
      setFilters({ startDate, endDate });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#D3EBF8] p-6 mt-8">
      <div className="mb-6">
        <h3 className="text-[16px] font-bold text-[#1A1A1A]">
          Filter Shipments by Date
        </h3>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Customize your view by selecting date range
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-end gap-4">
        {/* Start Date */}
        {/* Start Date */}
        <div className="w-full lg:w-auto lg:flex-1">
          <label className="block text-sm font-semibold text-[#6B6B6B] mb-2">
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#3DA5E0] transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              onClick={(e) => e.target.showPicker()}
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* End Date */}
        <div className="w-full lg:w-auto lg:flex-1">
          <label className="block text-sm font-semibold text-[#6B6B6B] mb-2">
            End Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#3DA5E0] transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              onClick={(e) => e.target.showPicker()}
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Airline Select
        <div className="w-full lg:w-[40%]">
          <div className="relative">
            <select className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-[#1A1A1A] appearance-none focus:outline-none focus:border-[#3DA5E0] transition-colors cursor-pointer">
              <option>Turkish Airline</option>
              <option>RwandAir</option>
              <option>Air Cote d' voire</option>
              <option>United Cargo</option>
              <option>South African Airways</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div> */}

        {/* Apply Button */}
        <div className="w-full lg:w-auto">
          <button
            onClick={handleApply}
            className="w-full lg:w-auto whitespace-nowrap py-3 px-8 rounded-lg text-white font-semibold shadow-sm hover:opacity-90 transition-opacity bg-[#3DA5E0]"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentFilter;
