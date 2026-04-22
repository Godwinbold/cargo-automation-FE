import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useGetAllAirlines } from "../../../hooks/useGeneral";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const InviteUserModal = ({ isOpen, onClose, inviteUser, isInviting }) => {
  const [formData, setFormData] = useState({
    email: "",
    role: "USER",
    airlineId: "",
  });

  const queryClient = useQueryClient();

  const { data: airlinesData, isLoading: isLoadingAirlines } =
    useGetAllAirlines();
  const airlines = airlinesData?.data || [];

  const roleOptions = ["USER", "ADMIN", "EXECUTIVE"];

  const handleInvite = () => {
    if (!formData.email || !formData.role) return;

    if (formData.role === "USER" && !formData.airlineId) {
      toast.error("Airline is required for USER role.");
      return;
    }

    const payload = {
      email: formData.email,
      role: formData.role,
      airlineId: formData.role === "USER" ? formData.airlineId : null,
    };

    inviteUser(payload, {
      onSuccess: () => {
        toast.success("User invited successfully!");
        queryClient.invalidateQueries(["appUsers"]);
        onClose();
        setFormData({
          email: "",
          role: "USER",
          airlineId: "",
        });
      },
      onError: (error) => {
        const message =
          error.response?.data?.errors?.[0]?.message ||
          error.response?.data?.message ||
          "Failed to invite user.";
        toast.error(message);
      },
    });
  };

  if (!isOpen) return null;

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
          <h3 className="text-xl font-semibold mb-6">Invite New User</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DA5E0]"
                placeholder="e.g. user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="relative">
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value,
                      airlineId:
                        e.target.value !== "USER" ? "" : formData.airlineId,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DA5E0] appearance-none bg-white cursor-pointer"
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>

            {formData.role === "USER" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Airline
                </label>
                <div className="relative">
                  <select
                    value={formData.airlineId}
                    onChange={(e) =>
                      setFormData({ ...formData, airlineId: e.target.value })
                    }
                    disabled={isLoadingAirlines}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DA5E0] appearance-none bg-white cursor-pointer"
                  >
                    <option value="">
                      {isLoadingAirlines
                        ? "Loading airlines..."
                        : "Select Airline"}
                    </option>
                    {airlines.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.airlineName}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    ▼
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={
                isInviting ||
                !formData.email ||
                (formData.role === "USER" && !formData.airlineId)
              }
              className="px-5 py-2 bg-[#3DA5E0] hover:bg-[#2b8bc2] text-white rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center min-w-[100px]"
            >
              {isInviting ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                "Invite User"
              )}
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
    document.body,
  );
};

export default InviteUserModal;
