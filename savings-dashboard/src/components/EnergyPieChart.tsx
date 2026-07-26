"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function EnergyPieChart({ telemetry }: { telemetry: any }) {
  const [data, setData] = useState([
    { name: "Chillers / Compressor", value: 45, color: "#00d2ff" },
    { name: "Supply Fans & Vent", value: 25, color: "#a855f7" },
    { name: "Lighting System", value: 18, color: "#ffaa00" },
    { name: "Plug Loads & Misc", value: 12, color: "#ff3366" },
  ]);

  useEffect(() => {
    // Dynamic mock state updater for subtle fluctuation
    const interval = setInterval(() => {
      setData((prevData) => {
        return prevData.map(item => {
          // Add noise between -2% and +2% of original base
          const noise = (Math.random() * 4 - 2); 
          let baseValue = 0;
          if (item.name.includes("Chillers")) baseValue = 45;
          if (item.name.includes("Fans")) baseValue = 25;
          if (item.name.includes("Lighting")) baseValue = 18;
          if (item.name.includes("Plug")) baseValue = 12;
          
          return { ...item, value: Math.max(1, baseValue + noise) };
        });
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataInfo = payload[0];
      const percentage = ((dataInfo.value / total) * 100).toFixed(1);
      return (
        <div className="bg-black/80 border border-white/10 rounded-lg p-3 shadow-xl backdrop-blur-md">
          <p className="text-white font-bold mb-1" style={{ color: dataInfo.payload.color }}>
            {dataInfo.name}
          </p>
          <div className="flex justify-between items-center gap-4 text-sm font-mono">
            <span className="text-gray-300">Distribution:</span>
            <span className="text-white font-bold">{percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col pt-3 pb-2">
      <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1 ml-5">Live Energy Breakdown</h3>
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="80%"
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0px 0px 8px ${entry.color}66)` }} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Legend 
              verticalAlign="bottom" 
              height={40} 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Inner Donut Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-8">
          <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Total Load</span>
          <span className="text-white text-lg font-extrabold font-mono tracking-tighter">
            {telemetry?.chiller_load_kw ? (telemetry.chiller_load_kw * (100/45)).toFixed(1) : "32.4"} <span className="text-xs text-gray-500">kW</span>
          </span>
        </div>
      </div>
    </div>
  );
}
