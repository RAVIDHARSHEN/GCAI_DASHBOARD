import React, { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#facc15"];

export default function ChartsPanel({ items }) {
  // 🔑 Line chart: average severity by date (falls back to item labels when no dates available)
  const lineData = useMemo(() => {
    // try to build by real dates first (support common field names)
    const byDate = {};
    items.forEach((t) => {
      const maybeDate = t.published || t.publishedAt || t.date || t.timestamp;
      if (maybeDate && t.severity !== undefined) {
        const parsed = new Date(maybeDate);
        if (!isNaN(parsed)) {
          // normalize to YYYY-MM-DD
          const date = parsed.toISOString().split("T")[0];
          if (!byDate[date]) byDate[date] = [];
          byDate[date].push(t.severity);
        }
      }
    });

    const resultByDate = Object.entries(byDate)
      .map(([date, values]) => {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return { x: date, severity: Math.round(avg) };
      })
      .sort((a, b) => new Date(a.x) - new Date(b.x));

    if (resultByDate.length) return resultByDate;

    // fallback: no usable dates — show severity per item (labelled by id/location/index)
    return (items || []).map((t, idx) => ({
      x: t.locationName || t.location || t.id || `#${idx + 1}`,
      severity: t.severity != null ? Number(t.severity) : 0,
    }));
  }, [items]);

  // 🔑 Pie chart: threat type breakdown
  const pieData = useMemo(() => {
    const counts = {};
    items.forEach((t) => {
      if (t.threatType) {
        counts[t.threatType] = (counts[t.threatType] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [items]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Line Chart */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Trend (Average Severity)</h3>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="x" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151" }} />
              <Line type="monotone" dataKey="severity" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Threat Type Breakdown</h3>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            <Legend verticalAlign="bottom" align="center" />
              <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #374151" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
