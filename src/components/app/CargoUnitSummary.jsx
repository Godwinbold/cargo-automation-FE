import React from "react";

const CargoUnitSummary = ({ isLoading, data = [] }) => {
  const defaultData = [
    {
      name: "Turkish Airline",
      shipment: "",
      weight: "",
      amount: "",
    },
    { name: "RwandAir", shipment: "", weight: "", amount: "" },
    { name: "Air Cote d' voire", shipment: "", weight: "", amount: "" },
    { name: "United Cargo", shipment: "", weight: "", amount: "" },
    { name: "South African Airways", shipment: "", weight: "", amount: "" },
  ];

  const displayData = data.length > 0 ? data : defaultData;

  return (
    <div className="bg-white mt-[82px] rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#D3EBF8] p-6 w-full">
      <h2 className="text-[16px] font-semibold mb-4 text-[#202127]">
        Cargo Unit Summary
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="text-[#6B6B6B] text-sm">
              <th className="bg-[#F2F9FD] py-3 px-4 font-semibold whitespace-nowrap first:rounded-l-lg first:pl-4">
                Cargo Units
              </th>
              <th className="bg-[#F2F9FD] py-3 px-4 font-semibold whitespace-nowrap">
                Total Shipment
              </th>
              <th className="bg-[#F2F9FD] py-3 px-4 font-semibold whitespace-nowrap">
                Total Weight
              </th>
              <th className="bg-[#F2F9FD] py-3 px-4 font-semibold whitespace-nowrap last:rounded-r-lg last:pr-4">
                Total Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan="4"
                  className="py-8 px-4 text-center text-[#6B6B6B] text-sm"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-[#3DA5E0]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading cargo units...
                  </div>
                </td>
              </tr>
            ) : displayData.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="py-8 px-4 text-center text-[#6B6B6B] text-sm"
                >
                  No cargo units found.
                </td>
              </tr>
            ) : (
              displayData.map((item, index) => (
                <tr
                  key={item.airlineId || index}
                  className="hover:bg-gray-50/30 transition-colors group"
                >
                  <td className="py-4 px-4 text-[#525252] font-medium text-sm border-b border-gray-50 group-last:border-0">
                    {item.airlineName || item.name || "-"}
                  </td>
                  <td className="py-4 px-4 text-[#525252] text-sm border-b border-gray-50 group-last:border-0">
                    {item.totalShipments !== undefined
                      ? item.totalShipments.toLocaleString()
                      : item.shipment || "-"}
                  </td>
                  <td className="py-4 px-4 text-[#525252] text-sm border-b border-gray-50 group-last:border-0">
                    {item.totalWeightKg !== undefined
                      ? `${item.totalWeightKg.toLocaleString()}kg`
                      : item.weight || "-"}
                  </td>
                  <td className="py-4 px-4 text-[#525252] text-sm border-b border-gray-50 group-last:border-0">
                    {item.totalAmount !== undefined
                      ? `$${item.totalAmount.toLocaleString()}`
                      : item.amount || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CargoUnitSummary;
