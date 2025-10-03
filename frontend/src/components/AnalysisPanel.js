import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const TYPE_COLORS = {
  "Armed Conflict": "#ef4444", // Red
  "Climate Change": "#3b82f6", // Blue
  "Pandemic & Health": "#10b981", // Green
  "Economic Collapse": "#facc15", // Yellow
  Unknown: "#9ca3af",
};

function colorForType(t) {
  return TYPE_COLORS[t] || TYPE_COLORS.Unknown;
}

const DEFAULT_PER_CAPITA = 10000;

function perCapitaLookup(regionName) {
  if (!regionName) return DEFAULT_PER_CAPITA;
  const r = regionName.toLowerCase();
  if (r.includes("us") || r.includes("united states") || r === "us") return 65000;
  if (r.includes("uk") || r.includes("britain") || r.includes("england")) return 42000;
  if (r.includes("china") || r.includes("beijing")) return 12000;
  if (r.includes("india")) return 2500;
  if (r.includes("middle east")) return 15000;
  return DEFAULT_PER_CAPITA;
}

function formatCount(n) {
  if (n == null) return "0";
  const num = Number(n) || 0;
  if (Math.abs(num) >= 1000) {
    const v = Math.round(num / 100) / 10;
    return (v % 1 === 0 ? String(Math.round(v)) : String(v)) + "k";
  }
  return String(num);
}

function populationEstimate(regionName) {
  if (!regionName) return 1000000;
  const r = regionName.toLowerCase();
  if (r.includes("us") || r.includes("united states") || r === "us") return 331000000;
  if (r.includes("china") || r.includes("beijing")) return 1402000000;
  if (r.includes("india")) return 1393000000;
  if (r.includes("uk") || r.includes("britain") || r.includes("england")) return 67000000;
  if (r.includes("ukraine")) return 44000000;
  if (r.includes("middle east") || r.includes("saudi") || r.includes("iran") || r.includes("iraq"))
    return 258000000;
  if (r.includes("europe")) return 740000000;
  if (r.includes("africa")) return 1340000000;
  if (r.includes("global")) return 7800000000;
  return 1000000;
}

function deterministicNoise(seed, scale = 0.12) {
  const s = String(seed || "0");
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const v = (h % 100000) / 100000;
  return (v * 2 - 1) * scale;
}

function maturityMultiplier(m) {
  if (!m) return 0.02;
  const t = m.toLowerCase();
  if (t.includes("critical")) return 0.2;
  if (t.includes("escalat")) return 0.08;
  if (t.includes("widespread") || t.includes("major")) return 0.12;
  return 0.03;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-xs text-white shadow-lg">
        {payload.map((entry, index) => (
          <div key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Legend Component
const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-wrap justify-center mt-2 gap-2 text-xs">
      {payload?.map((entry, index) => (
        <div key={index} className="flex items-center gap-1">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-300 truncate max-w-20">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalysisPanel({ analysis, loading, error, items = [], selectedItem }) {
  const regionName =
    analysis?.region ||
    analysis?.location ||
    selectedItem?.locationName ||
    selectedItem?.location ||
    "Global";

  const citizensImpacted = useMemo(() => {
    const popRaw =
      analysis?.population ||
      analysis?.population_estimate ||
      selectedItem?.population ||
      0;

    const regionFromAnalysis =
      analysis?.region ||
      analysis?.location ||
      selectedItem?.locationName ||
      selectedItem?.location ||
      null;

    const basePop =
      popRaw && popRaw > 0 ? popRaw : populationEstimate(regionFromAnalysis);

    const cappedPool = Math.max(1000, Math.min(basePop, 10_000_000));

    const severity = (analysis?.severity ?? selectedItem?.severity ?? 0) / 100;
    const maturity = analysis?.maturity ?? selectedItem?.maturity ?? null;

    let poolFraction = 0.0005 + severity * 0.025;
    const noise = deterministicNoise(
      analysis?.id || analysis?.title || regionFromAnalysis,
      0.18
    );
    poolFraction = Math.max(0.0001, poolFraction * (1 + noise));
    const pool = Math.max(100, Math.round(cappedPool * poolFraction));

    const noise2 = deterministicNoise(
      (analysis?.id || analysis?.title || regionFromAnalysis) + "_a",
      0.12
    );
    const affectedFraction = Math.min(
      1,
      Math.max(
        0,
        (0.02 + severity * 0.6 + maturityMultiplier(maturity) * 0.5) *
          (1 + noise2)
      )
    );
    return Math.max(1, Math.round(pool * affectedFraction));
  }, [analysis, selectedItem]);

  const financialLoss = useMemo(() => {
    const perCap = analysis?.per_capita_gdp || perCapitaLookup(regionName);
    const severity = analysis?.severity ?? selectedItem?.severity ?? 0;
    const severityMultiplier = 0.02 + Math.min(0.9, severity / 100);
    const loss = Math.round(perCap * citizensImpacted * severityMultiplier);
    return Math.max(0, loss);
  }, [analysis, selectedItem, citizensImpacted, regionName]);

  const regions = useMemo(() => {
    if (Array.isArray(analysis?.regions_impacted) && analysis?.regions_impacted.length)
      return analysis.regions_impacted;
    if (analysis?.regions)
      return Array.isArray(analysis.regions) ? analysis.regions : [analysis.regions];
    if (selectedItem?.locationName) return [selectedItem.locationName];
    return [regionName || "Global"];
  }, [analysis, selectedItem, regionName]);

  const barData = useMemo(() => {
    return (items || []).slice(0, 3).map((it, idx) => {
      const region = it.region || it.locationName || it.location || "";
      const basePop = it.population || it.population_estimate || populationEstimate(region);
      const cappedPool = Math.max(1000, Math.min(basePop, 10_000_000));
      const severity = (it.severity ?? 0) / 100;
      let poolFraction = 0.0005 + severity * 0.025;
      const noise = deterministicNoise(it?.id || it?.headline || idx, 0.18);
      poolFraction = Math.max(0.0001, poolFraction * (1 + noise));
      const pool = Math.max(100, Math.round(cappedPool * poolFraction));
      const affectedFraction = Math.min(
        1,
        Math.max(
          0,
          (0.02 + severity * 0.6 + maturityMultiplier(it.maturity) * 0.5) *
            (1 + deterministicNoise((it?.id || it?.headline || idx) + "_b", 0.12))
        )
      );
      const exposed = Math.max(1, Math.round(pool * affectedFraction));
      return {
        name: `C${idx + 1}`,
        citizens: exposed,
        color: colorForType(it.threatType || it.type),
      };
    });
  }, [items]);

  const pieData = useMemo(() => {
    const map = {};
    (items || []).forEach((it) => {
      const region = it.region || it.locationName || it.location || "";
      const basePop = it.population || it.population_estimate || populationEstimate(region);
      const cappedPool = Math.max(1000, Math.min(basePop, 10_000_000));
      const severity = (it.severity ?? 0) / 100;
      let poolFraction = 0.0005 + severity * 0.025;
      poolFraction = Math.max(
        0.0001,
        poolFraction * (1 + deterministicNoise(it?.id || it?.headline || "", 0.18))
      );
      const pool = Math.max(100, Math.round(cappedPool * poolFraction));
      const affectedFraction = Math.min(
        1,
        Math.max(
          0,
          (0.02 + severity * 0.6 + maturityMultiplier(it.maturity) * 0.5) *
            (1 +
              deterministicNoise((it?.id || it?.headline || "") + "_c", 0.12))
        )
      );
      const exposed = Math.max(1, Math.round(pool * affectedFraction));
      const perCap = it.per_capita_gdp || perCapitaLookup(it.locationName || it.region || "");
      const loss = Math.round(exposed * perCap * (0.2 + severity / 2));
      const t = it.threatType || it.type || "Unknown";
      map[t] = (map[t] || 0) + loss;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [items]);

  const trendData = useMemo(() => {
    const base = analysis?.severity ?? selectedItem?.severity ?? 10;
    const arr = [];
    for (let i = 0; i <= 14; i++) {
      arr.push({ step: i, impact: Math.round(Math.min(100, base + i * (base * 0.03))) });
    }
    return arr;
  }, [analysis, selectedItem]);

  function exportCSV() {
    const rows = [
      ["crisis_id", "type", "citizens_impacted", "regions", "financial_loss_usd"],
      [
        analysis?.id || selectedItem?.id || "",
        analysis?.type || selectedItem?.threatType || "",
        citizensImpacted,
        regions.join("|"),
        financialLoss,
      ],
    ];
    const csv = rows
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis_${analysis?.id || selectedItem?.id || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-semibold">
          Analysis — {analysis?.type || selectedItem?.threatType}
        </h3>
        <button
          onClick={exportCSV}
          className="bg-slate-700 hover:bg-slate-600 text-sm px-3 py-1 rounded"
        >
          Export CSV
        </button>
      </div>

      {/* Fixed Layout - 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Top Left - SUMMARY */}
        <div className="bg-gray-900 p-4 rounded">
          <div className="text-sm text-gray-300 mb-3 border-b border-gray-700 pb-2">Summary</div>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-2 text-gray-400">Citizens Affected</td>
                <td className="py-2 text-right font-medium">{formatCount(citizensImpacted)}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 text-gray-400">Regions Impacted</td>
                <td className="py-2 text-right font-medium">{regions.join(", ")}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 text-gray-400">Estimated Financial Loss (USD)</td>
                <td className="py-2 text-right font-medium">${(financialLoss / 1000000).toFixed(1)}M</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-400">Political Capital Lost (%)</td>
                <td className="py-2 text-right font-medium">
                  {typeof analysis?.political_capital_lost_pct === "number"
                    ? `${analysis.political_capital_lost_pct.toFixed(1)}%`
                    : "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Top Right - PIE CHART */}
        <div className="bg-gray-900 p-4 rounded">
          <div className="text-sm text-gray-300 mb-3 border-b border-gray-700 pb-2">Financial Impact by Crisis Type</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={50}
                  label={false}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={colorForType(entry.name)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <CustomLegend payload={pieData.map(item => ({ value: item.name, color: colorForType(item.name) }))} />
        </div>

        {/* Bottom Left - BAR CHART */}
        <div className="bg-gray-900 p-4 rounded">
          <div className="text-sm text-gray-300 mb-3 border-b border-gray-700 pb-2">Citizens Affected by Individual Crises</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  axisLine={{ stroke: "#4b5563" }}
                />
                <YAxis 
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  tickFormatter={(value) => formatCount(value)}
                  axisLine={{ stroke: "#4b5563" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="citizens" radius={[2, 2, 0, 0]}>
                  {barData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color || "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Right - LINE CHART */}
        <div className="bg-gray-900 p-4 rounded">
          <div className="text-sm text-gray-300 mb-3 border-b border-gray-700 pb-2">Projected Escalation Trend</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="step" 
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  axisLine={{ stroke: "#4b5563" }}
                />
                <YAxis 
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  axisLine={{ stroke: "#4b5563" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="impact"
                  stroke={colorForType(analysis?.type || selectedItem?.threatType)}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}