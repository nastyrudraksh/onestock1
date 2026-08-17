const BASE_INDICES = [
  { id: 'NIFTY 50', value: 23674.32, change: 84.56, changePct: 0.36 },
  { id: 'SENSEX', value: 78234.12, change: -120.45, changePct: -0.15 },
  { id: 'BANK NIFTY', value: 47212.55, change: 310.23, changePct: 0.66 },
  { id: 'FINNIFTY', value: 17845.8, change: -45.2, changePct: -0.25 },
  { id: 'NIFTY MIDCAP', value: 18234.67, change: 12.34, changePct: 0.07 },
];

const BASE_GAINERS = [
  { symbol: 'RELIANCE', price: 2435.5, changePct: 3.8, volume: 1245000 },
  { symbol: 'BHARTIARTL', price: 720.2, changePct: 2.9, volume: 980000 },
  { symbol: 'TATASTEEL', price: 112.1, changePct: 2.4, volume: 760000 },
];

const BASE_LOSERS = [
  { symbol: 'IOC', price: 120.3, changePct: -4.2, volume: 540000 },
  { symbol: 'ONGC', price: 86.5, changePct: -3.6, volume: 430000 },
  { symbol: 'BPCL', price: 438.9, changePct: -2.5, volume: 210000 },
];

function clone(o) { return JSON.parse(JSON.stringify(o)); }

function jitter(value, pct = 0.002) {
  const change = (Math.random() * 2 - 1) * pct * value;
  return +(value + change);
}

export function getSnapshot() {
  return {
    indices: clone(BASE_INDICES),
    topGainers: clone(BASE_GAINERS),
    topLosers: clone(BASE_LOSERS),
  };
}

export function subscribeMarkets(cb, interval = 4000) {
  let state = getSnapshot();
  // emit initial
  cb && cb(state);
  const id = setInterval(() => {
    // mutate state lightly
    state = {
      indices: state.indices.map(i => {
        const newVal = jitter(i.value, 0.002);
        const change = +(newVal - i.value).toFixed(2);
        const changePct = +((change / i.value) * 100).toFixed(2);
        return { ...i, value: +newVal.toFixed(2), change, changePct };
      }),
      topGainers: state.topGainers.map(g => ({ ...g, price: +jitter(g.price, 0.01).toFixed(2), changePct: +(g.changePct + (Math.random()*0.4-0.2)).toFixed(2) })),
      topLosers: state.topLosers.map(g => ({ ...g, price: +jitter(g.price, 0.01).toFixed(2), changePct: +(g.changePct + (Math.random()*0.4-0.2)).toFixed(2) })),
    };
    cb && cb(state);
  }, interval);
  return () => clearInterval(id);
}

// backward-compatible exports (initial snapshot)
const snap = getSnapshot();
export const indices = snap.indices;
export const topGainers = snap.topGainers;
export const topLosers = snap.topLosers;
