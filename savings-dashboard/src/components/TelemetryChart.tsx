"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function TelemetryChart({ latestData }: { latestData: any }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (latestData) {
      setData((prev) => {
        const newData = [...prev, { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), ...latestData }];
        if (newData.length > 20) newData.shift();
        return newData;
      });
    }
  }, [latestData]);

  return (
    <div className="w-full h-64 glass rounded-xl p-4 flex flex-col mt-4">
      <h3 className="text-sm font-medium mb-4 text-gray-300 tracking-wide uppercase">Live Telemetry</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="time" stroke="#888" fontSize={10} tickMargin={10} />
            <YAxis yAxisId="left" stroke="#888" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `${v.toFixed(1)}`} />
            <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `${Math.round(v)}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff', fontSize: '12px' }}
              labelStyle={{ color: '#888', fontSize: '10px', marginBottom: '4px' }}
            />
            <Line yAxisId="left" type="monotone" dataKey="zone_temp_c" stroke="#3b82f6" strokeWidth={2} dot={false} name="Temp °C" isAnimationActive={false} />
            <Line yAxisId="right" type="monotone" dataKey="zone_co2_ppm" stroke="#10b981" strokeWidth={2} dot={false} name="CO2 ppm" isAnimationActive={false} />
            <Line yAxisId="left" type="monotone" dataKey="chiller_load_kw" stroke="#ef4444" strokeWidth={2} dot={false} name="Power kW" isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
