import React, { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { useUpdateDocument } from "../../hooks/useShipment";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const EditDocumentModal = ({ isOpen, onClose, airlineId, document, color }) => {
  const queryClient = useQueryClient();
  const { mutate: updateDocument, isPending: isSaving } = useUpdateDocument();

  const [form, setForm] = useState({
    airwayBillNumber: "",
    shipmentDate: "",
  });

  // Populate form when document changes
  useEffect(() => {
    if (document) {
      setForm({
        airwayBillNumber: document.airwayBillNumber || "",
        // Convert ISO datetime to date-input format (YYYY-MM-DD)
        shipmentDate: document.shipmentDate
          ? document.shipmentDate.split("T")[0]
          : "",
      });
    }
  }, [document]);

  if (!isOpen || !document) return null;

  const hasChanges =
    form.airwayBillNumber !== (document.airwayBillNumber || "") ||
    form.shipmentDate !== (document.shipmentDate?.split("T")[0] || "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.airwayBillNumber.trim()) {
      toast.error("Airway Bill Number is required");
      return;
    }

    updateDocument(
      {
        airlineId,
        shipmentId: document.shipmentId,
        id: document.id,
        data: {
          airwayBillNumber: form.airwayBillNumber.trim(),
          shipmentDate: form.shipmentDate || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Document updated successfully");
          queryClient.invalidateQueries(["documents", "airline", airlineId]);
          onClose();
        },
        onError: (err) => {
          toast.error(
            err.response?.data?.message || "Failed to update document"
          );
        },
      }
    );
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm text-gray-700 bg-white transition";

  const focusStyle = { "--tw-ring-color": color };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          style={{ animation: "modalEntry 0.35s cubic-bezier(0.16, 1, 0.3, 1)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <div>
              <h3 className="text-base font-bold text-gray-900">Edit Document</h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[280px]">
                {document.fileName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Airway Bill Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Airway Bill Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="airwayBillNumber"
                value={form.airwayBillNumber}
                onChange={handleChange}
                className={inputClass}
                style={focusStyle}
                placeholder="e.g. AWB-2025-001"
                required
              />
            </div>

            {/* Shipment Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Shipment Date
              </label>
              <input
                type="date"
                name="shipmentDate"
                value={form.shipmentDate}
                onChange={handleChange}
                className={inputClass}
                style={focusStyle}
              />
            </div>

            {/* Read-only info */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
              {[
                { label: "File", value: document.fileName },
                { label: "Type", value: document.contentType },
                { label: "Shipment ID", value: document.shipmentId },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-semibold">{label}</span>
                  <span className="text-gray-600 font-mono truncate max-w-[200px]">{value || "-"}</span>
                </div>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !hasChanges}
                style={{ backgroundColor: isSaving || !hasChanges ? undefined : color }}
                className="flex-1 px-4 py-2.5 text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2
                  disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes modalEntry {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </>
  );
};

export default EditDocumentModal;
