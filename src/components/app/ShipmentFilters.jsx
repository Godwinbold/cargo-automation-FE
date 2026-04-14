import React, { useState } from "react";
import { Search, Calendar, X, Filter } from "lucide-react";

const ShipmentFilters = ({
  searchQuery,
  onSearchChange,
  onSearch,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  color,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localStartDate, setLocalStartDate] = useState(startDate || "");
  const [localEndDate, setLocalEndDate] = useState(endDate || "");

  const handleApply = () => {
    onStartDateChange(localStartDate);
    onEndDateChange(localEndDate);
    setIsModalOpen(false);
  };

  const clearDateFilter = () => {
    setLocalStartDate("");
    setLocalEndDate("");
    onStartDateChange("");
    onEndDateChange("");
  };

  const hasDateFilter = startDate || endDate;

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
      <div className="relative flex-1">
        <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all overflow-hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch?.();
              }
            }}
            placeholder="Search by Airway Bill Number..."
            className="flex-1 pl-6 pr-2 py-3 bg-transparent focus:outline-none text-sm"
          />
          <div className="flex items-center pr-2 gap-2">
            {searchQuery && (
              <button
                onClick={() => {
                  onSearchChange("");
                  // Optionally trigger search with empty query immediately
                  setTimeout(() => onSearch?.(), 0);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={onSearch}
              style={{ backgroundColor: color || "#3DA5E0" }}
              className="p-2.5 text-white rounded-full hover:opacity-90 transition-opacity flex items-center justify-center shrink-0"
            >
              <Search size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex-shrink-0 w-full md:w-auto">
        <button
          onClick={() => {
            setLocalStartDate(startDate || "");
            setLocalEndDate(endDate || "");
            setIsModalOpen(true);
          }}
          style={{ 
            backgroundColor: hasDateFilter ? (color || '#3DA5E0') : 'white', 
            color: hasDateFilter ? 'white' : '#6B6B6B' 
          }}
          className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 border rounded-xl shadow-sm transition hover:opacity-90 ${hasDateFilter ? 'border-transparent' : 'border-gray-200'}`}
        >
          <Filter size={18} />
          <span className="font-medium text-sm">
            {hasDateFilter ? "Dates Applied" : "Filter by Date"}
          </span>
        </button>
        {hasDateFilter && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearDateFilter();
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 z-10"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 bg-gray-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-6">Filter by Date</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={localStartDate}
                    onChange={(e) => setLocalStartDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  />
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={localEndDate}
                    onChange={(e) => setLocalEndDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  />
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => {
                  setLocalStartDate("");
                  setLocalEndDate("");
                }}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleApply}
                style={{ backgroundColor: color || '#3DA5E0' }}
                className="flex-1 py-3 px-4 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentFilters;
