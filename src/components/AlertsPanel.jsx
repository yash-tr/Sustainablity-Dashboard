// src/components/AlertsPanel.jsx
import React from "react";

export default function AlertsPanel({ alerts = [], onAcknowledge }) {
  return (
    <div className="bg-white p-3 rounded shadow max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold">Alerts ({alerts.length})</h4>
      </div>
      {alerts.length === 0 ? (
        <p className="text-sm text-green-600">All clear</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {alerts.map((a, i) => (
            <li key={i} className="flex justify-between items-start">
              <div>
                <div className="text-xs text-gray-500">
                  {a.date} • {a.department} • {a.machine}
                </div>
                <div className="text-red-600 font-medium">
                  {a.metric.toUpperCase()} — {a.value}
                </div>
                <div className="text-gray-600">{a.message}</div>
              </div>
              <div className="ml-3">
                <button
                  className="text-xs px-2 py-1 border rounded"
                  onClick={() => onAcknowledge(a)}
                >
                  Acknowledge
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
