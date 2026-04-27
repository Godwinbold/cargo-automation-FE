import { useState, useEffect } from "react";
import { X, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";

const ChangeStatusModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  airwayBillNumber,
  isUpdating,
  color,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || "");

  const statusOptions = [
    {
      id: "Accepted",
      label: "Accepted",
      description: "Shipment has been received and accepted.",
    },
    {
      id: "Booked",
      label: "Booked",
      description: "Shipment is scheduled and booked for flight.",
    },
    {
      id: "Flown",
      label: "Flown",
      description: "Shipment has departed on the assigned flight.",
    },
    {
      id: "Delivered",
      label: "Delivered",
      description: "Shipment has reached its destination and was delivered.",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus || "");
    }
  }, [isOpen, currentStatus]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Change Status</h3>
            <p className="text-xs text-gray-500 font-medium">
              AWB: {airwayBillNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-3">
            {statusOptions.map((status) => (
              <button
                key={status.id}
                onClick={() => setSelectedStatus(status.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                  selectedStatus === status.id
                    ? "border-[#3DA5E0] bg-blue-50/30"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2.5 rounded-lg transition-colors ${
                      selectedStatus === status.id
                        ? "bg-[#3DA5E0] text-white"
                        : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                    }`}
                  >
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p
                      className={`font-bold text-sm ${selectedStatus === status.id ? "text-blue-900" : "text-gray-700"}`}
                    >
                      {status.label}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                      {status.description}
                    </p>
                  </div>
                </div>
                {selectedStatus === status.id && (
                  <div className="w-2 h-2 rounded-full bg-[#3DA5E0] animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {currentStatus === selectedStatus && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-[11px] text-amber-700 font-medium">
              <AlertCircle size={14} className="shrink-0" />
              <span>Please select a different status to update.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedStatus)}
            disabled={
              isUpdating || !selectedStatus || selectedStatus === currentStatus
            }
            style={{ backgroundColor: color || "#3DA5E0" }}
            className="flex-1 px-4 py-3 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 text-sm flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <span>Update Status</span>
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeStatusModal;
