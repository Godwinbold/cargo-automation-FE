import { useState, useEffect } from "react";
import { X, CheckCircle2, ChevronRight, AlertCircle, Lock, ArrowRight, Ban, Check } from "lucide-react";

const STATUS_FLOW = ["Accepted", "Booked", "Flown", "Delivered"];

const statusDetails = {
  Accepted: {
    label: "Accepted",
    description: "Shipment has been received and accepted.",
  },
  Booked: {
    label: "Booked",
    description: "Shipment is scheduled and booked for flight.",
  },
  Flown: {
    label: "Flown",
    description: "Shipment has departed on the assigned flight.",
  },
  Delivered: {
    label: "Delivered",
    description: "Shipment has reached its destination and was delivered.",
  },
};

const ChangeStatusModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentStatus = "Accepted",
  airwayBillNumber,
  isUpdating,
  color,
}) => {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);
  const isDelivered = currentStatus === "Delivered" || currentIndex === STATUS_FLOW.length - 1;
  const nextAllowedStatus = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentIndex + 1]
    : null;

  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Default directly to the next allowed status in the workflow
      setSelectedStatus(nextAllowedStatus || "");
    }
  }, [isOpen, nextAllowedStatus]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedStatus || selectedStatus !== nextAllowedStatus || isDelivered) return;
    onConfirm(selectedStatus);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-status-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300"
      >
        {/* Header (Fixed at top) */}
        <div className="flex-none px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div>
            <h3 id="change-status-title" className="text-base sm:text-lg font-bold text-gray-900">
              Shipment Status Progression
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              AWB: <span className="font-mono font-bold text-gray-800">{airwayBillNumber}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Workflow Visual Stepper (Fixed at top) */}
        <div className="flex-none px-4 sm:px-6 pt-3.5 pb-2.5 bg-gradient-to-b from-gray-50/50 to-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            {STATUS_FLOW.map((status, index) => {
              const isPast = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isNext = index === currentIndex + 1;

              return (
                <div key={status} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPast
                          ? "bg-emerald-500 text-white shadow-sm"
                          : isCurrent
                            ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow"
                            : isNext
                              ? "bg-amber-100 text-amber-800 border-2 border-amber-400"
                              : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isPast ? <Check size={14} strokeWidth={3} /> : index + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-1 font-semibold tracking-tight ${
                        isCurrent
                          ? "text-blue-600 font-bold"
                          : isPast
                            ? "text-emerald-700"
                            : isNext
                              ? "text-amber-800 font-bold"
                              : "text-gray-400"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  {index < STATUS_FLOW.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1.5 transition-colors ${
                        index < currentIndex ? "bg-emerald-400" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {/* Final Status Alert */}
          {isDelivered ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">Final Status Reached</h4>
                <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                  This shipment has reached <strong>Delivered</strong>. Delivered is the final terminal status in the shipment lifecycle and cannot be reversed or modified.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900 leading-relaxed">
                Shipment statuses follow a strict workflow: <strong>Accepted → Booked → Flown → Delivered</strong>.
              </p>
            </div>
          )}

          {/* Status List */}
          <div className="space-y-2.5">
            {STATUS_FLOW.map((statusKey, index) => {
              const detail = statusDetails[statusKey];
              const isPast = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isNext = index === currentIndex + 1;
              const isSelectable = isNext && !isDelivered;
              const isSelected = selectedStatus === statusKey;

              return (
                <button
                  key={statusKey}
                  type="button"
                  disabled={!isSelectable}
                  onClick={() => isSelectable && setSelectedStatus(statusKey)}
                  className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/40 shadow-sm ring-2 ring-blue-100"
                      : isCurrent
                        ? "border-blue-200 bg-blue-50/20 cursor-default"
                        : isPast
                          ? "border-gray-200 bg-gray-50/60 opacity-75 cursor-not-allowed"
                          : "border-gray-100 bg-gray-50/30 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 transition-colors ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : isCurrent
                            ? "bg-blue-100 text-blue-600"
                            : isPast
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isPast ? (
                        <Check size={16} strokeWidth={3} />
                      ) : isCurrent ? (
                        <CheckCircle2 size={16} />
                      ) : isNext ? (
                        <ArrowRight size={16} />
                      ) : (
                        <Lock size={16} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span
                          className={`font-bold text-sm ${
                            isSelected
                              ? "text-blue-950"
                              : isCurrent
                                ? "text-blue-900"
                                : isPast
                                  ? "text-gray-600 line-through"
                                  : "text-gray-500"
                          }`}
                        >
                          {detail.label}
                        </span>

                        {isPast && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gray-500 bg-gray-200/80 px-1.5 sm:px-2 py-0.5 rounded-md">
                            Completed • Reversal ❌
                          </span>
                        )}

                        {isCurrent && (
                          <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 sm:px-2 py-0.5 rounded-md">
                            Current Status
                          </span>
                        )}

                        {isNext && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 sm:px-2 py-0.5 rounded-md animate-pulse">
                            Next Stage ✅
                          </span>
                        )}

                        {index > currentIndex + 1 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded-md">
                            <Ban size={10} />
                            Cannot Skip
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-tight truncate">
                        {detail.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 ml-2 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky Footer (Fixed at bottom on mobile and desktop) */}
        <div className="flex-none sticky bottom-0 bg-white border-t border-gray-100 p-3 sm:p-4 z-20 flex gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 sm:py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm"
          >
            {isDelivered ? "Close" : "Cancel"}
          </button>
          {!isDelivered && (
            <button
              onClick={handleConfirm}
              disabled={isUpdating || !selectedStatus || selectedStatus !== nextAllowedStatus}
              style={{ backgroundColor: color || "#3DA5E0" }}
              className="flex-1 px-4 py-2.5 sm:py-3 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20 text-sm flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Advance to {nextAllowedStatus}</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangeStatusModal;
