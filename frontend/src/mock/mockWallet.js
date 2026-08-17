const KEY = "demo_wallet_balance";

export function getBalance() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return 4250.0;
    return parseFloat(raw);
  } catch (e) {
    return 4250.0;
  }
}

export function setBalance(val) {
  try {
    const v = Number(val) || 0;
    localStorage.setItem(KEY, String(v));
    // dispatch event for listeners
    try {
      const ev = new CustomEvent("wallet:updated", { detail: { balance: v } });
      window.dispatchEvent(ev);
    } catch (e) {}
    return v;
  } catch (e) {
    return val;
  }
}

export function addBalance(delta) {
  const cur = getBalance();
  const next = +(cur + Number(delta));
  return setBalance(next);
}

export default { getBalance, setBalance, addBalance };
