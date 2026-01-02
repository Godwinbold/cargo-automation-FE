import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AnalyticalCharts = () => {
  const shipmentData = [
    { month: "Jan", value: 65 },
    { month: "Feb", value: 85 },
    { month: "Mar", value: 105 },
    { month: "Apr", value: 115 },
    { month: "May", value: 125 },
    { month: "Jun", value: 135 },
    { month: "Jul", value: 155 },
    { month: "Aug", value: 135 },
    { month: "Sep", value: 120 },
    { month: "Oct", value: 105 },
    { month: "Nov", value: 95 },
    { month: "Dec", value: 130 },
  ];

  const revenueData = [
    { month: "Jan", value: 1.2 },
    { month: "Feb", value: 1.8 },
    { month: "Mar", value: 2.1 },
    { month: "Apr", value: 2.3 },
    { month: "May", value: 2.5 },
    { month: "Jun", value: 2.7 },
    { month: "Jul", value: 3.1 },
    { month: "Aug", value: 2.7 },
    { month: "Sep", value: 2.4 },
    { month: "Oct", value: 2.1 },
    { month: "Nov", value: 1.9 },
    { month: "Dec", value: 2.6 },
  ];

  const CustomTooltipShipment = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
          <p className="text-sm font-bold text-[#1A1A1A]">
            Shipments: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipRevenue = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
          <p className="text-sm font-bold text-[#1A1A1A]">
            Revenue: <span className="font-bold">N{payload[0].value}M</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Shipments Chart */}
      <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#D3EBF8]">
        <div className="mb-6">
          <h3 className="text-[16px] font-bold text-[#1A1A1A]">
            Monthly Shipments
          </h3>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Shipment volume throught the year
          </p>
        </div>
        <div className="h-[300px] w-full  mt-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={shipmentData}
              margin={{ top: 10, right: 0, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F0F0F0"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B6B6B", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B6B6B", fontSize: 12 }}
                label={{
                  value: "Shipment count",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#6B6B6B",
                  fontSize: 12,
                  style: { textAnchor: "middle" },
                  offset: 0,
                }}
              />
              <Tooltip
                content={<CustomTooltipShipment />}
                cursor={{ fill: "transparent" }}
              />
              <Bar
                dataKey="value"
                fill="#007AFF"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#D3EBF8]">
        <div className="mb-6">
          <h3 className="text-[16px] font-bold text-[#1A1A1A]">
            Monthly Revenue
          </h3>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Revenue performance in nigeria naira
          </p>
        </div>
        <div className="h-[300px] w-full  mt-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenueData}
              margin={{ top: 10, right: 0, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F0F0F0"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B6B6B", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B6B6B", fontSize: 12 }}
                tickFormatter={(value) => `N${value}M`}
                label={{
                  value: "Revenue(N)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#6B6B6B",
                  fontSize: 12,
                  style: { textAnchor: "middle" },
                  offset: 0,
                }}
              />
              <Tooltip
                content={<CustomTooltipRevenue />}
                cursor={{ fill: "transparent" }}
              />
              <Bar
                dataKey="value"
                fill="#28A745"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticalCharts;
