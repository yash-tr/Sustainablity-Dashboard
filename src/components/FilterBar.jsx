import React from "react";

export default function FilterBar({ filters, setFilters, options }) {
  const onChange = (key) => (e) => {
    const value = e.target.value || null;
    setFilters((f) => ({ ...f, [key]: value }));
  };

  return (
    <div className="flex flex-wrap gap-3 items-end mb-4">
      <div>
        <label className="block text-sm text-gray-600">From</label>
        <input
          type="date"
          value={filters.from || ""}
          onChange={onChange("from")}
          className="border rounded px-2 py-1"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600">To</label>
        <input
          type="date"
          value={filters.to || ""}
          onChange={onChange("to")}
          className="border rounded px-2 py-1"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Department</label>
        <select
          value={filters.department || ""}
          onChange={onChange("department")}
          className="border rounded px-2 py-1"
        >
          <option value="">All</option>
          {options.departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-600">Unit</label>
        <select
          value={filters.unit || ""}
          onChange={onChange("unit")}
          className="border rounded px-2 py-1"
        >
          <option value="">All</option>
          {options.units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-600">Machine</label>
        <select
          value={filters.machine || ""}
          onChange={onChange("machine")}
          className="border rounded px-2 py-1"
        >
          <option value="">All</option>
          {options.machines.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-600">Shift</label>
        <select
          value={filters.shift || ""}
          onChange={onChange("shift")}
          className="border rounded px-2 py-1"
        >
          <option value="">All</option>
          {options.shifts.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <button
        className="bg-gray-200 px-3 py-1 rounded ml-2"
        onClick={() =>
          setFilters({
            from: null,
            to: null,
            department: null,
            unit: null,
            machine: null,
            shift: null,
          })
        }
      >
        Reset
      </button>
    </div>
  );
}
