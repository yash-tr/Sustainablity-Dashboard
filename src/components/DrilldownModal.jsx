// src/components/DrilldownModal.jsx
import React from "react";

export default function DrilldownModal({ open, onClose, title, rows = [] }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-11/12 md:w-3/4 rounded shadow-lg p-4 max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="px-2 py-1 border rounded" onClick={onClose}>
            Close
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="text-left text-gray-600">
            <tr>
              <th className="pr-2">Date</th>
              <th className="pr-2">Dept</th>
              <th className="pr-2">Unit</th>
              <th className="pr-2">Machine</th>
              <th className="pr-2">Shift</th>
              <th className="pr-2">Energy</th>
              <th className="pr-2">Water</th>
              <th className="pr-2">Waste</th>
              <th className="pr-2">Emissions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                <td>{r.date}</td>
                <td>{r.department}</td>
                <td>{r.unit}</td>
                <td>{r.machine}</td>
                <td>{r.shift}</td>
                <td>{Number(r.energy).toFixed(1)}</td>
                <td>{Number(r.water).toFixed(1)}</td>
                <td>{Number(r.waste).toFixed(1)}</td>
                <td>{Number(r.emissions).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
