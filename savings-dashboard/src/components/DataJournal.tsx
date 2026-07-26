"use client";
import { useEffect, useState } from "react";
import { FileClock } from "lucide-react";

export default function DataJournal() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/logs/history");
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setLogs(data);
          setIsMock(false);
        } else {
          throw new Error("Invalid response format, expected array");
        }
      } catch (e) {
        // Fallback mock data silently
        setLogs([
          { agent: "EcoLoop-AI", timestamp: new Date().toISOString(), action: "Adjust Setpoints (MOCK)", reasoning: "Connection to backend failed. Rendering mock data." },
          { agent: "EcoLoop-AI", timestamp: new Date(Date.now() - 15000).toISOString(), action: "Optimize Vent (MOCK)", reasoning: "CO2 levels simulated rising." },
          { agent: "EcoLoop-AI", timestamp: new Date(Date.now() - 30000).toISOString(), action: "Cooling Load Shed (MOCK)", reasoning: "Peak hour pricing simulation." }
        ]);
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass rounded-xl p-5 border border-white/10 flex flex-col h-full max-h-[500px]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2 text-gray-400">
          <FileClock size={18} className="text-teal-400" />
          <h3 className="text-xs uppercase tracking-widest font-bold">Audit Trail / Data Journal</h3>
        </div>
        {isMock && <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/30 font-bold uppercase tracking-widest">Mock Mode</span>}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="text-gray-500 font-mono text-sm">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="text-gray-500 font-mono text-sm">No agent decisions recorded yet.</div>
        ) : (
          <div className="flex flex-col gap-3 pr-2">
            {logs.map((log, i) => (
              <div key={i} className="bg-black/40 border border-white/5 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-center mb-1 border-b border-white/5 pb-1">
                  <span className="text-teal-400 font-bold">{log.agent || "EcoLoop-AI"}</span>
                  <span className="text-gray-500 text-xs font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-gray-300 mt-2 font-medium">{log.action}</div>
                <div className="text-gray-500 text-xs mt-2 italic leading-relaxed bg-black/30 p-2 rounded">
                  {log.reasoning}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
