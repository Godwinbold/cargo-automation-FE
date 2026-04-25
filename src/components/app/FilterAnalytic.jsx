import React from "react";
import { Plane, DollarSign, Weight, ArrowUp, ArrowDown } from "lucide-react";

const FilterAnalytic = ({ data, isLoading }) => {
  const formatValue = (val = 0) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(2)}K`;
    return parseFloat(val.toFixed(2)).toLocaleString();
  };

  const stats = [
    {
      title: "Total Shipments",
      value: data?.totalShipments?.currentValue || "0",
      change: `${data?.totalShipments?.growthPercentage || 0}% from last month`,
      isPositive: (data?.totalShipments?.growthPercentage || 0) >= 0,
      icon: Plane,
      iconBg: "bg-[#D3EAF8]",
      iconColor: "text-[#155C84]",
    },
    {
      title: "Total Revenue",
      value: `N${formatValue(data?.totalRevenue?.currentValue || 0)}`,
      change: `${data?.totalRevenue?.growthPercentage || 0}% from last month`,
      isPositive: (data?.totalRevenue?.growthPercentage || 0) >= 0,
      icon: DollarSign,
      iconBg: "bg-[#D1FADB]",
      iconColor: "text-[#22CAD5]",
    },
    {
      title: "Average Weight",
      value: `${(data?.averageWeight?.currentValue || 0).toFixed(2)} kg`,
      change: `${(data?.averageWeight?.growthPercentage || 0).toFixed(2)}% from last month`,
      isPositive: (data?.averageWeight?.growthPercentage || 0) >= 0,
      icon: Weight,
      iconBg: "bg-[#FDDECE]",
      iconColor: "text-[#E86E18]",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-[#D6D6D6] rounded-xl p-5 flex justify-between items-center bg-white shadow-sm animate-pulse"
          >
            <div className="flex flex-col gap-2 w-full">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="border border-[#D6D6D6] rounded-xl p-5 flex justify-between items-center bg-white shadow-sm"
          >
            <div className="flex flex-col gap-2">
              <span className="text-sm text-[#6B6B6B] font-medium">
                {stat.title}
              </span>
              <span className="text-[18px] md:text-[20px] font-semibold text-[#202127]">
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

export default FilterAnalytic;
