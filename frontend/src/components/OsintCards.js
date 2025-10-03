import React from "react";

export default function OsintCards({ items }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">OSINT Snippets</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((o) => (
          <div key={o.id} className="bg-gray-700 rounded p-3">
            <div className="text-sm text-gray-400 mb-1">{o.time} · {o.source}</div>
            <div className="font-medium">{o.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


