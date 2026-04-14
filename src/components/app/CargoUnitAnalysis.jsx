import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";

const CargoUnitAnalysis = ({ cargoUnits, isLoading }) => {
  // Sorting airlines by revenue for the chart
  const revenueByAirline = (cargoUnits || [])
    .map(unit => ({
      name: unit.airlineName,
      revenue: parseFloat((unit.totalAmount / 1000000).toFixed(2)),
      shipments: unit.totalShipments
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10); // Show top 10

  // Distribution for pie chart
  const shipmentDistribution = (cargoUnits || [])
    .filter(u => u.totalShipments > 0)
    .map(unit => ({
      name: unit.airlineName,
      value: unit.totalShipments
    }));

  const COLORS = ["#36A2EB", "#FF6384", "#4BC0C0", "#FFCE56", "#9966FF", "#FF9F40"];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#D3EBF8] h-[400px] animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-1/3 mb-10"></div>
          <div className="h-48 bg-gray-50 rounded"></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#D3EBF8] h-[400px] animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-1/2 mb-10"></div>
          <div className="h-48 bg-gray-50 rounded"></div>
        </div>
      </div>
    );
  }

  const CustomTooltipRevenue = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl">
          <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-tight">{payload[0].payload.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Revenue:</span>
            <span className="text-sm font-bold text-[#28A745]">₦{payload[0].value}M</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-gray-600">Shipments:</span>
            <span className="text-sm font-bold text-[#3DA5E0]">{payload[0].payload.shipments}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Airline Revenue Chart */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#D3EBF8]">
        <div className="mb-8">
          <h3 className="text-[18px] font-bold text-[#1A1A1A]">Airline Performance (Revenue)</h3>
          <p className="text-sm text-[#6B6B6B] mt-1">Comparing total revenue generated across cargo units</p>
        </div>

        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={revenueByAirline}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F5F9" />
              <XAxis 
                type="number" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94A3B8", fontSize: 12 }}
                tickFormatter={(val) => `₦${val}M`}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                width={120}
                tick={{ fill: "#1A1A1A", fontSize: 12, fontWeight: 500 }}
              />
              <Tooltip content={<CustomTooltipRevenue />} cursor={{ fill: "#F8FAFC" }} />
              <Bar 
                dataKey="revenue" 
                fill="#3DA5E0" 
                radius={[0, 10, 10, 0]} 
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Shipment Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#D3EBF8]">
        <div className="mb-8">
          <h3 className="text-[18px] font-bold text-[#1A1A1A]">Shipment Share</h3>
          <p className="text-sm text-[#6B6B6B] mt-1">Volume distribution by cargo unit</p>
        </div>

        <div className="h-[260px] w-full flex items-center justify-center">
          {shipmentDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shipmentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {shipmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-sm text-gray-400 italic">No shipment data to display</div>
          )}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {shipmentDistribution.slice(0, 4).map((entry, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-[11px] font-semibold text-gray-700 truncate max-w-[80px]">{entry.name}</span>
            </div>
          ))}
          {shipmentDistribution.length > 4 && (
            <span className="text-[11px] text-gray-400 font-medium">+{shipmentDistribution.length - 4} more</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CargoUnitAnalysis;
