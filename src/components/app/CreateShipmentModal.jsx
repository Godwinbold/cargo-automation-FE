import React, { useState } from "react";
import { useCreateShipment } from "../../hooks/useShipment";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lock } from "lucide-react";

const CreateShipmentModal = ({ isOpen, onClose, airlineId, color }) => {
  const queryClient = useQueryClient();
  const { mutate: createShipment, isPending: isCreating } = useCreateShipment();

  const today = new Date().toISOString().split("T")[0];

  const [newShipment, setNewShipment] = useState({
    airwayBillNumber: "",
    status: "Accepted",
    date: "",
  });

  const inputClass =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

  const handleCreateShipment = () => {
    if (!newShipment.airwayBillNumber?.trim() || !newShipment.date) {
      toast.error("Please provide both Airway Bill Number and Date.");
      return;
    }

    if (newShipment.date > today) {
      toast.error("Shipment date cannot be in the future.");
      return;
    }

    const payload = {
      airwayBillNumber: newShipment.airwayBillNumber.trim(),
      status: 0, // Initial status is always 0 (Accepted)
      shipmentDate: new Date(newShipment.date).toISOString(),
    };

    createShipment(
      { airlineId, data: payload },
      {
        onSuccess: () => {
          toast.success("Shipment created successfully!");
          queryClient.invalidateQueries(["shipments", airlineId]);
          onClose();
          setNewShipment({
            airwayBillNumber: "",
            status: "Accepted",
            date: "",
          });
        },
        onError: (error) => {
          const apiError = error.response?.data;
          const errorMessage =
            apiError?.errors?.[0]?.message ||
            apiError?.message ||
            "Failed to create shipment";
          toast.error(errorMessage);
        },
      },
    );
  };

  const handleClose = () => {
    setNewShipment({
      airwayBillNumber: "",
      status: "Accepted",
      date: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in"
          style={{ animation: "modalPop 0.3s ease-out forwards" }}
        >
          <h3 className="text-xl font-semibold mb-6 text-gray-900">Create New Shipment</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Airway Bill Number
              </label>
              <input
                type="text"
                value={newShipment.airwayBillNumber}
                onChange={(e) =>
                  setNewShipment({
                    ...newShipment,
                    airwayBillNumber: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="e.g. AWB-1008"
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Lock size={11} />
                  Initial Status
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value="Accepted"
                  disabled
                  readOnly
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-semibold cursor-not-allowed select-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Accepted
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                New shipments always start as Accepted. Progression can be updated after creation.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                max={today}
                value={newShipment.date}
                onChange={(e) => {
                  const selected = e.target.value;
                  if (selected && selected > today) {
                    toast.error("Shipment date cannot be in the future.");
                    return;
                  }
                  setNewShipment({ ...newShipment, date: selected });
                }}
                className={inputClass}
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Future dates are not permitted. Maximum selectable date is today.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={handleClose}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateShipment}
              disabled={
                !newShipment.airwayBillNumber.trim() ||
                !newShipment.date ||
                newShipment.date > today ||
                isCreating
              }
              style={{ backgroundColor: color || "#3DA5E0" }}
              className="px-5 py-2 text-white rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 font-medium min-w-[100px] flex items-center justify-center shadow-md hover:opacity-90"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modalPop {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default CreateShipmentModal;
