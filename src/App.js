// src/App.js
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import mockData from "./data/mockData";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Bar,
} from "recharts";

// (Assumes you created these small components in your project)
import OverallTile from "./components/OverallTile";
import NotificationBell from "./components/NotificationBell";
import GoalsCard from "./components/GoalsCard";
import AlertsPanel from "./components/AlertsPanel";
import FilterBar from "./components/FilterBar";

/* DrilldownModal (paginated) */
function DrilldownModal({ open, onClose, title, rows = [] }) {
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    if (open) setPage(1);
  }, [open, title]);

  if (!open) return null;
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded shadow-lg p-4 max-h-[85vh] overflow-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">
            {title} ({total})
          </h3>
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 border rounded"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="text-sm">
              {page}/{pages}
            </span>
            <button
              className="px-2 py-1 border rounded"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
            >
              Next
            </button>
            <button className="ml-3 px-3 py-1 border rounded" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="text-left text-gray-600 sticky top-0 bg-white/95">
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
            {pageRows.map((r, i) => (
              <tr
                key={(page - 1) * pageSize + i}
                className={i % 2 === 0 ? "bg-gray-50" : ""}
              >
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

        <div className="mt-3 flex justify-end gap-2">
          <button
            className="px-3 py-1 border rounded"
            onClick={() => exportCSV(pageRows, `drilldown-page-${page}.csv`)}
          >
            Export Page CSV
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------- Helpers --------------- */

function aggregateByDate(data, key = "energy") {
  const map = new Map();
  data.forEach((d) => {
    const day = d.date;
    const prev = map.get(day) || 0;
    map.set(day, prev + (Number(d[key]) || 0));
  });
  return Array.from(map.entries())
    .map(([date, value]) => ({ date, [key]: Number(value.toFixed(1)) }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function exportCSV(rows, filename = "export.csv") {
  if (!rows || rows.length === 0) {
    alert("No data to export");
    return;
  }
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(","),
    ...rows.map((r) => keys.map((k) => `"${String(r[k] ?? "")}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportExcel(rows, filename = "export.xlsx") {
  if (!rows || rows.length === 0) {
    alert("No data to export");
    return;
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), filename);
}

async function exportPdf(
  elementSelector = ".dashboard-root",
  fileName = "dashboard.pdf",
) {
  const node = document.querySelector(elementSelector);
  if (!node) {
    alert("No dashboard area found");
    return;
  }
  try {
    const dataUrl = await htmlToImage.toPng(node, {
      quality: 1,
      pixelRatio: 2,
    });
    const pdf = new jsPDF("p", "pt", "a4");
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 40;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(dataUrl, "PNG", 20, 20, pdfWidth, pdfHeight);
    pdf.save(fileName);
  } catch (err) {
    console.error(err);
    alert("Failed to export PDF");
  }
}

/* --------------- Main App --------------- */

function App() {
  // useNavigate from react-router
  const navigate = useNavigate();

  // filters persisted
  const [filters, setFilters] = useState(() => {
    try {
      const s = localStorage.getItem("sd_filters");
      return s
        ? JSON.parse(s)
        : {
            from: null,
            to: null,
            department: null,
            unit: null,
            machine: null,
            shift: null,
          };
    } catch {
      return {
        from: null,
        to: null,
        department: null,
        unit: null,
        machine: null,
        shift: null,
      };
    }
  });

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [detail, setDetail] = useState(null);
  const [acknowledged, setAcknowledged] = useState([]);
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sd_tasks") || "[]");
    } catch {
      return [];
    }
  });
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sd_notes") || "{}");
    } catch {
      return {};
    }
  });
  const [events, setEvents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sd_events") || "[]");
    } catch {
      return [];
    }
  });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [audit, setAudit] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sd_audit") || "[]");
    } catch {
      return [];
    }
  });

  const [chartType, setChartType] = useState("line");

  // load data from API (fallback to mockData)
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/sustainability");
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const json = await res.json();
        setData(json);
        logAction("data loaded from API");
      } catch (err) {
        console.error("API fetch failed, falling back to mockData:", err);
        setData(mockData);
        logAction("data loaded from local mockData (fallback)");
      }
    }
    load();
  }, []);

  // persist snapshots
  useEffect(() => {
    try {
      localStorage.setItem("sd_data", JSON.stringify(data));
      localStorage.setItem("sd_filtered", JSON.stringify(filteredData));
    } catch {}
  }, [data, filteredData]);

  useEffect(() => {
    try {
      localStorage.setItem("sd_filters", JSON.stringify(filters));
      logAction(`filters updated`);
    } catch {}
  }, [filters]);

  useEffect(
    () => localStorage.setItem("sd_tasks", JSON.stringify(tasks)),
    [tasks],
  );
  useEffect(
    () => localStorage.setItem("sd_notes", JSON.stringify(notes)),
    [notes],
  );
  useEffect(
    () => localStorage.setItem("sd_events", JSON.stringify(events)),
    [events],
  );
  useEffect(
    () => localStorage.setItem("sd_audit", JSON.stringify(audit)),
    [audit],
  );

  const options = useMemo(() => {
    const src = data.length ? data : mockData;
    return {
      departments: Array.from(new Set(src.map((d) => d.department))).sort(),
      units: Array.from(new Set(src.map((d) => d.unit))).sort(),
      machines: Array.from(new Set(src.map((d) => d.machine))).sort(),
      shifts: Array.from(new Set(src.map((d) => d.shift))).sort(),
    };
  }, [data]);

  useEffect(() => {
    const src = data.length ? data : mockData;
    const fd = src.filter((rec) => {
      if (filters.from && new Date(rec.date) < new Date(filters.from))
        return false;
      if (filters.to && new Date(rec.date) > new Date(filters.to)) return false;
      if (filters.department && rec.department !== filters.department)
        return false;
      if (filters.unit && rec.unit !== filters.unit) return false;
      if (filters.machine && rec.machine !== filters.machine) return false;
      if (filters.shift && String(rec.shift) !== String(filters.shift))
        return false;
      return true;
    });
    setFilteredData(fd);
  }, [filters, data]);

  const totals = useMemo(() => {
    const t = (filteredData || []).reduce(
      (acc, r) => {
        acc.energy += Number(r.energy || 0);
        acc.water += Number(r.water || 0);
        acc.waste += Number(r.waste || 0);
        acc.emissions += Number(r.emissions || 0);
        return acc;
      },
      { energy: 0, water: 0, waste: 0, emissions: 0 },
    );
    return {
      energy: t.energy.toFixed(1),
      water: t.water.toFixed(1),
      waste: t.waste.toFixed(1),
      emissions: t.emissions.toFixed(1),
    };
  }, [filteredData]);

  const energySeries = useMemo(
    () => aggregateByDate(filteredData.length ? filteredData : data, "energy"),
    [filteredData, data],
  );
  const waterSeries = useMemo(
    () => aggregateByDate(filteredData.length ? filteredData : data, "water"),
    [filteredData, data],
  );
  const wasteSeries = useMemo(
    () => aggregateByDate(filteredData.length ? filteredData : data, "waste"),
    [filteredData, data],
  );
  const emissionsSeries = useMemo(
    () =>
      aggregateByDate(filteredData.length ? filteredData : data, "emissions"),
    [filteredData, data],
  );

  const alerts = useMemo(() => {
    const list = [];
    const source = filteredData.length ? filteredData : data;
    source.forEach((r) => {
      if (r.energy > 180)
        list.push({
          date: r.date,
          department: r.department,
          machine: r.machine,
          metric: "energy",
          value: r.energy,
          message: "High energy usage",
        });
      if (r.emissions > 120)
        list.push({
          date: r.date,
          department: r.department,
          machine: r.machine,
          metric: "emissions",
          value: r.emissions,
          message: "High emissions",
        });
    });
    return list.sort((a, b) => b.value - a.value).slice(0, 30);
  }, [filteredData, data]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const id = setInterval(() => {
      if (!options.departments.length) return;
      const newRec = {
        date: new Date().toISOString().slice(0, 10),
        shift:
          options.shifts[Math.floor(Math.random() * options.shifts.length)] ||
          1,
        department:
          options.departments[
            Math.floor(Math.random() * options.departments.length)
          ] || "Unit",
        unit:
          options.units[Math.floor(Math.random() * options.units.length)] ||
          "Unit A",
        machine:
          options.machines[
            Math.floor(Math.random() * options.machines.length)
          ] || "Machine 1",
        energy: Math.round(Math.random() * 150 + 20),
        water: Math.round(Math.random() * 400 + 50),
        waste: Math.round(Math.random() * 60 + 5),
        emissions: Math.round(Math.random() * 120 + 10),
      };
      setData((prev) => [newRec, ...prev]);
      logAction("auto-refresh new record appended");
    }, 10000);
    return () => clearInterval(id);
  }, [autoRefresh, options]);

  function createTaskFromAlert(alert) {
    const task = {
      id: Date.now(),
      title: `${alert.metric} spike`,
      details: alert,
      status: "Open",
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
    logAction(`task created from alert: ${alert.metric} on ${alert.date}`);
  }

  // ---- ADDED: small wrapper to avoid undefined reference in AlertsPanel props ----
  function handleCreateTaskFromAlert(alert) {
    createTaskFromAlert(alert);
  }
  // ---------------------------------------------------------------------------

  function handleAcknowledge(alert) {
    setAcknowledged((prev) => {
      const next = [
        ...prev,
        `${alert.metric}|${alert.date}|${alert.machine}|${alert.department}|${alert.value}`,
      ];
      logAction(`acknowledged alert ${alert.metric} ${alert.date}`);
      return next;
    });
  }

  function addNote(key, text) {
    setNotes((n) => {
      const next = {
        ...n,
        [key]: [
          ...(n[key] || []),
          { id: Date.now(), text, ts: new Date().toISOString() },
        ],
      };
      logAction(`note added for ${key}`);
      return next;
    });
  }

  function addEvent(date, label) {
    const ev = { id: Date.now(), date, label };
    setEvents((prev) => [ev, ...prev]);
    logAction(`event added ${label} @ ${date}`);
  }

  function logAction(action) {
    const entry = { ts: new Date().toISOString(), action };
    setAudit((prev) => {
      const next = [entry, ...prev].slice(0, 200);
      return next;
    });
  }

  function openDrilldownForDate(date) {
    const rows = (filteredData.length ? filteredData : data).filter(
      (r) => r.date === date,
    );
    setDetail({ title: `Details for ${date}`, rows });
    logAction(`drilldown opened for ${date}`);
  }

  async function manualRefresh() {
    try {
      const res = await fetch("/api/sustainability");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        logAction("manual refresh");
        alert("Refreshed from API");
      } else {
        throw new Error("API error");
      }
    } catch (err) {
      console.warn("Manual refresh failed, falling back to local:", err);
      setData(mockData);
      alert("Failed to refresh from API. Using local mockData.");
    }
  }

  const GOALS = {
    energy: 50000,
    water: 200000,
    waste: 20000,
    emissions: 40000,
  };

  if (!data || (data.length === 0 && (!mockData || mockData.length === 0))) {
    return <p className="p-6 text-red-600">⚠️ No data found!</p>;
  }

  const currentRows = filteredData.length ? filteredData : data;

  return (
    <div className="min-h-screen bg-gray-100 p-6 dashboard-root">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🌱 Sustainability Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Records loaded: {currentRows.length}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell alerts={alerts} />
            <button
              className={`px-3 py-1 rounded ${autoRefresh ? "bg-red-500 text-white" : "bg-gray-200"}`}
              onClick={() => {
                setAutoRefresh((v) => !v);
                logAction(
                  autoRefresh ? "auto-refresh stopped" : "auto-refresh started",
                );
              }}
            >
              {autoRefresh ? "Stop Auto-refresh" : "Start Auto-refresh"}
            </button>

            <button
              className="px-3 py-1 border rounded"
              onClick={manualRefresh}
            >
              Refresh
            </button>

            <button
              className="bg-blue-600 text-white px-3 py-1 rounded"
              onClick={() => {
                exportCSV(currentRows, "sustainability_export.csv");
                logAction("export csv");
              }}
            >
              Export CSV
            </button>

            <button
              className="px-3 py-1 border rounded"
              onClick={() => {
                exportExcel(currentRows, "sustainability_export.xlsx");
                logAction("export xlsx");
              }}
            >
              Export Excel
            </button>

            <button
              className="bg-gray-700 text-white px-3 py-1 rounded"
              onClick={() => {
                exportPdf();
                logAction("export pdf");
              }}
            >
              Export PDF
            </button>
          </div>
        </div>
      </header>

      <FilterBar filters={filters} setFilters={setFilters} options={options} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            {/* use react-router navigate to go to insights route */}
            <OverallTile
              totals={totals}
              onClick={() => navigate("/insights/overall")}
            />
          </div>

          <div className="bg-white p-4 rounded shadow text-center">
            <h2 className="text-gray-500">Energy</h2>
            <p className="text-2xl font-bold text-blue-600">
              {totals.energy} kWh
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow text-center">
            <h2 className="text-gray-500">Water</h2>
            <p className="text-2xl font-bold text-teal-600">{totals.water} L</p>
          </div>

          <div className="bg-white p-4 rounded shadow text-center">
            <h2 className="text-gray-500">Waste</h2>
            <p className="text-2xl font-bold text-red-600">{totals.waste} kg</p>
          </div>

          <div className="bg-white p-4 rounded shadow text-center">
            <h2 className="text-gray-500">Emissions</h2>
            <p className="text-2xl font-bold text-green-600">
              {totals.emissions} CO₂
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <GoalsCard totals={totals} goals={GOALS} />
          <AlertsPanel
            alerts={alerts.filter(
              (a) =>
                !acknowledged.includes(
                  `${a.metric}|${a.date}|${a.machine}|${a.department}|${a.value}`,
                ),
            )}
            onAcknowledge={handleAcknowledge}
            onCreateTask={handleCreateTaskFromAlert}
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <h4 className="font-semibold mb-2">Events (markers on charts)</h4>

            <div className="flex gap-2 items-center mb-2">
              <input
                id="eventDate"
                type="date"
                className="border px-2 py-1 rounded"
              />
              <input
                id="eventLabel"
                type="text"
                placeholder="Event label"
                className="border px-2 py-1 rounded"
              />
              <button
                className="px-3 py-1 bg-indigo-600 text-white rounded"
                onClick={() => {
                  const dateEl = document.getElementById("eventDate");
                  const labelEl = document.getElementById("eventLabel");
                  if (!dateEl || !labelEl) return;
                  if (!dateEl.value || !labelEl.value) {
                    alert("Select date and add label");
                    return;
                  }
                  addEvent(dateEl.value, labelEl.value);
                  dateEl.value = "";
                  labelEl.value = "";
                }}
              >
                Add Event
              </button>
            </div>

            <div className="text-sm text-gray-700">
              {events.length === 0 ? (
                <div className="text-gray-500">No events</div>
              ) : (
                <ul className="space-y-1">
                  {events.map((ev) => (
                    <li
                      key={ev.id}
                      className="flex justify-between items-center"
                    >
                      <div>
                        {ev.date} — {ev.label}
                      </div>
                      <button
                        className="text-xs px-2 py-1 border rounded"
                        onClick={() => {
                          setEvents((prev) =>
                            prev.filter((p) => p.id !== ev.id),
                          );
                          logAction(`event removed ${ev.label}@${ev.date}`);
                        }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="w-80">
            <h4 className="font-semibold mb-2">Quick Notes</h4>
            <div className="mb-2">
              <input
                id="noteKey"
                placeholder="key e.g. 2025-09-01 or energy"
                className="border px-2 py-1 rounded w-full mb-1"
              />
              <textarea
                id="noteText"
                placeholder="Add note..."
                className="border px-2 py-1 rounded w-full mb-1"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded"
                  onClick={() => {
                    const k = document.getElementById("noteKey")?.value;
                    const t = document.getElementById("noteText")?.value;
                    if (!k || !t) {
                      alert("Provide key and text");
                      return;
                    }
                    addNote(k, t);
                    document.getElementById("noteKey").value = "";
                    document.getElementById("noteText").value = "";
                  }}
                >
                  Add Note
                </button>
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => {
                    navigator.clipboard?.writeText(JSON.stringify(notes));
                    alert("Notes copied to clipboard");
                  }}
                >
                  Export Notes
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-700 max-h-36 overflow-auto">
              {Object.keys(notes).length === 0 ? (
                <div className="text-gray-500">No notes</div>
              ) : (
                Object.entries(notes).map(([k, arr]) => (
                  <div key={k} className="mb-2">
                    <div className="text-xs text-gray-500">{k}</div>
                    <ul className="text-sm">
                      {arr.map((n) => (
                        <li key={n.id} className="bg-gray-50 p-1 rounded mb-1">
                          {n.text}{" "}
                          <span className="text-xs text-gray-400">
                            {" "}
                            — {new Date(n.ts).toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm text-gray-600">Chart type:</label>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="line">Line</option>
          <option value="bar">Bar</option>
        </select>
      </div>

      <div className="space-y-6">
        {/* Energy */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="mb-4 font-semibold">Energy Over Time</h2>
          {energySeries.length === 0 ? (
            <p className="text-sm text-gray-500">
              No data for selected filters.
            </p>
          ) : (
            <div style={{ width: "100%", height: 340 }}>
              <ResponsiveContainer>
                {chartType === "line" ? (
                  <LineChart data={energySeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    {events.map((ev) => (
                      <ReferenceLine
                        key={ev.id}
                        x={ev.date}
                        stroke="red"
                        label={ev.label}
                      />
                    ))}
                    <Line
                      type="monotone"
                      dataKey="energy"
                      stroke="#3b82f6"
                      dot={{ r: 3 }}
                      onClick={(e) => {
                        if (!e?.payload) return;
                        openDrilldownForDate(e.payload.date);
                      }}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={energySeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    {events.map((ev) => (
                      <ReferenceLine
                        key={ev.id}
                        x={ev.date}
                        stroke="red"
                        label={ev.label}
                      />
                    ))}
                    <Bar
                      dataKey="energy"
                      fill="#3b82f6"
                      onClick={(e) =>
                        e?.payload && openDrilldownForDate(e.payload.date)
                      }
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Water */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="mb-4 font-semibold">Water Over Time</h2>
          {waterSeries.length === 0 ? (
            <p className="text-sm text-gray-500">
              No data for selected filters.
            </p>
          ) : (
            <div style={{ width: "100%", height: 340 }}>
              <ResponsiveContainer>
                {chartType === "line" ? (
                  <LineChart data={waterSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    {events.map((ev) => (
                      <ReferenceLine
                        key={ev.id}
                        x={ev.date}
                        stroke="red"
                        label={ev.label}
                      />
                    ))}
                    <Line
                      type="monotone"
                      dataKey="water"
                      stroke="#10b981"
                      dot={{ r: 3 }}
                      onClick={(e) =>
                        e?.payload && openDrilldownForDate(e.payload.date)
                      }
                    />
                  </LineChart>
                ) : (
                  <BarChart data={waterSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    {events.map((ev) => (
                      <ReferenceLine
                        key={ev.id}
                        x={ev.date}
                        stroke="red"
                        label={ev.label}
                      />
                    ))}
                    <Bar
                      dataKey="water"
                      fill="#10b981"
                      onClick={(e) =>
                        e?.payload && openDrilldownForDate(e.payload.date)
                      }
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Waste */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="mb-4 font-semibold">Waste Over Time</h2>
          {wasteSeries.length === 0 ? (
            <p className="text-sm text-gray-500">
              No data for selected filters.
            </p>
          ) : (
            <div style={{ width: "100%", height: 340 }}>
              <ResponsiveContainer>
                {chartType === "line" ? (
                  <LineChart data={wasteSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    {events.map((ev) => (
                      <ReferenceLine
                        key={ev.id}
                        x={ev.date}
                        stroke="red"
                        label={ev.label}
                      />
                    ))}
                    <Line
                      type="monotone"
                      dataKey="waste"
                      stroke="#ef4444"
                      dot={{ r: 3 }}
                      onClick={(e) =>
                        e?.payload && openDrilldownForDate(e.payload.date)
                      }
                    />
                  </LineChart>
                ) : (
                  <BarChart data={wasteSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    {events.map((ev) => (
                      <ReferenceLine
                        key={ev.id}
                        x={ev.date}
                        stroke="red"
                        label={ev.label}
                      />
                    ))}
                    <Bar
                      dataKey="waste"
                      fill="#ef4444"
                      onClick={(e) =>
                        e?.payload && openDrilldownForDate(e.payload.date)
                      }
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Emissions */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="mb-4 font-semibold">Emissions Over Time</h2>
          {emissionsSeries.length === 0 ? (
            <p className="text-sm text-gray-500">
              No data for selected filters.
            </p>
          ) : (
            <div style={{ width: "100%", height: 340 }}>
              <ResponsiveContainer>
                {chartType === "line" ? (
                  <LineChart data={emissionsSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    {events.map((ev) => (
                      <ReferenceLine
                        key={ev.id}
                        x={ev.date}
                        stroke="red"
                        label={ev.label}
                      />
                    ))}
                    <Line
                      type="monotone"
                      dataKey="emissions"
                      stroke="#f59e0b"
                      dot={{ r: 3 }}
                      onClick={(e) =>
                        e?.payload && openDrilldownForDate(e.payload.date)
                      }
                    />
                  </LineChart>
                ) : (
                  <BarChart data={emissionsSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    {events.map((ev) => (
                      <ReferenceLine
                        key={ev.id}
                        x={ev.date}
                        stroke="red"
                        label={ev.label}
                      />
                    ))}
                    <Bar
                      dataKey="emissions"
                      fill="#f59e0b"
                      onClick={(e) =>
                        e?.payload && openDrilldownForDate(e.payload.date)
                      }
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <DrilldownModal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.title}
        rows={detail?.rows || []}
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Tasks ({tasks.length})</h4>
          {tasks.length === 0 ? (
            <div className="text-sm text-gray-500">No tasks</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {tasks.map((t) => (
                <li key={t.id} className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-gray-500">{t.createdAt}</div>
                    <div className="text-sm text-gray-700">
                      {t.details?.message}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      className="text-xs px-2 py-1 border rounded"
                      onClick={() => {
                        setTasks((prev) =>
                          prev.map((p) =>
                            p.id === t.id
                              ? {
                                  ...p,
                                  status: p.status === "Open" ? "Done" : "Open",
                                }
                              : p,
                          ),
                        );
                        logAction(`task toggled ${t.id}`);
                      }}
                    >
                      {t.status === "Open" ? "Mark Done" : "Reopen"}
                    </button>
                    <button
                      className="text-xs px-2 py-1 border rounded"
                      onClick={() => {
                        setTasks((prev) => prev.filter((p) => p.id !== t.id));
                        logAction(`task removed ${t.id}`);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Audit Log</h4>
          <div className="text-xs text-gray-500 mb-2">
            Recent actions (persisted)
          </div>
          <div className="max-h-44 overflow-auto text-sm">
            {audit.length === 0 ? (
              <div className="text-gray-500">No activity yet</div>
            ) : (
              <ul className="space-y-1">
                {audit.map((a, i) => (
                  <li key={i} className="text-xs">
                    {new Date(a.ts).toLocaleString()} — {a.action}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
