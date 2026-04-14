import React from "react";

const CargoAirlinesTable = ({ isLoading, data = [] }) => {
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#D3EBF8] p-6 w-full mt-6">
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-[#1A1A1A]">
          Cargo Airlines
        </h2>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Detailed performance breakdown by airline unit
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="text-[#6B6B6B] text-xs uppercase tracking-wider">
              <th className="bg-[#F2F9FD] py-4 px-4 font-semibold whitespace-nowrap first:rounded-l-lg border-b border-[#D3EBF8]">
                Airlines Name
              </th>
              <th className="bg-[#F2F9FD] py-4 px-4 font-semibold whitespace-nowrap border-b border-[#D3EBF8]">
                Total Shipment
              </th>
              <th className="bg-[#F2F9FD] py-4 px-4 font-semibold whitespace-nowrap border-b border-[#D3EBF8]">
                Total Weight (kg)
              </th>
              <th className="bg-[#F2F9FD] py-4 px-4 font-semibold whitespace-nowrap last:rounded-r-lg border-b border-[#D3EBF8]">
                Total Amount (₦)
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4 border-b border-gray-50"><div className="h-4 bg-gray-100 rounded w-3/4"></div></td>
                  <td className="py-4 px-4 border-b border-gray-50"><div className="h-4 bg-gray-100 rounded w-1/2"></div></td>
                  <td className="py-4 px-4 border-b border-gray-50"><div className="h-4 bg-gray-100 rounded w-1/2"></div></td>
                  <td className="py-4 px-4 border-b border-gray-50"><div className="h-4 bg-gray-100 rounded w-1/2"></div></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-[#6B6B6B] text-sm">
                  No airline data found for the selected filters.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.airlineId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4 text-[#1A1A1A] font-medium text-sm border-b border-gray-50">
                    {item.airlineName}
                  </td>
                  <td className="py-4 px-4 text-[#525252] text-sm border-b border-gray-50 font-medium">
                    {item.totalShipments.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-[#525252] text-sm border-b border-gray-50 font-medium">
                    {item.totalWeightKg.toLocaleString()}kg
                  </td>
                  <td className="py-4 px-4 text-[#525252] text-sm border-b border-gray-50 font-bold text-[#28A745]">
                    ₦{item.totalAmount.toLocaleString()}
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

export default CargoAirlinesTable;
