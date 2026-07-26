"use client";
import { useState } from "react";
import { useWebSocket } from "@/lib/useWebSocket";
import BuildingModel from "@/components/BuildingModel";
import TelemetryChart from "@/components/TelemetryChart";
import AgentLog from "@/components/AgentLog";
import EnergyPieChart from "@/components/EnergyPieChart";
import DataJournal from "@/components/DataJournal";
import ExportHub from "@/components/ExportHub";
import { Activity, Thermometer, Wind, Droplets, Zap } from "lucide-react";

export default function Dashboard() {
  const { data: telemetry, isConnected } = useWebSocket<any>("ws://127.0.0.1:8000/ws/telemetry");
  const [activeTab, setActiveTab] = useState<'agent' | 'journal' | 'exports'>('agent');

  return (
    <main className="min-h-screen p-4 lg:p-8 flex flex-col h-screen relative z-10">
      {/* Glowing background elements for aesthetics */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
            EcoLoop AI
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">Autonomous Building Energy Optimization</p>
        </div>
        <div className="flex items-center gap-3 glass px-4 py-2 rounded-full border border-white/10 shadow-lg">
          <span className="relative flex h-3 w-3">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
          </span>
          <span className="text-sm font-semibold text-gray-200 tracking-wide">{isConnected ? "System Online" : "Connecting..."}</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Col: 3D Twin & Stats */}
        <div className="xl:col-span-2 flex flex-col gap-6 min-h-0">
          
          {/* Top Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 shrink-0">
            <StatCard icon={<Thermometer />} label="Zone Temp" value={telemetry?.zone_temp_c} unit="°C" />
            <StatCard icon={<Wind />} label="CO2 Level" value={telemetry?.zone_co2_ppm} unit="ppm" />
            <StatCard icon={<Activity />} label="IAQ Score" value={telemetry?.iaq_score} unit="/100" />
            <StatCard icon={<Droplets />} label="Chiller Load" value={telemetry?.chiller_load_kw} unit="kW" />
            <StatCard 
              icon={<Zap className="text-yellow-400" />} 
              label="Energy Saved" 
              value={telemetry?.baseline_cumulative_kwh > 0 ? ((telemetry.baseline_cumulative_kwh - telemetry.optimized_cumulative_kwh) / telemetry.baseline_cumulative_kwh * 100) : 0} 
              unit="%" 
            />
          </div>

          {/* 3D Digital Twin Container */}
          <div className="flex-1 glass rounded-2xl overflow-hidden relative border border-white/5 shadow-2xl min-h-0 bg-gradient-to-b from-transparent to-black/40">
            <div className="absolute top-5 left-5 z-10 glass px-4 py-2 rounded-full text-xs font-bold tracking-wider text-white/90 border border-white/10 flex items-center gap-2 shadow-xl backdrop-blur-md">
              <span className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)] ${telemetry?.hvac_mode === 'cooling' ? 'bg-cyan-400 shadow-cyan-400' : telemetry?.hvac_mode === 'heating' ? 'bg-rose-400 shadow-rose-400' : 'bg-gray-500'}`}></span>
              HVAC: {telemetry?.hvac_mode?.toUpperCase() || 'OFF'}
            </div>
            <div className="absolute top-5 right-5 z-10 glass px-4 py-2 rounded-full text-xs font-bold tracking-wider text-gray-300 border border-white/10 flex items-center shadow-xl backdrop-blur-md">
              Outdoors: {telemetry?.outdoor_temp_c || '--'}°C
            </div>
            <BuildingModel telemetry={telemetry} />
          </div>

          {/* Bottom Area: Line Chart & Pie Chart */}
          <div className="shrink-0 h-[280px] grid grid-cols-3 gap-6">
            <div className="col-span-2 h-full">
              <TelemetryChart latestData={telemetry} />
            </div>
            <div className="col-span-1 glass rounded-xl border border-white/10 shadow-2xl overflow-hidden bg-black/40 h-full">
              <EnergyPieChart telemetry={telemetry} />
            </div>
          </div>
        </div>

        {/* Right Col: AI Agent Log / Journal / Exports */}
        <div className="xl:col-span-1 h-full min-h-0 flex flex-col gap-4">
          <div className="flex gap-2 glass p-1.5 rounded-xl shrink-0 shadow-lg border border-white/10">
            <button onClick={() => setActiveTab('agent')} className={`flex-1 p-2 rounded-lg text-sm font-extrabold tracking-wide transition-all ${activeTab === 'agent' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>Live Agent</button>
            <button onClick={() => setActiveTab('journal')} className={`flex-1 p-2 rounded-lg text-sm font-extrabold tracking-wide transition-all ${activeTab === 'journal' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>Data Journal</button>
            <button onClick={() => setActiveTab('exports')} className={`flex-1 p-2 rounded-lg text-sm font-extrabold tracking-wide transition-all ${activeTab === 'exports' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>Export Hub</button>
          </div>
          
          <div className="flex-1 min-h-0 relative">
            <div className={`absolute inset-0 h-full ${activeTab === 'agent' ? 'block' : 'hidden'}`}>
              <AgentLog />
            </div>
            <div className={`absolute inset-0 h-full ${activeTab === 'journal' ? 'block' : 'hidden'}`}>
              <DataJournal />
            </div>
            <div className={`absolute inset-0 h-full ${activeTab === 'exports' ? 'block' : 'hidden'}`}>
              <ExportHub />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value, unit }: any) {
  return (
    <div className="glass rounded-xl p-5 flex flex-col justify-between border border-white/10 hover:border-white/20 transition-all hover:bg-white/5 shadow-lg group">
      <div className="flex items-center gap-2 text-gray-400 mb-3 group-hover:text-gray-300 transition-colors">
        <div className="text-blue-400/90">{icon}</div>
        <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400 group-hover:text-gray-300">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5 truncate">
        <span className="text-3xl font-extrabold text-white tracking-tight truncate">
          {value !== undefined ? (typeof value === 'number' ? value.toFixed(1) : value) : '--'}
        </span>
        <span className="text-sm font-semibold text-gray-500">{unit}</span>
      </div>
    </div>
  );
}
