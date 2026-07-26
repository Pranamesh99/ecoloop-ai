"use client";
import { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, FileJson, FileText, TableProperties } from "lucide-react";

export default function ExportHub() {
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/v1/telemetry/history");
    return await res.json();
  };

  const exportJSON = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ecoloop-telemetry.json";
      a.click();
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory();
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Telemetry");
      XLSX.writeFile(wb, "ecoloop-telemetry.xlsx");
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory();
      const doc = new jsPDF();
      doc.text("EcoLoop AI - Telemetry Export", 14, 15);
      
      const tableData = data.slice(-50).map((row: any) => [
        new Date(row.timestamp).toLocaleTimeString(),
        row.zone_temp_c,
        row.zone_co2_ppm,
        row.chiller_load_kw,
        row.hvac_mode
      ]);

      autoTable(doc, {
        head: [['Time', 'Temp (C)', 'CO2 (ppm)', 'Chiller (kW)', 'Mode']],
        body: tableData,
        startY: 20,
      });

      doc.save("ecoloop-telemetry.pdf");
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-xl p-5 border border-white/10 flex flex-col gap-4">
      <div className="flex items-center gap-2 text-gray-400">
        <Download size={18} className="text-purple-400" />
        <h3 className="text-xs uppercase tracking-widest font-bold">Data Logs & Export Hub</h3>
      </div>
      <div className="flex flex-col gap-3">
        <button onClick={exportJSON} disabled={loading} className="flex justify-center items-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/10 transition-colors text-sm font-semibold text-gray-200 disabled:opacity-50">
          <FileJson size={18} className="text-blue-400" /> Export JSON (Full)
        </button>
        <button onClick={exportExcel} disabled={loading} className="flex justify-center items-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/10 transition-colors text-sm font-semibold text-gray-200 disabled:opacity-50">
          <TableProperties size={18} className="text-emerald-400" /> Export Excel (.xlsx)
        </button>
        <button onClick={exportPDF} disabled={loading} className="flex justify-center items-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/10 transition-colors text-sm font-semibold text-gray-200 disabled:opacity-50">
          <FileText size={18} className="text-rose-400" /> Export PDF (Last 50)
        </button>
      </div>
    </div>
  );
}
