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
  const [sizes, setSizes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("market-dashboard-sizes")) || [33, 33, 34];
    } catch (e) {
      return [33, 33, 34];
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
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-bold">MARKET · {selectedIndex}</h3>
          <select value={selectedIndex} onChange={(e) => setSelectedIndex(e.target.value)}
            className="rounded border border-edge bg-white px-3 py-1 text-sm">
            {INDEX_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-full border border-edge bg-white px-3 py-1 text-sm">Refresh</button>
          <button className="rounded-full border border-edge bg-white px-3 py-1 text-sm">Live</button>
        </div>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <select onChange={(e) => addPanel(e.target.value)} defaultValue="" className="rounded border border-edge bg-white px-3 py-1 text-sm">
          <option value="">Add panel...</option>
          {ALL_PANELS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
        <button onClick={() => { setHidden({}); setMaximized(null); setPanels(ALL_PANELS); }} className="rounded-full border border-edge bg-white px-3 py-1 text-sm">Reset</button>
      </div>

      <PanelGroup direction="horizontal" onUpdate={({ sizes: s }) => setSizes(s)}>
        {panels.map((p, i) => {
          if (hidden[p.id]) return null;
          const Comp = components[p.key];
          return (
            <Panel key={p.id} defaultSize={sizes[i] ?? (100 / panels.length)}>
              <div className="m-3 rounded-2xl border border-edge bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="font-mono text-sm font-semibold">{p.label}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setMaximized(p.id)} className="rounded-full border border-edge bg-white px-2 py-1 text-xs">Max</button>
                    <button onClick={() => togglePanel(p.id)} className="rounded-full border border-edge bg-white px-2 py-1 text-xs">Min</button>
                    <button onClick={() => removePanel(p.id)} className="rounded-full border border-edge bg-white px-2 py-1 text-xs">Remove</button>
                  </div>
                </div>
                <div>
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
