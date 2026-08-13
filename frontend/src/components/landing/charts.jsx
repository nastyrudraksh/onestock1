import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  YAxis,
} from "recharts";

export const growthData = [
  { m: "Jan", v: 18.2, p: 1.2 }, { m: "Feb", v: 18.9, p: -0.8 },
  { m: "Mar", v: 19.6, p: 2.1 }, { m: "Apr", v: 20.8, p: 1.6 },
  { m: "May", v: 21.1, p: -1.1 }, { m: "Jun", v: 22.4, p: 2.4 },
  { m: "Jul", v: 23.0, p: 1.9 }, { m: "Aug", v: 23.9, p: 0.7 },
  { m: "Sep", v: 24.6, p: 2.8 }, { m: "Oct", v: 24.1, p: -0.6 },
  { m: "Nov", v: 24.9, p: 1.4 }, { m: "Dec", v: 25.8, p: 2.2 },
];

export const intradayData = [
  { t: "09:15", v: 24.61 }, { t: "10:00", v: 24.58 }, { t: "10:45", v: 24.66 },
  { t: "11:30", v: 24.72 }, { t: "12:15", v: 24.69 }, { t: "13:00", v: 24.78 },
  { t: "13:45", v: 24.74 }, { t: "14:30", v: 24.83 }, { t: "15:15", v: 24.87 },
];

export const pnlData = [
  { d: "Mon", v: 12.4 }, { d: "Tue", v: -4.2 }, { d: "Wed", v: 8.6 },
  { d: "Thu", v: 15.1 }, { d: "Fri", v: -6.8 }, { d: "Sat", v: 9.3 },
  { d: "Sun", v: 18.2 },
];

export const monthlyPerf = [
  { m: "J", v: 68 }, { m: "F", v: 42 }, { m: "M", v: 81 }, { m: "A", v: 56 },
  { m: "M", v: 74 }, { m: "J", v: 90 }, { m: "J", v: 63 }, { m: "A", v: 78 },
  { m: "S", v: 85 }, { m: "O", v: 48 }, { m: "N", v: 70 }, { m: "D", v: 92 },
];

export const Sparkline = ({ points, positive = true, className = "" }) => {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 72;
  const h = 24;
  const path = points
    .map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p - min) / range) * (h - 2) - 1}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none">
      <polyline
        points={path}
        fill="none"
        stroke={positive ? "#00D084" : "#F43F5E"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const candles = [
  [40, 55], [55, 48], [48, 62], [62, 58], [58, 70], [70, 64], [64, 78],
  [78, 72], [72, 84], [84, 76], [76, 88], [88, 82], [82, 94], [94, 86],
  [86, 98], [98, 90], [90, 104], [104, 96], [96, 110], [110, 102],
  [102, 116], [116, 108], [108, 122], [122, 128],
];

export const CandleChart = ({ className = "" }) => {
  const w = 100;
  const h = 100;
  const bw = w / candles.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none">
      {candles.map(([o, c], i) => {
        const up = c >= o;
        const top = h - Math.max(o, c) * 0.72;
        const height = Math.max(Math.abs(c - o) * 0.72, 1.2);
        const x = i * bw + bw * 0.22;
        const wickTop = h - (Math.max(o, c) + 4) * 0.72;
        const wickBottom = h - (Math.min(o, c) - 4) * 0.72;
        const color = up ? "#00D084" : "#F43F5E";
        return (
          <g key={i}>
            <line x1={x + bw * 0.28} y1={wickTop} x2={x + bw * 0.28} y2={wickBottom} stroke={color} strokeWidth="0.5" opacity="0.7" />
            <rect x={x} y={top} width={bw * 0.56} height={height} rx="0.4" fill={color} opacity={up ? 0.95 : 0.85} />
          </g>
        );
      })}
    </svg>
  );
};

export const Donut = ({ value = 68, size = 120, stroke = 10, dark = false }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? "#1E293B" : "#EDF0F5"} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#00D084" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        className="font-mono" fontSize={size * 0.22} fontWeight="600"
        fill={dark ? "#FBFBFC" : "#0A0F1C"}>
        {value}%
      </text>
    </svg>
  );
};

export const AreaTrend = ({ data, dataKey = "v", dark = false, height = 140 }) => {
  const values = data.map((d) => d[dataKey]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.15 || 1;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={dark ? "gDark" : "gLight"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D084" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#00D084" stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[min - pad, max + pad]} />
          <Area
            type="monotone" dataKey={dataKey} stroke="#00D084" strokeWidth={2}
            fill={`url(#${dark ? "gDark" : "gLight"})`} dot={false}
            isAnimationActive={true} animationDuration={1600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PnlBars = ({ height = 120 }) => (
  <div style={{ height }} className="w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={pnlData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="28%">
        <Bar dataKey="v" radius={[3, 3, 3, 3]} isAnimationActive={true} animationDuration={1400}>
          {pnlData.map((e, i) => (
            <Cell key={i} fill={e.v >= 0 ? "#00D084" : "#F43F5E"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);
