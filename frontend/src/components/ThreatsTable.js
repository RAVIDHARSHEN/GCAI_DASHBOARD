import React from "react";

export default function ThreatsTable({ items, onItemClick, page, setPage, hasMore }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Threats</h3>
        <span className="text-sm text-gray-400">{items.length} results</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-300">
              <th className="p-2">Threat Type</th>
              <th className="p-2">Location</th>
              <th className="p-2">Emergency</th>
              <th className="p-2">Maturity</th>
              <th className="p-2">Severity</th>
              <th className="p-2">Sources</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr
                key={t.id}
                className="border-t border-gray-700 hover:bg-gray-700 cursor-pointer"
                onClick={() => onItemClick && onItemClick(t)}
              >
                <td className="p-2 align-top">{t.threatType}</td>
                <td className="p-2 align-top text-sm">
                  {t.locationScope}: {t.locationName}
                </td>
                <td className="p-2 align-top text-sm">{t.emergency}</td>
                <td className="p-2 align-top text-sm">{t.maturity}</td>
                <td className="p-2 align-top">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-gray-700 rounded">
                      <div className="h-2 bg-red-500 rounded" style={{ width: `${t.severity}%` }} />
                    </div>
                    <span className="text-sm text-gray-300">{t.severity}</span>
                  </div>
                </td>
                <td className="p-2 align-top text-sm">{t.sources.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-3">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
        >
          ⬅ Prev
        </button>
        <button
          disabled={!hasMore}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
        >
          Next ➡
        </button>
      </div>
    </div>
  );
}
