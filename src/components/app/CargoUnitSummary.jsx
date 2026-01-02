import React from "react";

const CargoUnitSummary = () => {
  const data = [
    {
      name: "Turkish Airline",
      shipment: "431",
      weight: "2,200kg",
      amount: "$5,520",
    },
    { name: "RwandAir", shipment: "", weight: "", amount: "" },
    { name: "Air Cote d' voire", shipment: "", weight: "", amount: "" },
    { name: "United Cargo", shipment: "", weight: "", amount: "" },
    { name: "South African Airways", shipment: "", weight: "", amount: "" },
  ];

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
            {data.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50/30 transition-colors group"
              >
                <td className="py-4 px-4 text-[#525252] font-medium text-sm border-b border-gray-50 group-last:border-0">
                  {item.name}
                </td>
                <td className="py-4 px-4 text-[#525252] text-sm border-b border-gray-50 group-last:border-0">
                  {item.shipment}
                </td>
                <td className="py-4 px-4 text-[#525252] text-sm border-b border-gray-50 group-last:border-0">
                  {item.weight}
                </td>
                <td className="py-4 px-4 text-[#525252] text-sm border-b border-gray-50 group-last:border-0">
                  {item.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CargoUnitSummary;
