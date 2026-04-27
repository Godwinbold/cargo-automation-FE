import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";

const AnalyticalCharts = ({ monthlyData, averageWeight, isLoading }) => {
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatMonth = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("default", { month: "short" });
  };

  const combinedData = (monthlyData || []).map((item) => ({
    name: formatMonth(item.month),
    shipments: item.shipmentCount,
    revenue: parseFloat((item.revenue / 1000000).toFixed(2)),
  }));

  const weightComparisonData = averageWeight && averageWeight.previousValue !== undefined && averageWeight.currentValue !== undefined ? [
    { name: "Previous", value: parseFloat(averageWeight.previousValue.toFixed(2)), color: "#E0E0E0" },
    { name: "Current", value: parseFloat(averageWeight.currentValue.toFixed(2)), color: "#3DA5E0" }
  ] : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#D3EBF8] h-[450px] animate-pulse">
           <div className="h-6 bg-gray-100 rounded w-1/4 mb-10"></div>
           <div className="h-64 bg-gray-50 rounded"></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#D3EBF8] h-[450px] animate-pulse">
           <div className="h-6 bg-gray-100 rounded w-1/2 mb-10"></div>
           <div className="h-64 bg-gray-50 rounded"></div>
        </div>
      </div>
    );
  }

  const CustomTooltipCombined = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl">
          <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-tight">{label}</p>
          <div className="space-y-1">
            {payload[0] && (
              <div className="flex items-center justify-between gap-8">
                <span className="text-sm font-medium text-gray-600">Shipments</span>
                <span className="text-sm font-bold text-[#007AFF]">{payload[0].value}</span>
              </div>
            )}
            {payload[1] && (
              <div className="flex items-center justify-between gap-8">
                <span className="text-sm font-medium text-gray-600">Revenue</span>
                <span className="text-sm font-bold text-[#28A745]">₦{payload[1].value}M</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipWeight = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl">
          <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-tight">{payload[0].payload.name}</p>
          <p className="text-lg font-black text-[#1A1A1A]">{payload[0].value.toFixed(2)}<small className="font-medium text-gray-500 ml-1">kg</small></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Integrated Monthly Trends */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#D3EBF8]">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-[16px] md:text-[18px] font-bold text-[#1A1A1A]">Monthly Performance</h3>
            <p className="text-xs md:text-sm text-[#6B6B6B] mt-1">Comparison of shipment volume and revenue trends</p>
          </div>
          <div className="flex items-center gap-4 bg-gray-50/50 p-2 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#007AFF]" />
              <span className="text-xs font-medium text-gray-600">Shipments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#28A745]" />
              <span className="text-xs font-medium text-gray-600">Revenue (M)</span>
            </div>
          </div>
        </div>

        <div className="h-[320px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={combinedData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F5F9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 500 }}
                dy={12}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94A3B8", fontSize: 10 }}
                tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
              />
              <Tooltip content={<CustomTooltipCombined />} cursor={{ fill: "#F8FAFC" }} />
              <Bar 
                dataKey="shipments"
                fill="#007AFF" 
                radius={[6, 6, 0, 0]} 
                barSize={windowWidth < 768 ? 16 : 32}
              />
              <Bar 
                dataKey="revenue" 
                fill="#28A745" 
                radius={[6, 6, 0, 0]} 
                barSize={windowWidth < 768 ? 16 : 32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Average Weight Comparison */}
      <div className="bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#D3EBF8]">
        <div className="mb-8">
          <h3 className="text-[16px] md:text-[18px] font-bold text-[#1A1A1A]">Average Weight</h3>
          <p className="text-xs md:text-sm text-[#6B6B6B] mt-1">Current vs Previous period comparison</p>
        </div>

        <div className="h-[320px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weightComparisonData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F5F9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 600 }}
                dy={12}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltipWeight />} cursor={false} />
              <Bar 
                dataKey="value" 
                radius={[12, 12, 12, 12]} 
                barSize={windowWidth < 768 ? 40 : 64}
                background={{ fill: '#F8FAFC', radius: 12 }}
              >
                {weightComparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {averageWeight && averageWeight.growthPercentage !== undefined && (
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Growth</span>
            <div className={`text-sm font-bold flex items-center gap-1 ${averageWeight.growthPercentage >= 0 ? "text-[#28A745]" : "text-red-500"}`}>
              {averageWeight.growthPercentage >= 0 ? "+" : ""}{averageWeight.growthPercentage.toFixed(2)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticalCharts;
