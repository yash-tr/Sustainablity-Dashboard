import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

export default function OverallTile({ totals, onClick }) {
  // prepare simplified radar data
  const data = [
    { metric: "Energy", value: Number(totals.energy) || 0 },
    { metric: "Water", value: Number(totals.water) || 0 },
    { metric: "Waste", value: Number(totals.waste) || 0 },
    { metric: "Emissions", value: Number(totals.emissions) || 0 },
  ];

  // simple status phrase
  const avgPerc = Math.round(
    data.reduce((s, d) => s + d.value, 0) / data.length || 0,
  );
  const status = avgPerc > 10000 ? "Attention needed" : "Stable"; // tweak logic to your domain

  return (
    <div
      className="bg-white p-4 rounded shadow text-center cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-gray-600">Overall</h3>
        <div
          className={`text-sm ${status === "Stable" ? "text-green-600" : "text-red-600"}`}
        >
          {status}
        </div>
      </div>

      <div style={{ width: 160, height: 120, margin: "0 auto" }}>
        <RadarChart
          cx={80}
          cy={60}
          outerRadius={60}
          width={160}
          height={120}
          data={data}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis />
          <Radar
            name="Overall"
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Click for overall insights
      </div>
    </div>
  );
}
