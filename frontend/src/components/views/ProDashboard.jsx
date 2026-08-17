import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { portfolioOverview, pnlSeries } from '@/mock/mockPortfolioData';
import { holdings as mockHoldings } from '@/mock/mockHoldings';
import { trades as mockTrades } from '@/mock/mockTrades';
// replace mock market subscription with backend SmartAPI snapshot
const API = process.env.REACT_APP_BACKEND_URL || '';
import { indices as initialIndices, topGainers as initialGainers, topLosers as initialLosers } from '@/mock/mockMarketData';
import { defaultWatchlist as initialWatch } from '@/mock/mockWatchlist';
import { alerts as initialAlerts } from '@/mock/mockAlerts';

function Card({ title, value, mono, className = '', tone }) {
  return (
    <div className={`rounded-xl border border-edge bg-white p-3 ${className}`}>
      <p className="font-mono text-[10px] uppercase text-slate">{title}</p>
      <p className={`mt-2 font-mono ${mono ? 'font-bold text-lg' : 'text-ink'} ${tone === 'green' ? 'text-signal' : tone === 'red' ? 'text-rose-500' : ''}`}>{value}</p>
    </div>
  );
}

function MiniChart({ series = [], height = 56 }) {
  if (!series || series.length === 0) return <div style={{ height }} />;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = Math.max(1, max - min);
  const points = series.map((v, i) => {
    const x = (i / (series.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-14">
      <polyline fill="none" stroke="#10b981" strokeWidth="1.5" points={points} />
    </svg>
  );
}

export default function ProDashboard({ onModule, onBack }) {
  const [range, setRange] = useState('1M');
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const raw = localStorage.getItem('demo-watchlist');
      return raw ? JSON.parse(raw) : initialWatch;
    } catch (e) { return initialWatch; }
  });
  const [alerts, setAlerts] = useState(() => initialAlerts.slice());
  const [indices, setIndices] = useState(() => initialIndices.slice());
  const [topGainers, setTopGainers] = useState(() => initialGainers.slice());
  const [topLosers, setTopLosers] = useState(() => initialLosers.slice());
  const [isLive, setIsLive] = useState(false);
  const [marketStocks, setMarketStocks] = useState([]);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('symbol');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => { localStorage.setItem('demo-watchlist', JSON.stringify(watchlist)); }, [watchlist]);

  useEffect(() => {
    let dead = false;
    const fetchSnapshot = async () => {
      try {
        const res = await fetch(`${API}/api/market/snapshot?index=NIFTY%2050`);
        const j = await res.json();
        if (dead) return;
        if (j && j.live) {
          // indices is an object { name: {px, chg}, ... }
          setIsLive(true);
          const idxs = j.indices ? Object.keys(j.indices).map(k => ({ id: k, value: Number(String(j.indices[k].px).replace(/,/g, '')) , change: parseFloat(String(j.indices[k].chg).replace('%','')||0), changePct: parseFloat(String(j.indices[k].chg).replace('%','')||0) })) : [];
          setIndices(idxs);
          // stocks array: {sym, ltp, chgPct, volume}
          const stocks = Array.isArray(j.stocks) ? j.stocks.map(s => ({ symbol: s.sym, ltp: Number(s.ltp), changePct: Number(s.chgPct), name: s.name || s.sym })) : [];
          setMarketStocks(stocks);
          const sortedG = [...stocks].sort((a,b)=> b.changePct - a.changePct).slice(0,10).map(s=>({ symbol: s.symbol, changePct: s.changePct }));
          const sortedL = [...stocks].sort((a,b)=> a.changePct - b.changePct).slice(0,10).map(s=>({ symbol: s.symbol, changePct: s.changePct }));
          setTopGainers(sortedG);
          setTopLosers(sortedL);
        } else {
          // when not live, keep existing demo values
          setIsLive(false);
        }
      } catch (e) {
        // ignore and keep demo
      }
    };
    fetchSnapshot();
    const id = setInterval(fetchSnapshot, 4000);
    return () => { dead = true; clearInterval(id); };
  }, []);

  const holdings = useMemo(() => {
    return mockHoldings.map(h => {
      const invested = h.qty * h.avgPrice;
      const current = h.qty * h.ltp;
      const pnl = current - invested;
      const pnlPct = (pnl / invested) * 100;
      const dayChange = ((h.ltp - h.avgPrice) / h.avgPrice) * 100; // demo
      return { ...h, invested, current, pnl, pnlPct, dayChange };
    }).filter(h => h.symbol.includes(query.toUpperCase()) || h.company.toUpperCase().includes(query.toUpperCase()));
  }, [query]);

  const holdingsSorted = useMemo(() => {
    return [...holdings].sort((a,b)=>{
      const av = a[sortKey]; const bv = b[sortKey];
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [holdings, sortKey, sortDir]);

  function addWatch(sym) {
    if (watchlist.includes(sym)) return toast('Already in watchlist');
    setWatchlist(w => [sym, ...w]);
    toast.success('Added to watchlist');
  }
  function removeWatch(sym) {
    setWatchlist(w => w.filter(x => x !== sym));
    toast.success('Removed from watchlist');
  }

  const unreadCount = alerts.filter(a => a.unread).length;
  function markRead(id) {
    setAlerts(a => a.map(x => x.id === id ? { ...x, unread: false } : x));
  }
  function delAlert(id) { setAlerts(a => a.filter(x => x.id !== id)); }

  // Trading statistics from mockTrades
  const stats = useMemo(()=>{
    const total = mockTrades.length;
    const wins = mockTrades.filter(t=>t.pnl>0).length;
    const losses = mockTrades.filter(t=>t.pnl<=0).length;
    const winRate = total? Math.round((wins/total)*100):0;
    const avgProfit = wins? (mockTrades.filter(t=>t.pnl>0).reduce((s,t)=>s+t.pnl,0)/wins):0;
    const avgLoss = losses? (mockTrades.filter(t=>t.pnl<=0).reduce((s,t)=>s+t.pnl,0)/losses):0;
    const best = Math.max(...mockTrades.map(t=>t.pnl));
    const worst = Math.min(...mockTrades.map(t=>t.pnl));
    const profitFactor = Math.abs(avgProfit / (avgLoss || 1));
    return { total, wins, losses, winRate, avgProfit: avgProfit.toFixed(2), avgLoss: avgLoss.toFixed(2), best, worst, profitFactor: profitFactor.toFixed(2) };
  }, []);

  const risk = useMemo(()=>{
    const totalValue = portfolioOverview.totalValue || 1;
    const exposure = mockHoldings.reduce((s,h)=>s + h.qty * h.ltp,0);
    const equityPct = Math.round((exposure/totalValue)*100);
    const cashPct = Math.round((portfolioOverview.cash/totalValue)*100);
    const marginUsedPct = Math.round((portfolioOverview.marginUsed/totalValue)*100);
    return { exposure, equityPct, cashPct, marginUsedPct, availableMargin: portfolioOverview.availableMargin, riskLevel: exposure > totalValue*0.7 ? 'High' : exposure > totalValue*0.4 ? 'Medium' : 'Low' };
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Portfolio Value" value={`₹${portfolioOverview.totalValue.toLocaleString()}`} mono tone="dark" />
        <Card title="Invested Amount" value={`₹${portfolioOverview.invested.toLocaleString()}`} mono tone="dark" />
        <Card title="Available Cash" value={`₹${portfolioOverview.cash.toLocaleString()}`} mono tone="dark" />
        <Card title="Today's P&L" value={`₹${portfolioOverview.todayPnl.toLocaleString()}`} mono tone="green" />
        <Card title="Overall P&L" value={`₹${portfolioOverview.overallPnl.toLocaleString()}`} mono tone="green" />
        <Card title="Overall P&L %" value={`${portfolioOverview.overallPnlPercent}%`} mono tone="green" />
        <Card title="Margin Used" value={`₹${portfolioOverview.marginUsed.toLocaleString()}`} mono tone="dark" />
        <Card title="Available Margin" value={`₹${portfolioOverview.availableMargin.toLocaleString()}`} mono tone="dark" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border border-edge bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-bold">Portfolio P&L</p>
            <div className="flex items-center gap-2">
              {['1D','1W','1M','3M','6M','1Y','ALL'].map(r=> (
                <button key={r} onClick={()=>setRange(r)} className={`text-xs rounded-full px-2 py-1 ${range===r? 'bg-ember text-white': 'bg-mist'}`}>{r}</button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <MiniChart series={pnlSeries[range] || pnlSeries['1M']} />
          </div>
        </div>

        <div className="rounded-xl border border-edge bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-bold">Market Snapshot</p>
            <div className="text-xs">
              {isLive ? (
                <span className="rounded-full bg-signal/10 px-2 py-1 text-signal">Live</span>
              ) : (
                <span className="rounded-full bg-mist px-2 py-1 text-slate">Demo</span>
              )}
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {indices.map((idx)=> (
              <button key={idx.id} onClick={()=>onModule('market')} className="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-mist">
                <div>
                  <p className="font-mono text-sm font-semibold">{idx.id}</p>
                  <p className="text-xs text-slate">{idx.value.toLocaleString()}</p>
                </div>
                <div className={`font-mono text-sm ${idx.change>=0? 'text-signal':'text-rose-500'}`}>
                  <p>{idx.change>=0? '+'+idx.change: ''+idx.change}</p>
                  <p className="text-xs">{idx.changePct>=0? '+'+idx.changePct+'%': idx.changePct+'%'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border border-edge bg-white p-3 overflow-x-auto">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-bold">Live Holdings</p>
            <div className="flex items-center gap-2">
              <input placeholder="Search" value={query} onChange={(e)=>setQuery(e.target.value)} className="rounded border border-edge px-2 py-1 text-sm" />
              <select value={sortKey} onChange={(e)=>setSortKey(e.target.value)} className="rounded border border-edge px-2 py-1 text-sm">
                <option value="symbol">Symbol</option>
                <option value="current">Current Value</option>
                <option value="pnl">P&L</option>
              </select>
              <button onClick={()=>setSortDir(d=> d==='asc'?'desc':'asc')} className="rounded border border-edge px-2 py-1 text-sm">{sortDir}</button>
            </div>
          </div>

          <table className="w-full mt-3 table-auto text-sm">
            <thead>
              <tr className="text-left text-xs text-slate">
                <th className="px-2 py-1">Symbol</th>
                <th className="px-2 py-1">Company</th>
                <th className="px-2 py-1">Qty</th>
                <th className="px-2 py-1">Avg</th>
                <th className="px-2 py-1">LTP</th>
                <th className="px-2 py-1">Invested</th>
                <th className="px-2 py-1">Current</th>
                <th className="px-2 py-1">P&L</th>
                <th className="px-2 py-1">P&L %</th>
              </tr>
            </thead>
            <tbody>
              {holdingsSorted.map(h=> (
                <tr key={h.symbol} className="border-t border-edge last:border-b-0">
                  <td className="px-2 py-2 font-mono font-bold">{h.symbol}</td>
                  <td className="px-2 py-2 text-xs text-slate">{h.company}</td>
                  <td className="px-2 py-2">{h.qty}</td>
                  <td className="px-2 py-2 font-mono">{h.avgPrice}</td>
                  <td className="px-2 py-2 font-mono">{h.ltp}</td>
                  <td className="px-2 py-2 font-mono">₹{h.invested.toLocaleString()}</td>
                  <td className="px-2 py-2 font-mono">₹{h.current.toLocaleString()}</td>
                  <td className={`px-2 py-2 font-mono ${h.pnl>=0? 'text-signal':'text-rose-500'}`}>₹{h.pnl.toFixed(2)}</td>
                  <td className={`px-2 py-2 font-mono ${h.pnlPct>=0? 'text-signal':'text-rose-500'}`}>{h.pnlPct.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-edge bg-white p-3">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-bold">Watchlist</p>
            <button onClick={()=>{ const s = prompt('Add symbol (e.g. RELIANCE)'); if(s) addWatch(s.toUpperCase()); }} className="text-xs rounded-full bg-ember px-2 py-1 text-white">Add</button>
          </div>
          <div className="mt-3 space-y-2">
            {watchlist.map(sym=> (
              <div key={sym} className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-mist">
                <div className="flex items-center gap-2">
                  <div className="font-mono font-bold">{sym}</div>
                  <div className="text-xs text-slate">₹{(marketStocks.find(ms=>ms.symbol===sym)?.ltp ? marketStocks.find(ms=>ms.symbol===sym).ltp.toFixed(2) : (Math.random()*3000+100).toFixed(2))}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>onModule('market')} className="text-xs px-2 py-1">Open</button>
                  <button onClick={()=>removeWatch(sym)} className="text-xs px-2 py-1 text-rose-500">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-edge bg-white p-3">
          <p className="font-display text-sm font-bold">Open Positions</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate">
                  <th className="px-2 py-1">Sym</th>
                  <th className="px-2 py-1">Buy/Sell</th>
                  <th className="px-2 py-1">Qty</th>
                  <th className="px-2 py-1">Entry</th>
                  <th className="px-2 py-1">LTP</th>
                  <th className="px-2 py-1">P&L</th>
                  <th className="px-2 py-1">SL</th>
                  <th className="px-2 py-1">Tgt</th>
                  <th className="px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockTrades.map(t=> (
                  <tr key={t.id} className="border-t border-edge">
                    <td className="px-2 py-2 font-mono font-bold">{t.symbol}</td>
                    <td className={`px-2 py-2 font-mono ${t.side==='BUY'? 'text-signal':'text-rose-500'}`}>{t.side}</td>
                    <td className="px-2 py-2">{t.qty}</td>
                    <td className="px-2 py-2">{t.price}</td>
                    <td className="px-2 py-2">{(Math.random()*3000+100).toFixed(2)}</td>
                    <td className={`px-2 py-2 ${t.pnl>=0? 'text-signal':'text-rose-500'}`}>₹{t.pnl}</td>
                    <td className="px-2 py-2">-</td>
                    <td className="px-2 py-2">-</td>
                    <td className="px-2 py-2">
                      <button onClick={()=>toast('Modify simulated')} className="text-xs px-2 py-1">Modify</button>
                      <button onClick={()=>toast.success('Exited simulated position')} className="text-xs px-2 py-1">Exit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-edge bg-white p-3">
          <p className="font-display text-sm font-bold">Top Gainers</p>
          <div className="mt-2 space-y-2">
            {topGainers.map(g=> (
              <div key={g.symbol} className="flex items-center justify-between px-2 py-1 hover:bg-mist">
                <div className="font-mono font-bold">{g.symbol}</div>
                <div className="text-sm text-signal">{g.changePct}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-edge bg-white p-3">
          <p className="font-display text-sm font-bold">Top Losers</p>
          <div className="mt-2 space-y-2">
            {topLosers.map(g=> (
              <div key={g.symbol} className="flex items-center justify-between px-2 py-1 hover:bg-mist">
                <div className="font-mono font-bold">{g.symbol}</div>
                <div className="text-sm text-rose-500">{g.changePct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-edge bg-white p-3">
          <p className="font-display text-sm font-bold">Trading Statistics</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>Total Trades: <b>{stats.total}</b></div>
            <div>Winning Trades: <b>{stats.wins}</b></div>
            <div>Losing Trades: <b>{stats.losses}</b></div>
            <div>Win Rate: <b>{stats.winRate}%</b></div>
            <div>Avg Profit: <b>₹{stats.avgProfit}</b></div>
            <div>Avg Loss: <b>₹{stats.avgLoss}</b></div>
            <div>Profit Factor: <b>{stats.profitFactor}</b></div>
            <div>Best/Worst: <b>₹{stats.best}/{stats.worst}</b></div>
          </div>
        </div>

        <div className="rounded-xl border border-edge bg-white p-3">
          <p className="font-display text-sm font-bold">Risk & Exposure</p>
          <div className="mt-3 space-y-2 text-sm">
            <div>Total Exposure: <b>₹{risk.exposure.toLocaleString()}</b></div>
            <div>Equity Exposure: <b>{risk.equityPct}%</b></div>
            <div>Cash: <b>{risk.cashPct}%</b></div>
            <div>Margin Used: <b>{risk.marginUsedPct}%</b></div>
            <div>Available Margin: <b>₹{risk.availableMargin.toLocaleString()}</b></div>
            <div>Portfolio Risk Level: <b>{risk.riskLevel}</b></div>
            <div className="mt-2 h-3 w-full rounded-full bg-edge">
              <div className="h-full rounded-full bg-ember" style={{ width: `${risk.marginUsedPct}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-edge bg-white p-3">
          <p className="font-display text-sm font-bold">AI Market Insights</p>
          <div className="mt-3 text-sm space-y-1">
            <div>Market Sentiment: <b>Neutral</b></div>
            <div>NIFTY Trend: <b>Short-term Bullish</b></div>
            <div>Sector Strength: <b>Financials, IT</b></div>
            <div>Advance/Decline: <b>1.2 / 0.8</b></div>
            <div>Risk Level: <b>Moderate</b></div>
            <div className="mt-2 text-xs text-slate">Note: This is simulated demo insight.</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-edge bg-white p-3">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-bold">Alerts Center</p>
            <div className="font-mono text-sm">Unread: <b>{unreadCount}</b></div>
          </div>
          <div className="mt-3 space-y-2">
            {alerts.map(a=> (
              <div key={a.id} className={`flex items-center justify-between rounded-md px-2 py-1 ${a.unread? 'bg-mist':''}`}>
                <div>
                  <div className="font-mono font-bold">{a.type}</div>
                  <div className="text-xs text-slate">{a.text}</div>
                </div>
                <div className="flex items-center gap-2">
                  {a.unread && <button onClick={()=>markRead(a.id)} className="text-xs px-2">Mark</button>}
                  <button onClick={()=>delAlert(a.id)} className="text-xs px-2 text-rose-500">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-edge bg-white p-3">
          <p className="font-display text-sm font-bold">Recent Trades</p>
          <div className="mt-3 space-y-2 text-sm">
            {mockTrades.slice(0,5).map(t=> (
              <div key={t.id} className="flex items-center justify-between border-b border-edge pb-2">
                <div className="flex items-center gap-2">
                  <div className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${t.side==='BUY'? 'bg-signal/10 text-signal':'bg-rose-500/10 text-rose-500'}`}>{t.side}</div>
                  <div className="font-mono font-bold">{t.symbol}</div>
                  <div className="text-xs text-slate">x{t.qty}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-mono">₹{t.price}</div>
                  <div className={`font-mono ${t.pnl>=0? 'text-signal':'text-rose-500'}`}>₹{t.pnl}</div>
                </div>
              </div>
            ))}
            <div className="mt-2 text-center"><button onClick={()=>onModule('transactions')} className="text-xs px-3 py-1 rounded-full bg-ember text-white">View All</button></div>
          </div>
          <div className="mt-3">
            <div className="grid grid-cols-3 gap-2">
              <button onClick={()=>toast('Add Funds simulated')} className="rounded-full bg-ember px-3 py-2 text-white text-sm">Add Funds</button>
              <button onClick={()=>toast('Withdraw simulated')} className="rounded-full bg-mist px-3 py-2 text-sm">Withdraw</button>
              <button onClick={()=>toast('Place Order simulated')} className="rounded-full bg-mist px-3 py-2 text-sm">Place Order</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
