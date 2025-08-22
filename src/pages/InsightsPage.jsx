import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { aggregateByDate } from "../utils/aggregate"; // or copy helper

export default function InsightsPage({ data, filteredData, totals }) {
  const { metric } = useParams(); // e.g. "energy", "water", "overall"
  const nav = useNavigate();
  const src = filteredData.length ? filteredData : data;

  // aggregated series for selected metric or multi-metric if overall
  const series = useMemo(() => {
    if (metric === "overall") {
      // build merged series: {date, energy, water,...}
      const map = new Map();
      src.forEach((r) => {
        if (!map.has(r.date))
          map.set(r.date, {
            date: r.date,
            energy: 0,
            water: 0,
            waste: 0,
            emissions: 0,
          });
        const o = map.get(r.date);
        o.energy += Number(r.energy || 0);
        o.water += Number(r.water || 0);
        o.waste += Number(r.waste || 0);
        o.emissions += Number(r.emissions || 0);
      });
      return Array.from(map.values()).sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      );
    } else {
      return aggregateByDate(src, metric);
    }
  }, [metric, src]);

  // simple hotspot: top departments by metric
  const hotspots = useMemo(() => {
    const agg = {};
    src.forEach((r) => {
      agg[r.department] = (agg[r.department] || 0) + Number(r[metric] || 0);
    });
    return Object.entries(agg)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [src, metric]);

  return (
    <div className="p-6">
      <button className="mb-4 px-2 py-1 border rounded" onClick={() => nav(-1)}>
        ← Back
      </button>
      <h1 className="text-2xl font-bold mb-3">
        Insights — {metric?.toUpperCase()}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Trend</h3>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              {/* If overall: show multi lines; else single */}
              {metric === "overall" ? (
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="energy" stroke="#3b82f6" />
                  <Line dataKey="water" stroke="#10b981" />
                  <Line dataKey="waste" stroke="#ef4444" />
                  <Line dataKey="emissions" stroke="#f59e0b" />
                </LineChart>
              ) : (
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey={metric} stroke="#3b82f6" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Hotspots</h3>
          <BarChart
            width={300}
            height={200}
            data={hotspots.map(([k, v]) => ({ name: k, value: v }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#ef4444" />
          </BarChart>
        </div>
      </div>

      <div className="mt-4 bg-white p-4 rounded shadow">
        <h4 className="font-semibold">Insights</h4>
        <ul className="list-disc pl-5">
          <li>Current total: {totals[metric] ?? "N/A"}</li>
          <li>Top hotspot departments shown to the right.</li>
          <li>
            Anomalies are flagged where values exceed threshold (you can refine
            thresholds).
          </li>
        </ul>
      </div>
    </div>
  );
}
