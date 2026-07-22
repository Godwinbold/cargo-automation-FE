import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useGetAuditLogs, useGetAppUsers } from "../../../hooks/useAdmin";
import { Search, Calendar, User, ShieldAlert, RefreshCw, X, Filter, ArrowRight } from "lucide-react";
import Pagination from "../Pagination";

const renderChanges = (changesString) => {
  if (!changesString) {
    return <span className="text-sm text-gray-500 italic font-sans">No changes recorded</span>;
  }

  // Split by semicolon
  const parts = changesString.split(";").map((p) => p.trim()).filter(Boolean);
  const parsedChanges = [];
  const unparsedParts = [];

  const cleanValue = (val) => {
    if (!val) return "";
    return val.trim().replace(/^['"`]|['"`]$/g, "");
  };

  const formatFieldName = (name) => {
    if (!name) return "";
    // If it has spaces, capitalize words
    if (name.includes(" ")) {
      return name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    // Split camelCase/PascalCase
    const withSpaces = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
    // Handle snake_case and kebab-case
    const cleanSeparators = withSpaces.replace(/[_-]/g, " ");
    return cleanSeparators
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  parts.forEach((part) => {
    const marker = ": changed from ";
    const index = part.indexOf(marker);
    if (index !== -1) {
      const field = part.substring(0, index).trim();
      const rest = part.substring(index + marker.length);
      
      let from = "";
      let to = "";
      const quoteChar = rest[0];
      
      if (quoteChar === "'" || quoteChar === '"' || quoteChar === "`") {
        const closingQuoteIndex = rest.indexOf(quoteChar, 1);
        if (closingQuoteIndex !== -1) {
          from = rest.substring(1, closingQuoteIndex);
          const toPart = rest.substring(closingQuoteIndex + 1).trim();
          if (toPart.startsWith("to ")) {
            const toValueRaw = toPart.substring(3).trim();
            if (toValueRaw.startsWith(quoteChar) && toValueRaw.endsWith(quoteChar)) {
              to = toValueRaw.substring(1, toValueRaw.length - 1);
            } else {
              to = toValueRaw;
            }
          }
        }
      }

      if (!from && !to) {
        const toIndex = rest.lastIndexOf(" to ");
        if (toIndex !== -1) {
          from = rest.substring(0, toIndex).trim();
          to = rest.substring(toIndex + 4).trim();
        }
      }

      if (from || to) {
        parsedChanges.push({
          field,
          from: cleanValue(from),
          to: cleanValue(to),
        });
      } else {
        unparsedParts.push(part);
      }
    } else {
      unparsedParts.push(part);
    }
  });

  if (parsedChanges.length === 0) {
    return (
      <div className="text-sm text-gray-800 bg-gray-50 border border-gray-100 rounded-lg p-3 whitespace-pre-wrap font-sans leading-relaxed">
        {changesString}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {parsedChanges.map((change, index) => (
        <div
          key={index}
          className="bg-gray-50/50 border border-gray-200/50 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-blue-200/50 transition-all duration-200"
        >
          <div className="text-xs font-bold text-gray-600 mb-2 font-sans tracking-wide uppercase">
            {formatFieldName(change.field)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2">
            {/* Before Value */}
            <div className="bg-red-50/60 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-700 font-mono break-all">
              <span className="block text-[9px] text-red-400 font-bold uppercase tracking-wider mb-1">
                Before
              </span>
              {change.from || <span className="italic text-red-300">empty</span>}
            </div>

            {/* Arrow */}
            <div className="flex justify-center text-gray-400 rotate-90 sm:rotate-0 p-1">
              <ArrowRight size={16} className="text-[#3DA5E0]" />
            </div>

            {/* After Value */}
            <div className="bg-green-50/60 border border-green-100 rounded-lg px-3 py-2 text-xs text-green-700 font-mono break-all">
              <span className="block text-[9px] text-green-400 font-bold uppercase tracking-wider mb-1">
                After
              </span>
              {change.to || <span className="italic text-green-300">empty</span>}
            </div>
          </div>
        </div>
      ))}

      {unparsedParts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
          <span className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Additional Information
          </span>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 font-sans whitespace-pre-wrap leading-relaxed text-gray-700">
            {unparsedParts.join("; ")}
          </div>
        </div>
      )}
    </div>
  );
};

const AdminAuditLogs = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState("");
  const [actionInput, setActionInput] = useState("");
  const [entityInput, setEntityInput] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Fetch users for the filter dropdown
  const { data: usersResponse } = useGetAppUsers({
    pageNumber: 1,
    pageSize: 100, // Fetch up to 100 users for selection
  });
  const usersList = usersResponse?.data?.items || [];

  // Fetch audit logs with current filters
  const { data: logsResponse, isLoading, refetch, isFetching } = useGetAuditLogs({
    page: currentPage,
    pageSize,
    userId: selectedUser || undefined,
    action: actionInput || undefined,
    entityName: entityInput || undefined,
    fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
    toDate: toDate ? new Date(toDate).toISOString() : undefined,
  });

  useEffect(() => {
    if (selectedLog || isFilterModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedLog, isFilterModalOpen]);

  const logs = logsResponse?.data?.items || logsResponse?.items || [];
  const totalPages = logsResponse?.data?.totalPages || logsResponse?.totalPages || 1;
  const totalCount = logsResponse?.data?.totalCount || logsResponse?.totalCount || 0;

  const activeFiltersCount = [
    selectedUser,
    actionInput,
    entityInput,
    fromDate,
    toDate,
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSelectedUser("");
    setActionInput("");
    setEntityInput("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const getActionBadgeColor = (action = "") => {
    const act = action.toUpperCase();
    if (act.includes("DELETE") || act.includes("REMOVE")) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    if (act.includes("CREATE") || act.includes("ADD") || act.includes("INVITE") || act.includes("ACCEPT")) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("MODIFY") || act.includes("CHANGE")) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    if (act.includes("LOGIN") || act.includes("SIGNIN")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
          <p className="text-sm text-gray-500">
            Track and monitor administrative actions and system events. Total logs: <span className="font-semibold text-gray-700">{totalCount}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline transition-colors"
            >
              Clear Filters
            </button>
          )}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors relative font-semibold"
          >
            <Filter size={16} />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-[#3DA5E0] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => refetch()}
            disabled={isFetching || isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            <span>{isFetching ? "Syncing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Entity</th>
                <th className="px-6 py-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-[#3DA5E0]" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading logs...
                    </div>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id || Math.random()} className="hover:bg-gray-50/50 transition-colors">
                    {/* Timestamp */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.createdDate || log.timestamp || log.date ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {new Date(log.createdDate || log.timestamp || log.date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.createdDate || log.timestamp || log.date).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 bg-[#E6F3FA] text-[#1D81B9] rounded-full flex items-center justify-center font-bold text-xs">
                          {log.userName?.charAt(0) || log.userEmail?.charAt(0) || "?"}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {log.userName || "System / Guest"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.userEmail || `ID: ${log.userId?.substring(0, 8) || "N/A"}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getActionBadgeColor(log.action)}`}>
                        {log.action || "UNKNOWN"}
                      </span>
                    </td>

                    {/* Entity */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {log.entityName || "-"}
                      </div>
                      {log.entityId && (
                        <div className="text-xs text-gray-500">
                          ID: {log.entityId.substring(0, 8)}...
                        </div>
                      )}
                    </td>

                    {/* Action / View */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-[#3DA5E0] hover:text-[#2b8bc2] font-semibold text-sm hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center py-4 space-y-2">
                      <ShieldAlert className="text-gray-300 w-12 h-12" />
                      <span className="text-gray-500 font-medium">No audit logs found</span>
                      <span className="text-xs text-gray-400">Try adjusting your filters or search terms</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {logs.length > 0 && !isLoading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Audit Log Details Modal */}
      {selectedLog && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
            onClick={() => setSelectedLog(null)}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative overflow-hidden animate-in"
              style={{ animation: "modalPop 0.3s ease-out forwards" }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedLog(null)}
                className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShieldAlert className="text-[#3DA5E0]" size={22} />
                <span>Audit Log Details</span>
              </h3>

              <div className="space-y-4 max-h-[60vh] md:max-h-[70vh] overflow-y-auto pr-2">
                {/* Action & Timestamp */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Action</label>
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getActionBadgeColor(selectedLog.action)}`}>
                      {selectedLog.action || "UNKNOWN"}
                    </span>
                  </div>
                  <div className="text-right">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Timestamp</label>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedLog.timestamp || selectedLog.createdDate || selectedLog.date ? (
                        new Date(selectedLog.timestamp || selectedLog.createdDate || selectedLog.date).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                </div>

                {/* Log ID */}
                <div className="grid grid-cols-1 gap-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Log ID</label>
                  <span className="text-sm font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded border border-gray-100 break-all select-all">
                    {selectedLog.id}
                  </span>
                </div>

                {/* User Info */}
                <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">User Email</label>
                    <span className="text-sm font-medium text-gray-950 block truncate" title={selectedLog.userEmail}>
                      {selectedLog.userEmail || "System/Guest"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">User ID</label>
                    <span className="text-sm text-gray-700 block truncate font-mono" title={selectedLog.userId}>
                      {selectedLog.userId || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Entity Info */}
                <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Entity Name</label>
                    <span className="text-sm font-medium text-gray-950 block">
                      {selectedLog.entityName || "-"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Entity ID</label>
                    <span className="text-sm text-gray-700 block truncate font-mono" title={selectedLog.entityId}>
                      {selectedLog.entityId || "N/A"}
                    </span>
                  </div>
                </div>

                {/* IP Address */}
                <div className="border-t border-gray-50 pt-3">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">IP Address</label>
                  <span className="text-sm font-medium text-gray-900 font-mono">
                    {selectedLog.ipAddress || "N/A"}
                  </span>
                </div>

                {/* Description / Changes */}
                <div className="border-t border-gray-100 pt-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Changes / Description</label>
                  {renderChanges(selectedLog.changes || selectedLog.description || selectedLog.details)}
                </div>
              </div>

              {/* Close Footer Action */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes modalPop {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </>,
        document.body
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
            onClick={() => setIsFilterModalOpen(false)}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden animate-in"
              style={{ animation: "modalPop 0.3s ease-out forwards" }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Filter className="text-[#3DA5E0]" size={22} />
                <span>Filter Logs</span>
              </h3>

              <div className="space-y-4">
                {/* User Filter */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">User</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={selectedUser}
                      onChange={(e) => {
                        setSelectedUser(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3DA5E0]"
                    >
                      <option value="">All Users</option>
                      {usersList.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Filter */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Action Type</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Create"
                      value={actionInput}
                      onChange={(e) => {
                        setActionInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3DA5E0]"
                    />
                  </div>
                </div>

                {/* Entity Name Filter */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity Name</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Airline"
                      value={entityInput}
                      onChange={(e) => {
                        setEntityInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3DA5E0]"
                    />
                  </div>
                </div>

                {/* From Date Filter */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From Date</label>
                  <input
                    type="datetime-local"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3DA5E0] text-gray-700 bg-white"
                  />
                </div>

                {/* To Date Filter */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To Date</label>
                  <input
                    type="datetime-local"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3DA5E0] text-gray-700 bg-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    handleResetFilters();
                    setIsFilterModalOpen(false);
                  }}
                  disabled={activeFiltersCount === 0}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-5 py-2 bg-[#3DA5E0] hover:bg-[#2b8bc2] text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default AdminAuditLogs;
