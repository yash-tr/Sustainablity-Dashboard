// src/components/GoalsCard.jsx
import React from "react";

export default function GoalsCard({ totals, goals }) {
  const pct = (val, goal) =>
    Math.min(100, goal ? Math.round((val / goal) * 100) : 0);
  return (
    <div className="bg-white p-4 rounded shadow grid grid-cols-1 gap-3">
      <h4 className="font-semibold">Goals Progress</h4>

      <div>
        <div className="flex justify-between">
          <div className="text-sm">Energy</div>
          <div className="text-sm font-medium">
            {pct(Number(totals.energy || 0), goals.energy)}%
          </div>
        </div>
        <div className="bg-gray-200 h-3 rounded">
          <div
            className="bg-blue-600 h-3 rounded"
            style={{
              width: `${pct(Number(totals.energy || 0), goals.energy)}%`,
            }}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between">
          <div className="text-sm">Water</div>
          <div className="text-sm font-medium">
            {pct(Number(totals.water || 0), goals.water)}%
          </div>
        </div>
        <div className="bg-gray-200 h-3 rounded">
          <div
            className="bg-teal-600 h-3 rounded"
            style={{ width: `${pct(Number(totals.water || 0), goals.water)}%` }}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between">
          <div className="text-sm">Waste</div>
          <div className="text-sm font-medium">
            {pct(Number(totals.waste || 0), goals.waste)}%
          </div>
        </div>
        <div className="bg-gray-200 h-3 rounded">
          <div
            className="bg-red-600 h-3 rounded"
            style={{ width: `${pct(Number(totals.waste || 0), goals.waste)}%` }}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between">
          <div className="text-sm">Emissions</div>
          <div className="text-sm font-medium">
            {pct(Number(totals.emissions || 0), goals.emissions)}%
          </div>
        </div>
        <div className="bg-gray-200 h-3 rounded">
          <div
            className="bg-green-600 h-3 rounded"
            style={{
              width: `${pct(Number(totals.emissions || 0), goals.emissions)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
