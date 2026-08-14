import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { RefreshCw, Settings, Zap, Star, X, TrendingUp, TrendingDown } from "lucide-react";
import {
  MinBtn, Collapse, TermPanel, SignalDrawer, OiChainCard, buildSignal, INSTRUMENTS, INDICES, INDEX_NAMES,
  OI_STRIKES, OI_SPOT, slug, mixHash, playAlertBeep, cellTone,
  FY_COLS, buildFundamentals, buildAltRows, SALES_WEEKS, SALES_ROWS, NAV_TABS, ALT_TABS, GROWTH_PERIODS,
} from "./PanelViews";
import { CandleChart } from "../landing/charts";

const SECTORS = {
  BANKING: ["HDFCBANK", "ICICIBANK", "SBIN", "AXISBANK", "KOTAKBANK", "INDUSINDBK"],
  IT: ["TCS", "INFY", "HCLTECH", "WIPRO", "TECHM"],
  AUTO: ["TATAMOTORS", "MARUTI", "HEROMOTOCO", "EICHERMOT", "BAJAJ-AUTO", "TVSMOTOR"],
  PHARMA: ["SUNPHARMA", "CIPLA", "DRREDDY", "DIVISLAB", "APOLLOHOSP"],
  METAL: ["TATASTEEL", "JSWSTEEL", "HINDALCO", "HINDZINC", "VEDL"],
  ENERGY: ["NTPC", "POWERGRID", "COALINDIA"],
  FMCG: ["ITC", "HINDUNILVR", "BRITANNIA", "NESTLEIND", "TATACONSUM"],
  REALTY: ["DLF", "LODHA"],
  "FINANCIAL SERVICES": ["BAJFINANCE"],
  CONSUMER: ["DMART", "HAVELLS", "PIDILITIND", "TITAN", "ASIANPAINT", "GRASIM", "ULTRACEMCO"],
  TELECOM: ["BHARTIARTL"],
  "OIL & GAS": ["RELIANCE", "ONGC", "BPCL", "IOC"],
};
const SECTOR_OF = {};
Object.entries(SECTORS).forEach(([sec, syms]) => syms.forEach((s) => { SECTOR_OF[s] = sec; }));

const NEWS_POOL = [
  { h: "Index opens higher led by banking heavyweights", tag: "NIFTY", sym: "NIFTY 50" },
  { h: "IT stocks rally on strong quarterly commentary", tag: "SECTOR", sym: "NIFTY IT" },
  { h: "Sensex crosses key resistance in early trade", tag: "SENSEX", sym: "SENSEX" },
  { h: "Reliance Industries announces capex plan review", tag: "STOCK", sym: "RELIANCE" },
  { h: "Metal pack surges on global commodity strength", tag: "SECTOR", sym: "NIFTY METAL" },
  { h: "HDFC Bank volume spikes ahead of results", tag: "STOCK", sym: "HDFCBANK" },
  { h: "Midcaps underperform as breadth weakens", tag: "NIFTY", sym: "NIFTY MIDCAP 100" },
  { h: "Pharma sees profit booking after 5-day rally", tag: "SECTOR", sym: "NIFTY PHARMA" },
  { h: "Tata Motors unusual volume on EV order news", tag: "STOCK", sym: "TATAMOTORS" },
  { h: "FMCG steady as inflation data awaited", tag: "SECTOR", sym: "NIFTY FMCG" },
  { h: "Bank Nifty PCR rises above 1.1 intraday", tag: "NIFTY", sym: "BANK NIFTY" },
  { h: "Infosys ADR premium widens overnight", tag: "STOCK", sym: "INFY" },
];
const NEWS_ITEMS = NEWS_POOL.map((n, i) => ({ ...n, t: `${9 + Math.floor(i / 3)}:${["05", "22", "41", "57"][i % 4]}` }));
const NEWS_FILTERS = ["ALL", "NIFTY", "SENSEX", "SECTOR", "STOCK"];

const oiRowsFor = (tick) =>
  OI_STRIKES.map((strike) => {
    const h = mixHash(`oi-${strike}-${tick}`);
    const dist = Math.abs(strike - OI_SPOT) / 50;
    const nearBoost = Math.max(0, 60 - dist * 9);
    return {
      strike,
      callOi: +(((h % 140) / 10) + 0.4 + (strike > OI_SPOT ? nearBoost / 3 : nearBoost / 6)).toFixed(1),
      putOi: +((((h >> 3) % 140) / 10) + 0.3 + (strike < OI_SPOT ? nearBoost / 3 : nearBoost / 6)).toFixed(1),
      callChg: (h >> 5) % 240 - 110,
      putChg: (h >> 7) % 220 - 100,
      iv: (9 + ((h >> 2) % 120) / 10).toFixed(1),
    };
  });

const stockDetail = (s) => {
  const h = mixHash(`detail-${s.sym}`);
  const ltp = Number(s.ltp);
  return {
    open: (ltp / (1 + s.chgPct / 100)).toFixed(2),
    high: (ltp * 1.012).toFixed(2),
    low: (ltp * 0.989).toFixed(2),
    prevClose: (ltp / (1 + s.chgPct / 100)).toFixed(2),
    value: `${(ltp * Number(s.volume) / 100).toFixed(1)} Cr`,
    mcap: `${(8 + (h % 1800) / 10).toFixed(1)}L Cr`,
    hi52: (ltp * (1.1 + (h % 20) / 100)).toFixed(2),
    lo52: (ltp * (0.62 + (h % 15) / 100)).toFixed(2),
    pe: (8 + (h % 380) / 10).toFixed(1),
    eps: (ltp / (8 + (h % 380) / 10)).toFixed(2),
    divY: ((h % 32) / 10).toFixed(2),
  };
};

const chartSeries = (key, px, points = 60) => {
  const seed = mixHash(key);
  let v = px * 0.982;
  return Array.from({ length: points }, (_, i) => {
    v = v * (1 + (((seed >> (i % 24)) % 100) - 47) / 5000);
    const mins = 9 * 60 + 15 + i * 6;
    return {
      t: `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`,
      v: +v.toFixed(2),
      vol: 4 + ((seed >> (i % 20)) % 36),
    };
  });
};

const WATCH_KEY = "onestock-watchlist";

const useWatchlist = () => {
  const [list, setList] = useState(() => {
    try { return JSON.parse(localStorage.getItem(WATCH_KEY) || "[]"); } catch { return []; }
  });
  const toggle = useCallback((s) => {
    setList((l) => {
      const exists = l.some((x) => x.sym === s.sym);
      const next = exists ? l.filter((x) => x.sym !== s.sym) : [...l, { sym: s.sym, name: s.name, ltp: s.ltp, chgPct: s.chgPct }];
      localStorage.setItem(WATCH_KEY, JSON.stringify(next));
      toast.success(exists ? `${s.sym} removed from watchlist` : `${s.sym} added to watchlist`, { description: "Saved locally — demo storage." });
      return next;
    });
  }, []);
  return [list, toggle];
};

const StatMini = ({ l, v, tone }) => (
  <div className="px-1.5 py-0.5">
    <p className="font-mono text-[8px] uppercase tracking-wider text-[#777]">{l}</p>
    <p className={`font-mono text-[11px] font-bold ${tone || "text-[#e5e5e5]"}`}>{v}</p>
  </div>
);

function StockDetailDrawer({ stock, onClose, inWatch, onToggleWatch }) {
  const [tab, setTab] = useState("overview");
  if (!stock) return null;
  const d = stockDetail(stock);
  const up = stock.chgPct > 0;
  const flat = stock.chgPct === 0;
  const series = chartSeries(`stock-${stock.sym}`, Number(stock.ltp), 40);
  const h = mixHash(`oi-${stock.sym}`);
  const callOi = (20 + (h % 160) / 2).toFixed(1);
  const putOi = (20 + ((h >> 4) % 160) / 2).toFixed(1);
  const funds = buildFundamentals().slice(0, 8);
  const news = NEWS_ITEMS.filter((n) => n.sym === stock.sym).concat(NEWS_ITEMS.filter((n) => n.tag === "NIFTY").slice(0, 2));
  const TABS = ["Overview", "Chart", "Fundamentals", "OI", "News"];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" data-testid="stock-detail-drawer">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-[#262626] bg-[#0B0B0B]" data-lenis-prevent>
        <header className="sticky top-0 z-10 border-b border-[#262626] bg-[#0d0d0d] px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-mono text-sm font-bold text-white">{stock.sym}</p>
              <p className="font-mono text-[10px] text-[#888]">{stock.name} · {SECTOR_OF[stock.sym] || "Index"} · DEMO DATA</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button data-testid="drawer-watchlist-toggle" onClick={() => onToggleWatch(stock)}
                className={`flex h-7 w-7 items-center justify-center rounded border transition-colors ${inWatch ? "border-amber-400 bg-amber-400/10 text-amber-400" : "border-[#333] text-[#888] hover:text-white"}`}>
                <Star className="h-3.5 w-3.5" fill={inWatch ? "currentColor" : "none"} />
              </button>
              <button data-testid="drawer-close" onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded border border-[#333] text-[#888] transition-colors hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-mono text-xl font-bold text-white">₹{Number(stock.ltp).toLocaleString("en-IN")}</span>
            <span className={`font-mono text-[11px] font-bold ${flat ? "text-[#888]" : up ? "text-green-400" : "text-red-400"}`}>
              {flat ? "0.00 (0.00%)" : `${up ? "▲" : "▼"} ₹${Math.abs((stock.ltp * stock.chgPct) / 100).toFixed(2)} (${up ? "+" : ""}${stock.chgPct.toFixed(2)}%)`}
            </span>
          </div>
          <nav className="mt-2 flex gap-1">
            {TABS.map((t) => (
              <button key={t} data-testid={`drawer-tab-${slug(t)}`} onClick={() => setTab(slug(t))}
                className={`rounded px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider transition-colors ${tab === slug(t) ? "bg-amber-400 text-black" : "text-[#999] hover:text-white"}`}>
                {t}
              </button>
            ))}
          </nav>
        </header>

        <div className="p-3">
          {tab === "overview" && (
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded border border-[#262626] bg-[#262626]">
              {[
                ["Open", `₹${d.open}`], ["High", `₹${d.high}`], ["Low", `₹${d.low}`],
                ["Prev Close", `₹${d.prevClose}`], ["Volume", `${stock.volume}M`], ["Value", d.value],
                ["Market Cap", d.mcap], ["52W High", `₹${d.hi52}`], ["52W Low", `₹${d.lo52}`],
                ["P/E", d.pe], ["EPS", `₹${d.eps}`], ["Div Yield", `${d.divY}%`],
              ].map(([l, v]) => (
                <div key={l} className="bg-[#0B0B0B]"><StatMini l={l} v={v} /></div>
              ))}
            </div>
          )}
          {tab === "chart" && (
            <div className="rounded border border-[#262626] p-2">
              <p className="mb-1 font-mono text-[9px] uppercase tracking-wider text-[#777]">{stock.sym} · Intraday · Demo</p>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <XAxis dataKey="t" tick={{ fontSize: 8, fill: "#777", fontFamily: "monospace" }} tickLine={false} axisLine={false} minTickGap={40} />
                    <YAxis hide domain={["dataMin", "dataMax"]} />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", fontSize: 10, fontFamily: "monospace" }} />
                    <Area type="monotone" dataKey="v" stroke={up ? "#22c55e" : "#f43f5e"} fill={up ? "#22c55e22" : "#f43f5e22"} strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {tab === "fundamentals" && (
            <table className="w-full font-mono text-[10px]">
              <tbody>
                {funds.map((r) => (
                  <tr key={r.label} className="border-b border-[#1c1c1c]">
                    <td className={`px-2 py-1.5 ${r.key ? "text-amber-400" : "text-[#c9c9c9]"}`}>{r.label}</td>
                    <td className="px-2 py-1.5 text-right text-[#e5e5e5]">{r.cells[5].t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === "oi" && (
            <div className="space-y-2">
              {[["Call OI", callOi, "bg-rose-500"], ["Put OI", putOi, "bg-signal"]].map(([l, v, c]) => (
                <div key={l} className="rounded border border-[#262626] p-2.5">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-[#999]">{l}</span><span className="font-bold text-white">{v}L</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-[#1a1a1a]">
                    <div className={`h-full ${c}`} style={{ width: `${Math.min(100, (v / 100) * 100)}%` }} />
                  </div>
                </div>
              ))}
              <p className="font-mono text-[9px] text-[#777]">PCR {(putOi / callOi).toFixed(2)} · demo data</p>
            </div>
          )}
          {tab === "news" && (
            <div className="space-y-1.5">
              {news.map((n, i) => (
                <div key={i} className="rounded border border-[#262626] p-2">
                  <p className="font-mono text-[9px] text-[#777]">{n.t} · {n.tag}</p>
                  <p className="mt-0.5 text-[11px] font-medium leading-snug text-[#d7d7d7]">{n.h}</p>
                </div>
              ))}
              <p className="font-mono text-[9px] text-[#777]">Demo headlines — no real news feed connected.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export function MarketView({ onBack }) {
  const [indexName, setIndexName] = useState("NIFTY 50");
  const index = INDICES[indexName];
  const [tick, setTick] = useState(0);
  const [live, setLive] = useState(true);
  const [enabled, setEnabled] = useState([true, true, true, true, true]);
  const [history, setHistory] = useState([]);
  const [signalFor, setSignalFor] = useState(null);
  const [demoTrades, setDemoTrades] = useState([]);
  const [detailStock, setDetailStock] = useState(null);
  const [sectorFilter, setSectorFilter] = useState(null);
  const [watchlist, toggleWatch] = useWatchlist();
  const [gainerCount, setGainerCount] = useState(10);
  const [volTab, setVolTab] = useState("Volume");
  const [newsFilter, setNewsFilter] = useState("ALL");
  const [chartRange, setChartRange] = useState("1D");
  const [chartType, setChartType] = useState("Area");
  const [collapsed, setCollapsed] = useState({});
  const [navTab, setNavTab] = useState("Financial Analysis");
  const [altTab, setAltTab] = useState("Inflection");
  const [currency, setCurrency] = useState("INR");
  const [growthPeriod, setGrowthPeriod] = useState("3M");
  const [compSource, setCompSource] = useState("Analyst Curated (BI)");
  const [growthType, setGrowthType] = useState("Year-over-Year");
  const [periodicity, setPeriodicity] = useState("Weekly");

  const PANEL_KEYS = ["breadth", "board", "movers", "sectors", "volmov", "chart", "idxperf", "oiintel", "oi", "oiactivity", "fiidii", "sentiment", "inst", "news", "fund", "alt", "sales"];
  const togglePanel = (k) => setCollapsed((c) => ({ ...c, [k]: !c[k] }));
  const setAll = (v) => setCollapsed(Object.fromEntries(PANEL_KEYS.map((k) => [k, v])));

  const openStrike = useCallback((strike) =>
    setSignalFor({ name: `NIFTY ${strike} STRIKE`, px: strike.toLocaleString("en-IN"), chg: "+0.00%" }), []);
  const toggleIndicator = (i) =>
    setEnabled((e) => { const n = [...e]; n[i] = !n[i]; return n.some(Boolean) ? n : e; });

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setTick((t) => t + 1), 4000);
    return () => clearInterval(id);
  }, [live]);

  useEffect(() => {
    if (tick === 0) return;
    const strong = INSTRUMENTS.map((m) => ({ m, sig: buildSignal(m, tick, enabled) }))
      .filter((x) => x.sig.confidence >= 90).slice(0, 2);
    if (strong.length > 0) playAlertBeep();
    strong.forEach(({ m, sig }) => {
      const fn = sig.buy ? toast.success : toast.error;
      fn(`Strong Signal: ${m.name}`, {
        id: `strong-${slug(m.name)}-${tick}`,
        description: `${sig.dir} · ${sig.confidence}% confidence · demo test model`,
        style: sig.buy
          ? { background: "#00D084", color: "#06281C", border: "1px solid #00B573" }
          : { background: "#F43F5E", color: "#FFFFFF", border: "1px solid #E11D48" },
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  useEffect(() => {
    if (!signalFor) return;
    const sig = buildSignal(signalFor, tick, enabled);
    const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
    setHistory((h) => [{ name: signalFor.name, dir: sig.dir, buy: sig.buy, confidence: sig.confidence, time }, ...h].slice(0, 8));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signalFor, tick]);

  const handleExecuteDemoTrade = useCallback((trade) => {
    const entry = {
      ...trade,
      id: `${trade.symbol}-${trade.time}-${trade.action}`,
      side: trade.action,
      note: `${trade.action} ${trade.quantity} lots`,
    };
    setDemoTrades((prev) => [entry, ...prev].slice(0, 8));
    setHistory((prev) => [{
      name: trade.symbol,
      dir: trade.type,
      buy: trade.action === "BUY",
      confidence: 92,
      time: trade.time,
    }, ...prev].slice(0, 8));
  }, []);

  const stocks = index.stocks;
  const derived = useMemo(() => {
    const advances = stocks.filter((s) => s.chgPct > 0);
    const declines = stocks.filter((s) => s.chgPct < 0);
    const unchanged = stocks.filter((s) => s.chgPct === 0);
    const byChg = [...stocks].sort((a, b) => b.chgPct - a.chgPct);
    const byVol = [...stocks].sort((a, b) => Number(b.volume) - Number(a.volume));
    const avgVol = stocks.reduce((a, s) => a + Number(s.volume), 0) / stocks.length;
    const withRel = stocks.map((s) => ({ ...s, relVol: +(Number(s.volume) / avgVol).toFixed(2) }));
    const upVol = advances.reduce((a, s) => a + Number(s.volume), 0);
    const totVol = stocks.reduce((a, s) => a + Number(s.volume), 0) || 1;
    const oi = oiRowsFor(tick);
    const totalCall = oi.reduce((a, r) => a + r.callOi, 0);
    const totalPut = oi.reduce((a, r) => a + r.putOi, 0);
    const pcr = totalPut / totalCall;
    const chgNum = parseFloat(index.chg);
    const sentiment = Math.round(Math.min(100, Math.max(0,
      (advances.length / stocks.length) * 55 + (chgNum > 0 ? 15 : 5) + (pcr - 0.8) * 40 + 10)));
    return {
      advances, declines, unchanged,
      gainers: byChg.slice(0, gainerCount),
      losers: byChg.slice(-gainerCount).reverse(),
      volLeaders: byVol.slice(0, 8).map((s) => withRel.find((x) => x.sym === s.sym)),
      hi52: byChg.filter((s) => s.chgPct > 2).slice(0, 5),
      lo52: byChg.filter((s) => s.chgPct < -2).slice(-5),
      unusual: withRel.filter((s) => s.relVol >= 1.8).slice(0, 5),
      active: byVol.slice(0, 5),
      sectors: Object.entries(SECTORS).map(([sec, syms]) => {
        const members = stocks.filter((s) => syms.includes(s.sym));
        const avg = members.length ? members.reduce((a, s) => a + s.chgPct, 0) / members.length : (mixHash(sec) % 300 - 150) / 100;
        return { sec, avg, count: members.length };
      }),
      oi, totalCall, totalPut, pcr, sentiment,
      maxCall: oi.reduce((a, r) => (r.callOi > a.callOi ? r : a), oi[0]),
      maxPut: oi.reduce((a, r) => (r.putOi > a.putOi ? r : a), oi[0]),
      breadth: {
        adRatio: (advances.length / Math.max(1, declines.length)).toFixed(2),
        hi52n: advances.filter((s) => s.chgPct > 2).length,
        lo52n: declines.filter((s) => s.chgPct < -2).length,
        upVolPct: ((upVol / totVol) * 100).toFixed(1),
        downVolPct: ((1 - upVol / totVol) * 100).toFixed(1),
      },
    };
  }, [stocks, gainerCount, tick, index.chg]);

  const visibleStocks = sectorFilter ? stocks.filter((s) => SECTOR_OF[s.sym] === sectorFilter) : stocks;
  const px = parseFloat(index.px.replace(/,/g, ""));
  const chgNum = parseFloat(index.chg);
  const volH = (12.4 + (mixHash(`hdr-${indexName}`) % 800) / 10).toFixed(1);
  const fx = (v, dec = 2) =>
    currency === "USD" ? `$${(v / 84).toLocaleString("en-US", { maximumFractionDigits: dec })}` : `₹${v.toLocaleString("en-IN", { maximumFractionDigits: dec })}`;
  const up = chgNum >= 0;
  const hdrStats = [
    { l: "Volume", v: `${volH}M` }, { l: "Bid", v: fx(px * 0.9998) }, { l: "Ask", v: fx(px * 1.0002) },
    { l: "Open", v: fx(px / (1 + chgNum / 100)) }, { l: "High", v: fx(px * 1.008) }, { l: "Low", v: fx(px * 0.991) },
    { l: "Value", v: `${fx(px * parseFloat(volH) * 10, 0)} Cr` },
  ];
  const funds = buildFundamentals();
  const altRows = buildAltRows();
  const idxSig = buildSignal({ name: indexName, px: index.px }, tick, enabled);
  const chart = useMemo(() => chartSeries(`${indexName}-${chartRange}`, px), [indexName, chartRange, px]);
  const refreshBtn = (
    <button onClick={() => { setTick((t) => t + 1); toast.success("Panel refreshed", { description: "Demo feed ticked." }); }}
      className="flex h-6 w-6 items-center justify-center rounded border border-night-line bg-white/5 text-cloud transition-colors hover:bg-white/10"
      aria-label="Refresh panel">
      <RefreshCw className="h-3 w-3" />
    </button>
  );
  const watchSyms = watchlist.map((w) => w.sym);

  const BoardRow = ({ s }) => {
    const sup = s.chgPct > 0;
    const flat = s.chgPct === 0;
    const starred = watchSyms.includes(s.sym);
    return (
      <tr data-testid={`constituent-${slug(s.sym)}`} onClick={() => setDetailStock(s)}
        className="cursor-pointer border-b border-[#1c1c1c] transition-colors hover:bg-white/[0.05]">
        <td className="whitespace-nowrap px-2 py-1">
          <span className="inline-flex items-center gap-1.5">
            <button
              data-testid={`watch-${slug(s.sym)}`}
              onClick={(e) => { e.stopPropagation(); toggleWatch(s); }}
              className={`${starred ? "text-amber-400" : "text-[#555] hover:text-amber-400"} transition-colors`}
              aria-label="Toggle watchlist">
              <Star className="h-3 w-3" fill={starred ? "currentColor" : "none"} />
            </button>
            <span className="font-bold text-white">{s.sym}</span>
          </span>
        </td>
        <td className="hidden whitespace-nowrap px-2 py-1 text-[#888] lg:table-cell">{s.name}</td>
        <td className="whitespace-nowrap px-2 py-1 text-right text-[#e5e5e5]">{Number(s.ltp).toLocaleString("en-IN")}</td>
        <td className={`whitespace-nowrap px-2 py-1 text-right font-semibold ${flat ? "text-[#888]" : sup ? "text-green-400" : "text-red-400"}`}>
          {flat ? "0.00" : `${sup ? "+" : ""}${((s.ltp * s.chgPct) / 100).toFixed(2)}`}
        </td>
        <td className={`whitespace-nowrap px-2 py-1 text-right font-bold ${flat ? "text-[#888]" : sup ? "text-green-400" : "text-red-400"}`}>
          {flat ? "0.00%" : `${sup ? "+" : ""}${s.chgPct.toFixed(2)}%`}
        </td>
        <td className="hidden whitespace-nowrap px-2 py-1 text-right text-[#888] xl:table-cell">{s.volume}M</td>
      </tr>
    );
  };

  const BoardGroup = ({ label, list, tone }) => (
    <div className="min-w-0">
      <p className={`mb-1 border-b px-2 pb-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] ${tone === "up" ? "border-green-900 text-green-400" : tone === "down" ? "border-red-900 text-red-400" : "border-[#333] text-[#888]"}`}>
        {label} {list.length}
      </p>
      <table className="w-full font-mono text-[10px]">
        <tbody>{list.map((s) => <BoardRow key={s.sym} s={s} />)}</tbody>
      </table>
    </div>
  );

  const MoverTable = ({ title, list, tone }) => (
    <div className="overflow-hidden rounded-md border border-[#262626] bg-[#080808]">
      <p className={`border-b border-[#262626] bg-[#0d0d0d] px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] ${tone}`}>{title}</p>
      <table className="w-full font-mono text-[10px]">
        <tbody>
          {list.map((s) => (
            <tr key={s.sym} onClick={() => setDetailStock(s)} className="cursor-pointer border-b border-[#1c1c1c] last:border-0 hover:bg-white/[0.05]">
              <td className="px-2 py-1 font-bold text-white">{s.sym}</td>
              <td className="px-2 py-1 text-right text-[#e5e5e5]">{Number(s.ltp).toLocaleString("en-IN")}</td>
              <td className={`px-2 py-1 text-right ${s.chgPct >= 0 ? "text-green-400" : "text-red-400"}`}>{((s.ltp * s.chgPct) / 100).toFixed(2)}</td>
              <td className={`px-2 py-1 text-right font-bold ${s.chgPct >= 0 ? "text-green-400" : "text-red-400"}`}>{s.chgPct >= 0 ? "+" : ""}{s.chgPct.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <section data-testid="market-view" className="px-1 py-2 sm:px-2">
      <button data-testid="market-back-button" onClick={onBack}
        className="mb-2 inline-flex items-center gap-1.5 rounded border border-edge bg-white px-2.5 py-1 font-mono text-[9px] font-semibold text-slate transition-colors hover:bg-mist hover:text-ink">
        ← Back to Dashboard
      </button>

      <div className="space-y-1">
        <div className="flex items-center justify-end gap-2">
          <span className="mr-auto font-mono text-[9px] font-bold uppercase tracking-wider text-amber-500/80">Simulated Market Data · Demo</span>
          <button data-testid="market-minimize-all" onClick={() => setAll(true)}
            className="rounded border border-[#333] bg-[#111] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[#999] transition-colors hover:bg-[#1a1a1a]">
            Minimize All
          </button>
          <button data-testid="market-expand-all" onClick={() => setAll(false)}
            className="rounded bg-amber-400 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-black transition-all hover:brightness-110">
            Expand All
          </button>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-1.5 xl:grid-cols-3">
        {/* 1. MARKET HEADER */}
        <section className="rounded-sm border border-[#262626] bg-[#080808]" data-testid="terminal-header">
          <div className="flex flex-wrap items-center gap-2 border-b border-[#262626] px-2 py-1">
            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[#777]">Market</span>
            <select data-testid="index-selector" value={indexName} onChange={(e) => { setIndexName(e.target.value); setSectorFilter(null); }}
              className="rounded border border-[#333] bg-[#050505] px-2 py-1 font-mono text-[10px] font-bold text-amber-400 outline-none focus:border-amber-400">
              {INDEX_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="font-mono text-[8px] text-[#777]">{stocks.length} Constituents</span>
            <span className="hidden items-center gap-1.5 font-mono text-[8px] font-bold sm:flex">
              <span className="text-green-400" data-testid="advances-count">Advance {derived.advances.length}</span>
              <span className="text-red-400" data-testid="declines-count">Decline {derived.declines.length}</span>
              <span className="text-[#888]" data-testid="unchanged-count">Unchanged {derived.unchanged.length}</span>
            </span>
            {["Related Functions", "Menu"].map((b) => (
              <button key={b} data-testid={`terminal-${slug(b)}`} onClick={() => toast.info(`${b} — demo control`)}
                className="hidden rounded border border-[#333] bg-[#111] px-2 py-1 font-mono text-[9px] font-semibold text-[#d7d7d7] transition-colors hover:bg-[#1a1a1a] md:block">
                {b} ▾
              </button>
            ))}
            <span className="ml-auto flex items-center gap-2">
              <button data-testid="market-live-toggle" onClick={() => setLive((l) => !l)}
                className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider transition-colors ${live ? "border-green-800 bg-green-950/60 text-green-400" : "border-[#333] bg-[#111] text-[#888]"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-green-400 animate-pulse-dot" : "bg-[#666]"}`} />
                {live ? "Live" : "Paused"}
              </button>
              <button data-testid="terminal-refresh" onClick={() => { setTick((t) => t + 1); toast.success("Data refreshed", { description: "Demo feed ticked forward." }); }}
                className="inline-flex items-center gap-1.5 rounded border border-[#333] bg-[#111] px-2 py-1 font-mono text-[9px] font-semibold text-[#d7d7d7] transition-colors hover:bg-[#1a1a1a]">
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </span>
          </div>

          <div className="flex flex-wrap items-end gap-x-3 gap-y-1 px-2 py-1.5">
            <div>
              <p className="font-mono text-lg font-bold leading-none text-white" data-testid="terminal-price">{fx(px)}</p>
              <p className={`mt-0.5 font-mono text-[10px] font-bold ${up ? "text-green-400" : "text-red-400"}`} data-testid="terminal-change">
                {up ? "▲" : "▼"} {fx(Math.abs((px * chgNum) / 100))} ({index.chg})
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-4 lg:grid-cols-7">
              {hdrStats.map((s) => (
                <div key={s.l}>
                  <p className="font-mono text-[8px] uppercase tracking-wider text-[#777]">{s.l}</p>
                  <p className="font-mono text-[10px] font-semibold text-[#e5e5e5]">{s.v}</p>
                </div>
              ))}
            </div>
            <button data-testid="terminal-signal-button"
              onClick={() => setSignalFor({ name: indexName, px: index.px, chg: index.chg })}
              className={`ml-auto inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-wider text-white transition-all active:scale-95 ${idxSig.buy ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500"}`}>
              <Zap className="h-3 w-3" /> Signal · {idxSig.dir}
            </button>
          </div>

          <nav className="flex flex-wrap items-center gap-1 border-t border-[#262626] px-2 py-0.5">
            {NAV_TABS.map((t) => (
              <button key={t} data-testid={`nav-tab-${slug(t)}`} onClick={() => setNavTab(t)}
                className={`rounded px-2 py-0.5 font-mono text-[9px] font-semibold transition-colors ${navTab === t ? "bg-[#1a1a1a] text-amber-400 shadow-[inset_0_-2px_0_#F5A623]" : "text-[#999] hover:text-white"}`}>
                {t}
              </button>
            ))}
            <select data-testid="currency-selector" value={currency} onChange={(e) => setCurrency(e.target.value)}
              className="ml-auto rounded border border-[#333] bg-[#050505] px-2 py-1 font-mono text-[9px] font-bold text-[#d7d7d7] outline-none">
              <option value="INR">INR ₹</option>
              <option value="USD">USD $</option>
            </select>
            <button data-testid="terminal-settings" onClick={() => toast.info("Terminal settings — demo control")}
              className="inline-flex items-center gap-1 rounded border border-[#333] bg-[#111] px-2 py-1 font-mono text-[9px] font-semibold text-[#d7d7d7] hover:bg-[#1a1a1a]">
              <Settings className="h-3 w-3" /> Settings
            </button>
          </nav>
        </section>
        {/* 9. OPTION INTELLIGENCE */}
        <TermPanel title={`Option Intelligence — ${indexName}`} id="oiintel-panel" collapsed={collapsed.oiintel} onToggle={() => togglePanel("oiintel")}
          right={<span className="font-mono text-[9px] text-[#777]">DEMO DATA</span>}>
          <div className="grid grid-cols-3 gap-px bg-[#1c1c1c]">
            {[
              ["Call OI", `${derived.totalCall.toFixed(1)}L`, "text-rose-400"],
              ["Put OI", `${derived.totalPut.toFixed(1)}L`, "text-signal"],
              ["PCR", derived.pcr.toFixed(2), derived.pcr >= 1 ? "text-signal" : "text-rose-400"],
              ["Call OI Chg", `${derived.oi.reduce((a, r) => a + r.callChg, 0) > 0 ? "+" : ""}${(derived.oi.reduce((a, r) => a + r.callChg, 0) / 100).toFixed(1)}L`, "text-white"],
              ["Put OI Chg", `${derived.oi.reduce((a, r) => a + r.putChg, 0) > 0 ? "+" : ""}${(derived.oi.reduce((a, r) => a + r.putChg, 0) / 100).toFixed(1)}L`, "text-white"],
              ["Max Call OI", derived.maxCall.strike.toLocaleString("en-IN"), "text-rose-400"],
              ["Max Put OI", derived.maxPut.strike.toLocaleString("en-IN"), "text-signal"],
              ["ATM", OI_SPOT.toLocaleString("en-IN"), "text-amber-400"],
              ["Support / Resistance", `${derived.maxPut.strike.toLocaleString("en-IN")} / ${derived.maxCall.strike.toLocaleString("en-IN")}`, "text-white"],
            ].map(([l, v, t]) => (
              <div key={l} className="bg-[#080808]"><StatMini l={l} v={v} tone={t} /></div>
            ))}
          </div>
        </TermPanel>
        {/* 8. INDEX PERFORMANCE */}
        <TermPanel title="Index Performance" id="idxperf-panel" collapsed={collapsed.idxperf} onToggle={() => togglePanel("idxperf")}>
          <table className="w-full font-mono text-[10px]">
            <tbody>
              {INDEX_NAMES.map((n) => {
                const ix = INDICES[n];
                const ixUp = ix.chg.startsWith("+");
                return (
                  <tr key={n} data-testid={`idxperf-${slug(n)}`} onClick={() => { setIndexName(n); setSectorFilter(null); }}
                    className={`cursor-pointer border-b border-[#1c1c1c] hover:bg-white/[0.05] ${n === indexName ? "bg-amber-400/5" : ""}`}>
                    <td className={`px-2.5 py-1 font-bold ${n === indexName ? "text-amber-400" : "text-white"}`}>{n}</td>
                    <td className="px-2.5 py-1 text-right text-[#e5e5e5]">{ix.px}</td>
                    <td className={`px-2.5 py-1 text-right ${ixUp ? "text-green-400" : "text-red-400"}`}>
                      {((parseFloat(ix.px.replace(/,/g, "")) * parseFloat(ix.chg)) / 100).toFixed(2)}
                    </td>
                    <td className={`px-2.5 py-1 text-right font-bold ${ixUp ? "text-green-400" : "text-red-400"}`}>{ix.chg}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TermPanel>
        </div>



        {/* 2. MARKET BREADTH */}
        <TermPanel title="Market Breadth" id="breadth-panel" collapsed={collapsed.breadth} onToggle={() => togglePanel("breadth")} right={refreshBtn}>
          <div className="grid grid-cols-4 gap-px bg-[#1c1c1c] sm:grid-cols-8">
            {[
              ["Advance", derived.advances.length, "text-green-400"],
              ["Decline", derived.declines.length, "text-red-400"],
              ["Unchanged", derived.unchanged.length, "text-[#999]"],
              ["A/D Ratio", derived.breadth.adRatio, "text-white"],
              ["52W High", derived.breadth.hi52n, "text-green-400"],
              ["52W Low", derived.breadth.lo52n, "text-red-400"],
              ["Up Volume", `${derived.breadth.upVolPct}%`, "text-green-400"],
              ["Down Volume", `${derived.breadth.downVolPct}%`, "text-red-400"],
            ].map(([l, v, t]) => (
              <div key={l} className="bg-[#080808]"><StatMini l={l} v={v} tone={t} /></div>
            ))}
          </div>
          <div className="flex h-1.5" data-testid="breadth-bar">
            <div className="bg-green-500 transition-all duration-500" style={{ width: `${(derived.advances.length / stocks.length) * 100}%` }} />
            <div className="bg-red-500 transition-all duration-500" style={{ width: `${(derived.declines.length / stocks.length) * 100}%` }} />
            <div className="bg-[#444]" style={{ width: `${(derived.unchanged.length / stocks.length) * 100}%` }} />
          </div>
        </TermPanel>

        {/* 3. ADVANCE / DECLINE / UNCHANGED */}
        <section className="overflow-hidden rounded-md border border-[#262626] bg-[#080808]" data-testid="constituent-board">
          <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#262626] bg-[#0d0d0d] px-2.5 py-1">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-amber-400">{indexName} · Constituents</span>
            <span className="font-mono text-[9px] text-[#777]" data-testid="constituent-count">{visibleStocks.length}{sectorFilter ? ` / ${stocks.length}` : ""} shown</span>
            {sectorFilter && (
              <button data-testid="sector-filter-clear" onClick={() => setSectorFilter(null)}
                className="rounded bg-amber-400/10 px-2 py-0.5 font-mono text-[9px] font-bold text-amber-400 hover:bg-amber-400/20">
                {sectorFilter} ✕
              </button>
            )}
            <span className="ml-auto flex items-center gap-1.5">{refreshBtn}<MinBtn id="min-board" collapsed={collapsed.board} onClick={() => togglePanel("board")} dark /></span>
          </header>
          <Collapse open={!collapsed.board}>
            <div className="max-h-[300px] overflow-y-auto p-2" data-lenis-prevent>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <BoardGroup label="Advance" list={visibleStocks.filter((s) => s.chgPct > 0)} tone="up" />
                <BoardGroup label="Decline" list={visibleStocks.filter((s) => s.chgPct < 0)} tone="down" />
              </div>
              {visibleStocks.some((s) => s.chgPct === 0) && (
                <div className="mt-3"><BoardGroup label="Unchanged" list={visibleStocks.filter((s) => s.chgPct === 0)} tone="flat" /></div>
              )}
            </div>
          </Collapse>
        </section>

        {/* 4. TOP GAINERS / TOP LOSERS */}
        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2" data-testid="movers-panels">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-green-400">Top Gainers</span>
              <span className="flex gap-1">
                {[5, 10, 20].map((n) => (
                  <button key={n} data-testid={`movers-count-${n}`} onClick={() => setGainerCount(n)}
                    className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${gainerCount === n ? "bg-amber-400 text-black" : "text-[#777] hover:text-white"}`}>
                    {n}
                  </button>
                ))}
                <MinBtn id="min-movers" collapsed={collapsed.movers} onClick={() => togglePanel("movers")} dark />
              </span>
            </div>
            <Collapse open={!collapsed.movers}>
              <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-1">
                <MoverTable title={`Top ${gainerCount} Gainers`} list={derived.gainers} tone="text-green-400" />
              </div>
            </Collapse>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-red-400">Top Losers</span>
            </div>
            <Collapse open={!collapsed.movers}>
              <MoverTable title={`Top ${gainerCount} Losers`} list={derived.losers} tone="text-red-400" />
            </Collapse>
          </div>
        </div>

        {/* 5. SECTOR HEATMAP */}
        <TermPanel title="Sector Performance" id="sectors-panel" collapsed={collapsed.sectors} onToggle={() => togglePanel("sectors")} right={refreshBtn}>
          <div className="grid grid-cols-3 gap-px bg-[#1c1c1c] sm:grid-cols-4 lg:grid-cols-6">
            {derived.sectors.map((s) => (
              <button key={s.sec} data-testid={`sector-${slug(s.sec)}`}
                onClick={() => setSectorFilter((f) => (f === s.sec ? null : s.sec))}
                className={`px-2 py-2 text-left transition-colors ${sectorFilter === s.sec ? "ring-1 ring-inset ring-amber-400" : ""} ${s.avg > 0 ? "bg-[#0d2b1a] hover:bg-[#123a24]" : s.avg < 0 ? "bg-[#3a0d12] hover:bg-[#4a1118]" : "bg-[#111] hover:bg-[#1a1a1a]"}`}>
                <p className="font-mono text-[8px] font-bold uppercase tracking-wider text-[#999]">{s.sec}</p>
                <p className={`font-mono text-[11px] font-bold ${s.avg > 0 ? "text-green-400" : s.avg < 0 ? "text-red-400" : "text-[#999]"}`}>
                  {s.avg >= 0 ? "+" : ""}{s.avg.toFixed(2)}%
                </p>
              </button>
            ))}
          </div>
        </TermPanel>

        {/* 6. VOLUME LEADERS + MARKET MOVERS */}
        <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-2">
          <TermPanel title="Volume Leaders" id="volume-panel" collapsed={collapsed.volmov} onToggle={() => togglePanel("volmov")}
            right={
              <span className="flex gap-1">
                {["Volume", "Value", "Trades"].map((t) => (
                  <button key={t} data-testid={`vol-tab-${slug(t)}`} onClick={() => setVolTab(t)}
                    className={`rounded px-2 py-0.5 font-mono text-[9px] font-semibold ${volTab === t ? "bg-amber-400 text-black" : "text-[#999] hover:text-white"}`}>
                    {t}
                  </button>
                ))}
              </span>
            }>
            <table className="w-full font-mono text-[10px]">
              <thead>
                <tr className="border-b border-[#262626] text-[#999]">
                  <th className="px-2 py-1 text-left font-semibold">Symbol</th>
                  <th className="px-2 py-1 text-right font-semibold">{volTab}</th>
                  <th className="px-2 py-1 text-right font-semibold">LTP</th>
                  <th className="px-2 py-1 text-right font-semibold">Chg%</th>
                  <th className="px-2 py-1 text-right font-semibold">Rel Vol</th>
                </tr>
              </thead>
              <tbody>
                {derived.volLeaders.map((s) => (
                  <tr key={s.sym} onClick={() => setDetailStock(s)} className="cursor-pointer border-b border-[#1c1c1c] hover:bg-white/[0.05]">
                    <td className="px-2 py-1 font-bold text-white">
                      {s.sym}
                      {s.relVol >= 1.8 && <span className="ml-1.5 rounded bg-amber-400/15 px-1 font-mono text-[8px] font-bold text-amber-400">HIGH VOL</span>}
                    </td>
                    <td className="px-2 py-1 text-right text-[#e5e5e5]">
                      {volTab === "Volume" ? `${s.volume}M` : volTab === "Value" ? `₹${(s.ltp * s.volume / 100).toFixed(0)}Cr` : `${(Number(s.volume) * 9000).toLocaleString("en-IN")}`}
                    </td>
                    <td className="px-2 py-1 text-right text-[#e5e5e5]">{Number(s.ltp).toLocaleString("en-IN")}</td>
                    <td className={`px-2 py-1 text-right font-bold ${s.chgPct >= 0 ? "text-green-400" : "text-red-400"}`}>{s.chgPct >= 0 ? "+" : ""}{s.chgPct.toFixed(2)}%</td>
                    <td className="px-2 py-1 text-right text-amber-400">{s.relVol}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TermPanel>

          <TermPanel title="Market Movers" id="movers2-panel" collapsed={collapsed.volmov} onToggle={() => togglePanel("volmov")}>
            <div className="grid grid-cols-2 gap-px bg-[#1c1c1c]">
              {[["52W High", derived.hi52, "text-green-400"], ["52W Low", derived.lo52, "text-red-400"],
                ["Unusual Volume", derived.unusual, "text-amber-400"], ["Most Active", derived.active, "text-white"]].map(([label, list, tone]) => (
                <div key={label} className="bg-[#080808] p-2">
                  <p className={`mb-1 font-mono text-[8px] font-bold uppercase tracking-wider ${tone}`}>{label}</p>
                  {list.map((s) => (
                    <button key={s.sym} onClick={() => setDetailStock(s)}
                      className="flex w-full items-center justify-between rounded px-1 py-0.5 font-mono text-[10px] transition-colors hover:bg-white/[0.05]">
                      <span className="font-bold text-[#e5e5e5]">{s.sym}</span>
                      <span className="text-[#888]">
                        {label === "Unusual Volume" ? `${s.relVol}x avg vol` : `${s.chgPct >= 0 ? "+" : ""}${s.chgPct.toFixed(2)}%`}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </TermPanel>
        </div>

        {/* 7. INTRADAY CHART */}
        <TermPanel title={`${indexName} Intraday`} id="chart-panel" collapsed={collapsed.chart} onToggle={() => togglePanel("chart")}
          right={
            <span className="flex items-center gap-1">
              {["1D", "5D", "1M", "3M", "6M", "1Y"].map((r) => (
                <button key={r} data-testid={`chart-range-${r.toLowerCase()}`} onClick={() => setChartRange(r)}
                  className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${chartRange === r ? "bg-amber-400 text-black" : "text-[#777] hover:text-white"}`}>
                  {r}
                </button>
              ))}
              <span className="mx-1 h-3 w-px bg-[#333]" />
              {["Area", "Line", "Candle"].map((t) => (
                <button key={t} data-testid={`chart-type-${t.toLowerCase()}`} onClick={() => setChartType(t)}
                  className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${chartType === t ? "bg-[#1a1a1a] text-amber-400" : "text-[#777] hover:text-white"}`}>
                  {t}
                </button>
              ))}
            </span>
          }>
          <div className="p-2">
            <div className="h-28">
              {chartType === "Candle" ? (
                <CandleChart className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "Area" ? (
                    <AreaChart data={chart} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                      <XAxis dataKey="t" tick={{ fontSize: 8, fill: "#777", fontFamily: "monospace" }} tickLine={false} axisLine={false} minTickGap={50} />
                      <YAxis hide domain={["dataMin", "dataMax"]} />
                      <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", fontSize: 10, fontFamily: "monospace" }} />
                      <Area type="monotone" dataKey="v" stroke="#F5A623" fill="#F5A62318" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </AreaChart>
                  ) : (
                    <LineChart data={chart} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                      <XAxis dataKey="t" tick={{ fontSize: 8, fill: "#777", fontFamily: "monospace" }} tickLine={false} axisLine={false} minTickGap={50} />
                      <YAxis hide domain={["dataMin", "dataMax"]} />
                      <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", fontSize: 10, fontFamily: "monospace" }} />
                      <Line type="monotone" dataKey="v" stroke="#F5A623" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-1 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} margin={{ top: 0, right: 4, left: 4, bottom: 0 }}>
                  <Bar dataKey="vol" fill="#2a2a2a" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TermPanel>



        {/* 10. OPTION CHAIN (existing) + 11. OI ACTIVITY */}
        <div className="grid grid-cols-1 items-start gap-1.5 xl:grid-cols-2">
          <OiChainCard tick={tick} onStrike={openStrike} collapsed={collapsed.oi} onToggle={() => togglePanel("oi")} />
          <TermPanel title="OI Activity" id="oiactivity-panel" collapsed={collapsed.oiactivity} onToggle={() => togglePanel("oiactivity")}>
            <table className="w-full font-mono text-[10px] [&_td]:border-r [&_td]:border-[#222] [&_td:last-child]:border-r-0 [&_th]:border-r [&_th]:border-[#222] [&_th:last-child]:border-r-0">
              <thead>
                <tr className="border-b border-[#262626] text-[#999]">
                  {["Strike", "Call OI", "Call Δ%", "Put OI", "Put Δ%", "Signal"].map((h) => (
                    <th key={h} className="px-2 py-1 text-center font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {derived.oi.map((r) => {
                  const flag = r.callChg > 20 ? ["Call OI Increase", "bg-rose-500/15 text-rose-400"]
                    : r.putChg > 20 ? ["Put OI Increase", "bg-signal/15 text-signal"]
                    : r.callChg < -40 ? ["Call Unwinding", "bg-signal/10 text-signal"]
                    : r.putChg < -40 ? ["Put Unwinding", "bg-rose-500/10 text-rose-400"]
                    : ["Neutral", "bg-white/5 text-[#888]"];
                  return (
                    <tr key={r.strike} onClick={() => openStrike(r.strike)} className="cursor-pointer border-b border-[#1c1c1c] hover:bg-white/[0.05]">
                      <td className="px-2 py-1 text-center font-bold text-white">{r.strike}</td>
                      <td className="px-2 py-1 text-center text-[#e5e5e5]">{r.callOi}</td>
                      <td className={`px-2 py-1 text-center font-bold ${r.callChg >= 0 ? "text-signal" : "text-rose-400"}`}>{r.callChg}%</td>
                      <td className="px-2 py-1 text-center text-[#e5e5e5]">{r.putOi}</td>
                      <td className={`px-2 py-1 text-center font-bold ${r.putChg >= 0 ? "text-signal" : "text-rose-400"}`}>{r.putChg}%</td>
                      <td className="px-2 py-1 text-center"><span className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase ${flag[1]}`}>{flag[0]}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TermPanel>
        </div>

        {/* 12. FII/DII + 13. SENTIMENT */}
        <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-2">
          <TermPanel title="FII / DII Activity" id="fiidii-panel" collapsed={collapsed.fiidii} onToggle={() => togglePanel("fiidii")}
            right={<span className="font-mono text-[9px] text-[#777]">DEMO DATA</span>}>
            <table className="w-full font-mono text-[10px]">
              <thead>
                <tr className="border-b border-[#262626] text-[#999]">
                  <th className="px-2.5 py-1 text-left font-semibold">₹ Cr</th>
                  <th className="px-2.5 py-1 text-right font-semibold">Today</th>
                  <th className="px-2.5 py-1 text-right font-semibold">Yesterday</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["FII Buy", 4820, 3960], ["FII Sell", 3910, 4420],
                  ["FII Net", 910, -460], ["DII Buy", 3240, 3510],
                  ["DII Sell", 2680, 2890], ["DII Net", 560, 620],
                ].map(([l, t, y]) => (
                  <tr key={l} className="border-b border-[#1c1c1c]">
                    <td className={`px-2.5 py-1 ${l.includes("Net") ? "font-bold text-amber-400" : "text-[#c9c9c9]"}`}>{l}</td>
                    <td className={`px-2.5 py-1 text-right font-bold ${l.includes("Net") ? (t >= 0 ? "text-green-400" : "text-red-400") : "text-[#e5e5e5]"}`}>
                      {l.includes("Net") && t >= 0 ? "+" : ""}{t.toLocaleString("en-IN")}
                    </td>
                    <td className={`px-2.5 py-1 text-right ${l.includes("Net") ? (y >= 0 ? "text-green-400" : "text-red-400") : "text-[#999]"}`}>
                      {l.includes("Net") && y >= 0 ? "+" : ""}{y.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TermPanel>

          <TermPanel title="Market Sentiment" id="sentiment-panel" collapsed={collapsed.sentiment} onToggle={() => togglePanel("sentiment")}
            right={<span className="font-mono text-[9px] text-[#777]">DEMO / DERIVED INDICATOR</span>}>
            <div className="p-2">
              <div className="flex items-baseline justify-between">
                <span className={`font-display text-2xl font-bold ${derived.sentiment >= 60 ? "text-green-400" : derived.sentiment >= 40 ? "text-amber-400" : "text-red-400"}`} data-testid="sentiment-score">
                  {derived.sentiment >= 60 ? "Bullish" : derived.sentiment >= 40 ? "Neutral" : "Bearish"}
                </span>
                <span className="font-mono text-lg font-bold text-white">{derived.sentiment} / 100</span>
              </div>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-[#1a1a1a]">
                <div className={`transition-all duration-700 ${derived.sentiment >= 60 ? "bg-green-500" : derived.sentiment >= 40 ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${derived.sentiment}%` }} />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[8px] uppercase tracking-wider text-[#777]">
                <span>Bearish</span><span>Neutral</span><span>Bullish</span>
              </div>
              <p className="mt-2 font-mono text-[9px] leading-relaxed text-[#777]">
                Derived from advance/decline ({derived.advances.length}/{derived.declines.length}), index move ({index.chg}), and PCR ({derived.pcr.toFixed(2)}). Simulated data.
              </p>
            </div>
          </TermPanel>
        </div>

        {/* 14. LIVE SIGNALS (existing) + WATCHLIST */}
        <div className="grid grid-cols-1 items-start gap-1.5 xl:grid-cols-3">
          <section className="overflow-hidden rounded-md border border-[#262626] bg-[#080808] xl:col-span-2" data-testid="instruments-panel">
            <header className="flex items-center justify-between gap-2 border-b border-[#262626] bg-[#0d0d0d] px-2 py-1">
              <span className="font-mono text-[13px] font-bold uppercase tracking-[0.06em] text-amber-400">Instruments · Live Signals</span>
              <MinBtn id="min-inst" collapsed={collapsed.inst} onClick={() => togglePanel("inst")} dark />
            </header>
            <Collapse open={!collapsed.inst}>
              <div className="grid max-h-[420px] grid-cols-1 gap-1 overflow-y-auto p-1 sm:grid-cols-2" data-lenis-prevent>
                {INSTRUMENTS.map((m) => {
                  const sig = buildSignal(m, tick, enabled);
                  return (
                    <div key={m.name} role="button" tabIndex={0} data-testid={`market-instrument-${slug(m.name)}`}
                      onClick={() => setDetailStock({ sym: m.name, name: m.name, ltp: m.px.replace(/,/g, ""), chgPct: parseFloat(m.chg), volume: "2.4", oi: "—" })}
                      onKeyDown={(e) => e.key === "Enter" && setDetailStock(m)}
                      className="group flex cursor-pointer items-center justify-between gap-2 rounded border border-[#262626] bg-[#0d0d0d] px-2 py-1 transition-colors hover:border-[#444]">
                      <span className="flex min-w-0 items-center gap-2">
                        <span data-testid={`market-light-${slug(m.name)}`}
                          className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors duration-500 ${sig.buy ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                          {sig.buy ? <TrendingUp className="h-3 w-3" strokeWidth={2.5} /> : <TrendingDown className="h-3 w-3" strokeWidth={2.5} />}
                          <span className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-[#080808] animate-pulse-dot ${sig.buy ? "bg-green-400" : "bg-red-400"}`} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[11px] font-bold uppercase tracking-wide text-[#c9c9c9]">{m.name}</span>
                          <span className="block font-mono text-[11px]">
                            <span className="font-semibold text-white">₹{m.px}</span>{" "}
                            <span className={`font-semibold ${m.chg.startsWith("+") ? "text-green-400" : "text-red-400"}`}>{m.chg}</span>
                          </span>
                        </span>
                      </span>
                      <button data-testid={`market-signal-${slug(m.name)}`}
                        onClick={(e) => { e.stopPropagation(); setSignalFor(m); }}
                        className="inline-flex shrink-0 items-center gap-1 rounded bg-[#1a1a1a] px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#999] transition-colors hover:bg-amber-400 hover:text-black">
                        <Zap className="h-3 w-3" /> Signal
                      </button>
                    </div>
                  );
                })}
              </div>
            </Collapse>
          </section>

          <TermPanel title="My Watchlist" id="watchlist-panel" collapsed={collapsed.watchlist} onToggle={() => togglePanel("watchlist")}
            right={<span className="font-mono text-[9px] text-[#777]">{watchlist.length} saved</span>}>
            {watchlist.length === 0 ? (
              <p className="px-3 py-2.5 font-mono text-[10px] text-[#777]">Star any constituent to pin it here. Saved locally.</p>
            ) : (
              <table className="w-full font-mono text-[10px]">
                <tbody>
                  {watchlist.map((w) => (
                    <tr key={w.sym} data-testid={`watchlist-${slug(w.sym)}`}
                      onClick={() => setDetailStock(stocks.find((s) => s.sym === w.sym) || { ...w, volume: "—" })}
                      className="cursor-pointer border-b border-[#1c1c1c] hover:bg-white/[0.05]">
                      <td className="px-2.5 py-1 font-bold text-white">
                        <Star className="mr-1 inline h-3 w-3 text-amber-400" fill="currentColor" />{w.sym}
                      </td>
                      <td className="px-2.5 py-1 text-right text-[#e5e5e5]">{Number(w.ltp).toLocaleString("en-IN")}</td>
                      <td className={`px-2.5 py-1 text-right font-bold ${w.chgPct >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {w.chgPct >= 0 ? "+" : ""}{Number(w.chgPct).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </TermPanel>
        </div>

        {/* 15. MARKET NEWS */}
        <TermPanel title="Market News" id="news-panel" collapsed={collapsed.news} onToggle={() => togglePanel("news")}
          right={
            <span className="flex gap-1">
              {NEWS_FILTERS.map((f) => (
                <button key={f} data-testid={`news-filter-${f.toLowerCase()}`} onClick={() => setNewsFilter(f)}
                  className={`rounded px-2 py-0.5 font-mono text-[9px] font-bold ${newsFilter === f ? "bg-amber-400 text-black" : "text-[#777] hover:text-white"}`}>
                  {f}
                </button>
              ))}
            </span>
          }>
          <div className="divide-y divide-[#1c1c1c]">
            {NEWS_ITEMS.filter((n) => newsFilter === "ALL" || n.tag === newsFilter).map((n, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-1 font-mono text-[10px]">
                <span className="text-[#777]">{n.t}</span>
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold text-[#999]">{n.tag}</span>
                <span className="font-bold text-amber-400/90">{n.sym}</span>
                <span className="text-[#d7d7d7]">{n.h}</span>
              </div>
            ))}
          </div>
          <p className="border-t border-[#262626] px-2 py-1 font-mono text-[9px] text-[#777]">Demo headlines — no real news feed connected.</p>
        </TermPanel>

        {/* 16. FINANCIAL FUNDAMENTALS */}
        <TermPanel title={`Financial Fundamentals — ${indexName}`} id="fund-panel" collapsed={collapsed.fund} onToggle={() => togglePanel("fund")}
          right={<span className="font-mono text-[9px] text-[#777]">{navTab} · {currency}</span>}>
          <table className="w-full min-w-[760px] text-left font-mono text-[10px]">
            <thead>
              <tr className="border-b border-[#262626] text-[#999]">
                <th className="px-2 py-1 text-left font-semibold">₹ Cr</th>
                {FY_COLS.map((c) => (
                  <th key={c} className={`px-2 py-1 text-center font-semibold ${c.includes("Est") || c.includes("LTM") ? "text-amber-400" : ""}`}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {funds.map((r, ri) => (
                <tr key={ri} className="border-b border-[#1c1c1c] transition-colors hover:bg-white/[0.03]">
                  <td className={`whitespace-nowrap px-2 py-0.5 ${r.key ? "font-bold text-amber-400" : "text-[#c9c9c9]"}`}>{r.label}</td>
                  {r.cells.map((c, ci) => (
                    <td key={ci} className={`px-2 py-0.5 text-right ${cellTone[c.tone]}`}>{c.t}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </TermPanel>

        {/* 17. ALTERNATIVE DATA */}
        <TermPanel title={`Alternative Data Metrics Summary — ${indexName}`} id="alt-panel" collapsed={collapsed.alt} onToggle={() => togglePanel("alt")}
          right={
            <span className="flex items-center gap-1">
              {ALT_TABS.map((t) => (
                <button key={t} data-testid={`alt-tab-${slug(t)}`} onClick={() => setAltTab(t)}
                  className={`rounded px-2 py-0.5 font-mono text-[9px] font-semibold transition-colors ${altTab === t ? "bg-amber-400 text-black" : "text-[#999] hover:text-white"}`}>
                  {t}
                </button>
              ))}
            </span>
          }>
          <table className="w-full min-w-[680px] text-left font-mono text-[10px]">
            <thead>
              <tr className="border-b border-[#262626] text-[#999]">
                <th className="px-2 py-1 font-semibold">Metric</th>
                {["91 Day", "28 Day", "7 Day"].map((c) => <th key={`l-${c}`} className="px-2 py-1 text-center font-semibold">{c}</th>)}
                {["91 Day", "28 Day", "7 Day"].map((c) => <th key={`g-${c}`} className="px-2 py-1 text-center font-semibold text-amber-400">{c} Δ</th>)}
              </tr>
            </thead>
            <tbody>
              {altRows.map((r) => (
                <tr key={r.m} className="border-b border-[#1c1c1c]">
                  <td className="whitespace-nowrap px-2 py-0.5 text-[#c9c9c9]">{r.m}</td>
                  {r.lvl.map((v, i) => <td key={i} className="px-2 py-0.5 text-right text-[#e5e5e5]">{v}</td>)}
                  {r.gr.map((g, i) => (
                    <td key={i} className={`px-2 py-0.5 text-right font-bold ${g >= 0 ? "bg-[#0d2b1a] text-green-400" : "bg-[#3a0d12] text-red-400"}`}>
                      {g >= 0 ? "+" : ""}{g.toFixed(1)}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </TermPanel>

        {/* 18. OBSERVED SALES YOY */}
        <TermPanel title="Observed Sales YoY Growth" id="sales-panel" collapsed={collapsed.sales} onToggle={() => togglePanel("sales")}
          right={
            <span className="flex items-center gap-1">
              {GROWTH_PERIODS.map((p) => (
                <button key={p} data-testid={`period-${p.toLowerCase()}`} onClick={() => setGrowthPeriod(p)}
                  className={`rounded px-2 py-0.5 font-mono text-[9px] font-bold transition-colors ${growthPeriod === p ? "bg-amber-400 text-black" : "text-[#999] hover:text-white"}`}>
                  {p}
                </button>
              ))}
            </span>
          }>
          <div className="flex flex-wrap items-center gap-3 border-b border-[#262626] px-2 py-1">
            {[
              { l: "Comp Source", v: compSource, set: setCompSource, opts: ["Analyst Curated (BI)", "Company Reported"], id: "comp-source" },
              { l: "Growth", v: growthType, set: setGrowthType, opts: ["Year-over-Year", "Quarter-over-Quarter"], id: "growth-type" },
              { l: "Period", v: periodicity, set: setPeriodicity, opts: ["Weekly", "Monthly"], id: "periodicity" },
            ].map((c) => (
              <label key={c.id} className="flex items-center gap-1.5 font-mono text-[9px] text-[#999]">
                {c.l}:
                <select data-testid={`sales-${c.id}`} value={c.v} onChange={(e) => c.set(e.target.value)}
                  className="rounded border border-[#333] bg-[#050505] px-2 py-0.5 font-semibold text-[#d7d7d7] outline-none">
                  {c.opts.map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
            ))}
            <span className="ml-auto font-mono text-[9px] text-[#777]">{growthPeriod} · {growthType} · {periodicity}</span>
          </div>
          <table className="w-full min-w-[900px] text-left font-mono text-[10px]">
            <thead>
              <tr className="border-b border-[#262626] text-[#999]">
                <th className="px-2 py-1 font-semibold">Week Ending</th>
                {SALES_WEEKS.map((w) => <th key={w} className="px-2 py-1.5 text-center font-semibold">{w}</th>)}
              </tr>
            </thead>
            <tbody>
              {SALES_ROWS.map((row, ri) => (
                <tr key={row} className="border-b border-[#1c1c1c]">
                  <td className={`whitespace-nowrap px-2 py-0.5 ${ri === 0 ? "font-bold text-amber-400" : "text-[#c9c9c9]"}`}>{row}</td>
                  {SALES_WEEKS.map((w) => {
                    const g = (mixHash(`sales-${row}-${w}-${growthPeriod}-${compSource}`) % 300 - 140) / 10;
                    return (
                      <td key={w} className={`px-2 py-1 text-right font-bold ${g >= 0 ? "bg-[#0d2b1a] text-green-400" : "bg-[#3a0d12] text-red-400"}`}>
                        {g >= 0 ? "+" : ""}{g.toFixed(1)}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </TermPanel>

        {/* SIGNAL HISTORY */}
        <section className="overflow-hidden rounded-md border border-[#262626] bg-[#080808]" data-testid="signal-history">
          <header className="flex items-center justify-between border-b border-[#262626] bg-[#0d0d0d] px-2.5 py-1">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-amber-400">Signal History</span>
            {history.length > 0 && (
              <button data-testid="signal-history-clear" onClick={() => setHistory([])}
                className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#777] transition-colors hover:text-red-400">
                Clear
              </button>
            )}
          </header>
          {history.length === 0 ? (
            <p className="px-3 py-2.5 font-mono text-[10px] text-[#777]">Open any Signal panel to log demo signals here.</p>
          ) : (
            <div className="divide-y divide-[#1c1c1c]">
              {history.map((h, i) => (
                <div key={`${h.time}-${i}`} data-testid={`signal-history-row-${i}`} className="flex items-center justify-between gap-3 px-2 py-1 font-mono text-[10px]">
                  <span className="text-[#777]">{h.time}</span>
                  <span className="font-bold text-[#e5e5e5]">{h.name}</span>
                  <span className={`rounded px-2 py-0.5 font-bold ${h.buy ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{h.dir}</span>
                  <span className="font-semibold text-[#999]">{h.confidence}%</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <SignalDrawer
        instrument={signalFor}
        tick={tick}
        live={live}
        onToggleLive={() => setLive((l) => !l)}
        enabled={enabled}
        onToggleIndicator={toggleIndicator}
        onRefresh={() => setTick((t) => t + 1)}
        onClose={() => setSignalFor(null)}
        onExecuteTrade={handleExecuteDemoTrade}
      />
      <StockDetailDrawer
        stock={detailStock}
        onClose={() => setDetailStock(null)}
        inWatch={detailStock ? watchSyms.includes(detailStock.sym) : false}
        onToggleWatch={toggleWatch}
      />
    </section>
  );
}
