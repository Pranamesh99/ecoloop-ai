"use client";
import { useEffect, useState } from "react";
import { useWebSocket } from "@/lib/useWebSocket";
import { Activity, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AgentLog() {
  const { data: latestLog, isMockMode } = useWebSocket<any>("ws://127.0.0.1:8000/ws/logs");
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (latestLog) {
      setLogs((prev) => [latestLog, ...prev].slice(0, 10));
    }
  }, [latestLog]);

  return (
    <div className="glass rounded-xl p-6 h-full flex flex-col border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className="text-yellow-400 w-5 h-5" />
          <h3 className="text-lg font-medium text-white">Live AI Decisions</h3>
        </div>
        {isMockMode && <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/30 font-bold uppercase tracking-widest">Mock Mode</span>}
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-sm italic h-full flex items-center justify-center">
            Waiting for AI decision loop...
          </div>
        ) : (
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div 
                key={log.timestamp || i}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <p className="text-gray-200 font-medium mb-2">{log.action}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{log.reasoning}</p>
                <div className="mt-3 flex items-center gap-4 text-xs font-mono">
                  {log.predicted_kwh && <span className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Pred: {log.predicted_kwh} kWh</span>}
                  <span className="text-green-400 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> {log.status || "Success"}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
