import { useState, useEffect } from "react";
import { PanelGroup, Panel } from "react-resizable-panels";

export default function MarketDashboard({ tick, onStrike, components = {} }) {
  const INDEX_OPTIONS = [
    "NIFTY 50",
    "SENSEX",
    "BANK NIFTY",
    "NIFTY NEXT 50",
    "NIFTY MIDCAP 100",
    "NIFTY IT",
    "NIFTY AUTO",
    "NIFTY PHARMA",
    "NIFTY FMCG",
    "NIFTY METAL",
    "NIFTY REALTY",
    "NIFTY ENERGY",
  ];

  const [selectedIndex, setSelectedIndex] = useState("NIFTY 50");

  const ALL_PANELS = [
    { id: "stocks", label: "Nifty Stocks", key: "NiftyStocksBoard" },
    { id: "oiChain", label: "OI Chain", key: "OiChainCard" },
    { id: "oiChart", label: "OI Chart", key: "OiChart" },
  ];

  const [panels, setPanels] = useState(ALL_PANELS);
  const [hidden, setHidden] = useState({});
  const [maximized, setMaximized] = useState(null);
  const DEFAULT_SIZES = [28, 36, 36];
  const [sizes, setSizes] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("market-dashboard-sizes"));
      return Array.isArray(saved) && saved.length === 3 ? saved : DEFAULT_SIZES;
    } catch (e) {
      return DEFAULT_SIZES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("market-dashboard-sizes", JSON.stringify(sizes));
    } catch (e) {}
  }, [sizes]);

  const togglePanel = (id) => setHidden((h) => ({ ...h, [id]: !h[id] }));
  const removePanel = (id) => setPanels((p) => p.filter((x) => x.id !== id));
  const addPanel = (id) => {
    if (panels.find((p) => p.id === id)) return;
    const found = ALL_PANELS.find((p) => p.id === id);
    if (found) setPanels((p) => [...p, found]);
  };

    if (maximized) {
    const panel = panels.find((p) => p.id === maximized);
    const Comp = panel ? components[panel.key] : null;
    return (
      <div className="p-3">
        <div className="mb-3 flex gap-2">
          <button onClick={() => setMaximized(null)} className="rounded-full border border-edge bg-white px-3 py-1 text-sm">Restore</button>
          <button onClick={() => togglePanel(panel.id)} className="rounded-full border border-edge bg-white px-3 py-1 text-sm">Minimize</button>
        </div>
        {Comp ? <Comp tick={tick} onStrike={onStrike} selectedIndex={selectedIndex} /> : <div>Panel not available</div>}
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-1">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          <h3 className="font-display text-sm font-bold tracking-tight">MARKET · {selectedIndex}</h3>
          <select value={selectedIndex} onChange={(e) => setSelectedIndex(e.target.value)}
            className="rounded border border-edge bg-white px-2 py-1 text-xs">
            {INDEX_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-full border border-edge bg-white px-2 py-0.5 text-[10px]">Refresh</button>
          <button className="rounded-full border border-edge bg-white px-2 py-0.5 text-[10px]">Live</button>
        </div>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <select onChange={(e) => addPanel(e.target.value)} defaultValue="" className="rounded border border-edge bg-white px-2 py-1 text-xs">
          <option value="">Add panel...</option>
          {ALL_PANELS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
        <button onClick={() => { setHidden({}); setMaximized(null); setPanels(ALL_PANELS); }} className="rounded-full border border-edge bg-white px-2 py-0.5 text-[10px]">Reset</button>
      </div>

      <PanelGroup direction="horizontal" className="w-full min-w-0 overflow-hidden" onUpdate={({ sizes: s }) => setSizes(s)}>
        {panels.map((p, i) => {
          if (hidden[p.id]) return null;
          const Comp = components[p.key];
          return (
            <Panel
              key={p.id}
              defaultSize={sizes[i] ?? (100 / panels.length)}
              minSize={16}
              className="min-w-0"
            >
              <div className="m-0.5 min-w-0 overflow-hidden rounded-lg border border-edge bg-white p-1">
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <div className="font-mono text-[11px] font-semibold">{p.label}</div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setMaximized(p.id)} className="rounded-full border border-edge bg-white px-1 py-0.5 text-[9px]">Max</button>
                      <button onClick={() => togglePanel(p.id)} className="rounded-full border border-edge bg-white px-1 py-0.5 text-[9px]">Min</button>
                      <button onClick={() => removePanel(p.id)} className="rounded-full border border-edge bg-white px-1 py-0.5 text-[9px]">Remove</button>
                    </div>
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    {Comp ? <Comp tick={tick} onStrike={onStrike} selectedIndex={selectedIndex} /> : <div className="text-sm text-slate">Component not available</div>}
                  </div>
                </div>
            </Panel>
          );
        })}
      </PanelGroup>
    </div>
  );
}
