import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useCreateAirline, useUpdateAirline } from "../../../hooks/useGeneral";
import { useQueryClient } from "@tanstack/react-query";

const AirlineModal = ({ isOpen, onClose, selectedAirline }) => {
  const [airlineName, setAirlineName] = useState("");
  const queryClient = useQueryClient();

  const { mutate: createAirline, isPending: isCreating } = useCreateAirline();
  const { mutate: updateAirline, isPending: isUpdating } = useUpdateAirline();

  useEffect(() => {
    if (selectedAirline) {
      setAirlineName(selectedAirline.airlineName || "");
    } else {
      setAirlineName("");
    }
  }, [selectedAirline, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!airlineName.trim()) {
      toast.error("Airline name is required.");
      return;
    }

    const payload = { airlineName: airlineName.trim() };

    if (selectedAirline) {
      // Edit mode
      updateAirline(
        { id: selectedAirline.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Airline updated successfully!");
            queryClient.invalidateQueries(["allAirlines"]);
            onClose();
          },
          onError: (error) => {
            const message =
              error.response?.data?.errors?.[0]?.message ||
              error.response?.data?.message ||
              "Failed to update airline.";
            toast.error(message);
          },
        }
      );
    } else {
      // Create mode
      createAirline(payload, {
        onSuccess: () => {
          toast.success("Airline created successfully!");
          queryClient.invalidateQueries(["allAirlines"]);
          onClose();
        },
        onError: (error) => {
          const message =
            error.response?.data?.errors?.[0]?.message ||
            error.response?.data?.message ||
            "Failed to create airline.";
          toast.error(message);
        },
      });
    }
  };

  if (!isOpen) return null;

  const isPending = isCreating || isUpdating;
  const title = selectedAirline ? "Edit Airline" : "Create New Airline";
  const buttonText = selectedAirline ? "Save Changes" : "Create Airline";

  return createPortal(
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
          <h3 className="text-xl font-semibold mb-6">{title}</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Airline Name
              </label>
              <input
                type="text"
                value={airlineName}
                onChange={(e) => setAirlineName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DA5E0]"
                placeholder="e.g. United Airlines"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !airlineName.trim()}
                className="px-5 py-2 bg-[#3DA5E0] hover:bg-[#2b8bc2] text-white rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center min-w-[120px]"
              >
                {isPending ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  buttonText
                )}
              </button>
            </div>
          </form>
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
  );
};

export default AirlineModal;
