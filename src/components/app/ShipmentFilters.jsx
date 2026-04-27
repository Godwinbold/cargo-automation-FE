import React, { useState } from "react";
import { Search, Calendar, X, Filter, User } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";

const ShipmentFilters = ({
  searchQuery,
  onSearchChange,
  onSearch,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  userId,
  onUserIdChange,
  status,
  onStatusChange,
  color,
  showAdvanced = false,
}) => {
  const { user } = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localStartDate, setLocalStartDate] = useState(startDate || "");
  const [localEndDate, setLocalEndDate] = useState(endDate || "");
  const [localUserId, setLocalUserId] = useState(userId || "");
  const [localStatus, setLocalStatus] = useState(status || "");

  const handleApply = () => {
    onStartDateChange(localStartDate);
    onEndDateChange(localEndDate);
    if (showAdvanced) {
      onUserIdChange?.(localUserId);
      onStatusChange?.(localStatus);
    }
    setIsModalOpen(false);
  };

  const clearFilters = () => {
    setLocalStartDate("");
    setLocalEndDate("");
    onStartDateChange("");
    onEndDateChange("");
    if (showAdvanced) {
      setLocalUserId("");
      setLocalStatus("");
      onUserIdChange?.("");
      onStatusChange?.("");
    }
  };

  const hasFilters =
    startDate || endDate || (showAdvanced && (userId || status));

  const statusOptions = [
    { label: "All Status", value: "" },
    { label: "Accepted", value: "Accepted" },
    { label: "Booked", value: "Booked" },
    { label: "Delivered", value: "Delivered" },
    { label: "Flown", value: "Flown" },
  ];

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
            if (showAdvanced) {
              setLocalUserId(userId || "");
              setLocalStatus(status || "");
            }
            setIsModalOpen(true);
          }}
          style={{
            backgroundColor: hasFilters ? color || "#3DA5E0" : "white",
            color: hasFilters ? "white" : "#6B6B6B",
          }}
          className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 border rounded-xl shadow-sm transition hover:opacity-90 ${hasFilters ? "border-transparent" : "border-gray-200"}`}
        >
          <Filter size={18} />
          <span className="font-medium text-sm">
            {hasFilters
              ? showAdvanced
                ? "Filters Applied"
                : "Dates Applied"
              : showAdvanced
                ? "Advanced Filters"
                : "Filter by Date"}
          </span>
        </button>
        {hasFilters && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearFilters();
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 z-10"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 bg-gray-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              {showAdvanced ? "Advanced Filters" : "Filter by Date"}
            </h3>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={localStartDate}
                      onChange={(e) => setLocalStartDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
                      onClick={(e) =>
                        e.target.showPicker && e.target.showPicker()
                      }
                    />
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={localEndDate}
                      onChange={(e) => setLocalEndDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
                      onClick={(e) =>
                        e.target.showPicker && e.target.showPicker()
                      }
                    />
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {showAdvanced && (
                <>
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <label className="text-sm font-bold text-gray-800">
                          Only My Shipments
                        </label>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Filter by shipments you created
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={localUserId === user?.userId}
                        aria-label="Filter to only my shipments"
                        onClick={() => {
                          if (user?.userId) {
                            setLocalUserId(
                              localUserId === user.userId ? "" : user.userId,
                            );
                          }
                        }}
                        disabled={!user?.userId}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          localUserId === user?.userId
                            ? "bg-[#3DA5E0]"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            localUserId === user?.userId
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    {localUserId === user?.userId && user?.email && (
                      <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-1 duration-300">
                        <User size={14} className="text-[#3DA5E0]" />
                        <span className="text-xs font-medium text-gray-600 truncate">
                          {user.email}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={localStatus}
                      onChange={(e) => setLocalStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => {
                  setLocalStartDate("");
                  setLocalEndDate("");
                  if (showAdvanced) {
                    setLocalUserId("");
                    setLocalStatus("");
                  }
                }}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleApply}
                style={{ backgroundColor: color || "#3DA5E0" }}
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
