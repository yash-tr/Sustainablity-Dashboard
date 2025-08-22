import React, { useState } from "react";

export default function NotificationBell({ alerts = [] }) {
  const [open, setOpen] = useState(false);
  const unread = alerts.length;
  const grouped = alerts.reduce((acc, a) => {
    acc[a.metric] = acc[a.metric] || [];
    acc[a.metric].push(a);
    return acc;
  }, {});

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative"
      >
        <svg
          className="w-6 h-6"
          /*bell icon*/ xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-2 text-xs bg-red-600 text-white rounded-full px-1">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow rounded p-2 z-50">
          <div className="text-sm font-semibold mb-2">Notifications</div>
          {Object.keys(grouped).length === 0 ? (
            <div className="text-sm text-green-600">All clear</div>
          ) : (
            Object.entries(grouped).map(([k, arr]) => (
              <div key={k} className="mb-2">
                <div className="text-xs font-medium text-gray-600">
                  {k.toUpperCase()} ({arr.length})
                </div>
                <ul className="text-sm">
                  {arr.slice(0, 5).map((a, i) => (
                    <li key={i} className="py-1">
                      {a.date} • {a.department} • {a.value}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
