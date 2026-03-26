import React, { useState } from "react";
import { useCreateShipment } from "../../hooks/useShipment";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const CreateShipmentModal = ({ isOpen, onClose, airlineId, color }) => {
  const queryClient = useQueryClient();
  const { mutate: createShipment, isPending: isCreating } = useCreateShipment();

  const [newShipment, setNewShipment] = useState({
    airwayBillNumber: "",
    status: "Booked",
    date: "",
  });

  const statusOptions = ["Accepted", "Booked", "Delivered", "Flown"];
  const statusMap = {
    Accepted: 0,
    Booked: 1,
    Delivered: 2,
    Flown: 3,
  };

  const inputClass =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  const handleCreateShipment = () => {
    if (!newShipment.airwayBillNumber || !newShipment.date) return;

    const payload = {
      airwayBillNumber: newShipment.airwayBillNumber,
      status: statusMap[newShipment.status] ?? 0,
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
            status: "Booked",
            date: "",
          });
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || "Failed to create shipment",
          );
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in"
          style={{ animation: "modalPop 0.3s ease-out forwards" }}
        >
          <h3 className="text-xl font-semibold mb-6">Create New Shipment</h3>

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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="relative">
                <select
                  value={newShipment.status}
                  onChange={(e) =>
                    setNewShipment({
                      ...newShipment,
                      status: e.target.value,
                    })
                  }
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  ▼
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={newShipment.date}
                onChange={(e) =>
                  setNewShipment({ ...newShipment, date: e.target.value })
                }
                className={inputClass}
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <textarea
                value={newShipment.note}
                onChange={(e) =>
                  setNewShipment({ ...newShipment, note: e.target.value })
                }
                className={`${inputClass} resize-none`}
                rows={3}
                placeholder="Optional note"
              />
            </div> */}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateShipment}
              disabled={
                !newShipment.airwayBillNumber || !newShipment.date || isCreating
              }
              style={{ backgroundColor: color }}
              className="px-5 py-2 text-white rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50"
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
