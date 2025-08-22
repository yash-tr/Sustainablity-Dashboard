// src/Insights.js
import React from "react";
import { Link } from "react-router-dom";

export default function Insights() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">📊 Insights</h1>
        <p className="text-sm text-gray-600 mt-1">
          Quick insights page — add charts or reports here.
        </p>
      </header>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Example insight</h2>
        <p className="text-sm text-gray-700">
          Add charts / tables / comparisons for deeper insights.
        </p>
        <div className="mt-4">
          <Link to="/" className="px-3 py-1 border rounded">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
