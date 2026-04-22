import React from "react";
import { Plane, DollarSign, Weight, ArrowUp, ArrowDown } from "lucide-react";

const FilteredResult = ({ isLoading, data }) => {
  const resultData = data || {
    totalShipments: 0,
    totalRevenue: 0,
    averageWeightKg: 0,
    totalWeightKg: 0,
  };

  const formatRevenue = (amount = 0) => {
    if (amount >= 1_000_000) return `N${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `N${(amount / 1_000).toFixed(2)}K`;
    return `N${parseFloat(amount.toFixed(2)).toLocaleString()}`;
  };

  const formatWeight = (kg = 0) => {
    if (kg >= 1_000) return `${(kg / 1_000).toFixed(2)} tons`;
    return `${parseFloat(kg.toFixed(2)).toLocaleString()} kg`;
  };

  const stats = [
    {
      title: "Total Shipments",
      value: isLoading
        ? "..."
        : (resultData.totalShipments || 0).toLocaleString(),
      change: "+12.5% from last month",
      isPositive: true,
      icon: Plane,
      iconBg: "bg-[#D3EAF8]",
      iconColor: "text-[#155C84]",
    },
    {
      title: "Total Revenue",
      value: isLoading ? "..." : formatRevenue(resultData.totalRevenue || 0),
      change: "+8.2% from last month",
      isPositive: true,
      icon: DollarSign,
      iconBg: "bg-[#D1FADB]",
      iconColor: "text-[#22CAD5]",
    },
    {
      title: "Average Weight",
      value: isLoading ? "..." : formatWeight(resultData.averageWeightKg || 0),
      change: "-8.2% from last month",
      isPositive: false,
      icon: Weight,
      iconBg: "bg-[#FDDECE]",
      iconColor: "text-[#E86E18]",
    },
    {
      title: "Total Weight",
      value: isLoading ? "..." : formatWeight(resultData.totalWeightKg || 0),
      change: "+5.1% from last month",
      isPositive: true,
      icon: Weight,
      iconBg: "bg-[#EDE9FE]",
      iconColor: "text-[#7C3AED]",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#D3EBF8] p-6">
      <h3 className="text-[16px] font-bold text-[#1A1A1A] mb-6">
        Filtered Result
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="border border-gray-100 rounded-xl p-5 flex justify-between items-center bg-white shadow-sm"
          >
            <div className="flex flex-col gap-2">
              <span className="text-sm text-[#6B6B6B] font-medium">
                {stat.title}
              </span>
              <span className="text-[28px] font-semibold text-[#202127]">
                {stat.value}
              </span>
              <div
                className={`flex items-center text-xs font-medium ${
                  stat.isPositive ? "text-[#20B645]" : "text-[#EA580C]"
                }`}
              >
                {stat.isPositive ? (
                  <ArrowUp className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDown className="w-3 h-3 mr-1" />
                )}
                {stat.change}
              </div>
            </div>

            <div
              className={`w-12 h-12 rounded-lg ${stat.iconBg} flex items-center justify-center`}
            >
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilteredResult;
