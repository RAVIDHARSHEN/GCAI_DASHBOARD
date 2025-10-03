import React from "react";

export default function BottomSection({ summary, pathways, awareness }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-gray-800 rounded-lg p-4 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-2">Situation Summary</h3>
        <p className="text-gray-200 leading-relaxed">{summary}</p>
        <div className="mt-3">
          <h4 className="font-medium mb-1">Proposed Pathways</h4>
          <ul className="list-disc pl-5 text-gray-200 space-y-1">
            {pathways.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Citizen Awareness</h3>
        <Metric label="Awareness Index" value={awareness.awarenessIndex} />
        <Metric label="Support Index" value={awareness.supportIndex} />
        <Metric label="Participation Rate" value={awareness.participationRate} suffix="%" />
      </div>
    </div>
  );
}

function Metric({ label, value, suffix = "" }) {
  return (
    <div className="mb-3">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-32 bg-gray-700 rounded">
          <div className="h-2 bg-blue-500 rounded" style={{ width: `${value}%` }} />
        </div>
        <span className="text-sm">{value}{suffix}</span>
      </div>
    </div>
  );
}


