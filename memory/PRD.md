# OneStock — Fintech SaaS Homepage (PRD)

## Original Problem Statement
Build a modern, premium, responsive fintech and automated trading services homepage for a fictional brand "OneStock" (tagline: "Smarter Trading. Automated Decisions. Better Control.") covering: sticky navbar, hero with trading dashboard mockup, animated stats, 6 services, 3-step how-it-works, dark platform preview, why-choose-us, analytics split, 3-tier pricing (₹), testimonials, FAQ accordion, final CTA, footer with risk disclaimer. All data fictional; no real credentials; no profit guarantees.

## Architecture
- Frontend-only React SPA (CRA + craco), Tailwind CSS, framer-motion, lenis (smooth scroll), recharts (fictional charts), lucide-react icons, shadcn/ui (accordion, dialog, sonner).
- Backend: unchanged FastAPI template (no API needed for this landing page).
- Fonts: Cabinet Grotesk (display), Manrope (body), JetBrains Mono (numbers/tickers).
- Design tokens: paper #FBFBFC, ink #0A0F1C, panel #131C2F, ember #F05D23 (CTAs), signal #00D084 (positive finance).

## User Personas
- Active retail trader evaluating automation platforms
- Portfolio manager assessing risk/monitoring tooling
- Fintech-curious visitor comparing plans

## Implemented (2026-08-13)
- App now boots into a USER PANEL (default view): left sidebar (Dashboard, Broker Details, Fund Wallet, Transactions, Settings + View Website / Logout), NOT LIVE status card with live progress tied to Account Progress steps, sticky top bar (breadcrumb, wallet chip ₹4,250.00, Enabled badge, Demo User), mobile slide-in drawer
- Panel dashboard: Account Progress (4 steps — Select Broker, Activation Fee, Broker Validation, KYC Verification — with working "Complete step" button that advances progress and flips to LIVE at 4/4), Subscription card (Renew), Wallet card (Deposit Funds → wallet), Connected Broker card, 6 stat cards, Recent Trades with View All
- Market page in panel sidebar: instruments only — 18 selectable instruments with demo prices
- Monthly Plan page (own sidebar option): 5 pricing cards (Monthly ₹999 / Quarterly ₹2,499 MOST POPULAR / Half Yearly ₹4,499 / Yearly ₹7,999 / Life Time ₹19,999) in pricing-card format
- Tier page (own sidebar option): 5 tier cards (Regular / Premium MOST POPULAR / Separate Discussion / VIP / VVIP) in the same card format
- Algo Signal side drawer on Market page: every instrument has a "Signal" button opening a slide-in panel with test-model output — BUY CALL / BUY PUT direction, entry/target/stop-loss, animated confidence bar, 5 indicator readings (RSI, MACD, EMA cross, VWAP, Supertrend), Refresh (regenerates signal) and Execute Demo Trade buttons, with test-model disclaimer
- Live signal feed: blinking red/green lights on every instrument title (green = buy call, red = buy put) updating every 4s; Live Feed pause/resume toggle on Market page and inside the drawer (auto-refresh)
- Custom Algo Builder: toggleable indicator chips in the drawer — selected indicators drive the direction and confidence calculation
- Signal History Log on Market page: timestamped list (instrument, direction, confidence) of the last 8 generated signals with Clear button
- NIFTY 50 Stocks board on Market page: two-column Advance (green/bullish) | Decline (red/bearish) chart docked as a left rail beside the instruments grid; Advances/Declines counts and split summary bar; stacks above instruments on mobile
- Bug fix (2026-08-14): PanelViews.jsx was corrupted by an external process (injected MarketDashboard import + JSX fragments breaking PickCard/PlanView/TierView/NiftyStocksBoard) causing a build failure and blank preview; repaired corrupted JSX, removed rogue import, restored PlanView/TierView/NIFTY_STOCKS/NiftyStocksBoard; webpack compiles cleanly and all pages verified in browser
- COMPACT LAYOUT (2026-08-14): Market page top is a 3-box row — Market header (selector, price, OHLC, tabs, signal) | Option Intelligence | Index Performance; all panels further compressed (smaller fonts, tighter padding, shorter charts, capped list heights) for one-screen density; OI chain has column divider lines + Total Call/Put OI + Put−Call Diff strip Market section now lives in components/views/terminal.jsx (MarketView), importing shared pieces from PanelViews.jsx. Panels in spec order: terminal header (index selector ×12, price/OHLC stats, nav tabs, currency, settings, live, refresh), Market Breadth (A/D ratio, 52W high/low, up/down volume + split bar), Constituents board (Advance|Decline side-by-side + Unchanged, watchlist stars, sector filter), Top Gainers/Losers (5|10|20 toggle), Sector Performance heatmap (12 sectors, click-to-filter constituents), Volume Leaders (Volume/Value/Trades tabs, HIGH VOL badges) + Market Movers (52W high/low, unusual volume, most active), Index Intraday chart (1D-1Y ranges, Area/Line/Candle, volume bars), Index Performance table (click to switch index), Option Intelligence (totals, PCR, max call/put OI, ATM, support/resistance), existing OI option chain, OI Activity map (build-up/unwinding flags), FII/DII activity, Market Sentiment score (derived, labeled demo), Live Signals instruments + My Watchlist (localStorage-persisted), Market News (filterable), Financial Fundamentals, Alternative Data, Observed Sales YoY, Signal History. Stock Detail Drawer (right slide-in): Overview stats, Chart, Fundamentals, OI, News tabs + watchlist star. All panels minimize/expand + Minimize/Expand All. All data clearly labeled simulated/demo dark dense terminal header (instrument selector, Related Functions/Menu, big price + change, Volume/Bid/Ask/Open/High/Low/Value, Live toggle, Refresh, SIGNAL button, nav tabs ADJ/Key Stats/Highlights/GAAP Highlights/Financial Analysis/Annuals, INR/USD currency selector, Settings); Financial Fundamentals table (FY 2011-FY 2016 Est, 17 metric rows, amber key labels, green/red values, right-aligned); Alternative Data Metrics Summary (Inflection/KPI Correlation/Trend Analysis tabs, 7 KPI rows × 91/28/7-day levels + green/maroon growth cells); Observed Sales YoY Growth (Comp Source/Growth/Period selectors, 3M-Max period buttons, 12-week green/red cell table); existing panels preserved below (Nifty 50 stocks, OI chain with tabs/toggles/strike signals, Instruments signal cards, Signal History) — all panels minimize/expand, Minimize/Expand All retained
- Market page: responsive 3/2/1-column grid of Nifty 50 stocks (all 50, compact scrollable Advance/Decline list, auto counts) | OI option chain | Instruments cards; each panel has a minimize/expand button (Framer Motion collapse) plus page-level Minimize All / Expand All
- Alert colors: green toast for BUY CALL, red toast for BUY PUT; 3x blinking dots; two-tone beep on 90%+ strong signals
- Rebrand: TradeSense → OneStock across the whole app
- LIVE MARKET DATA (2026-08-17): Angel One SmartAPI integrated — backend /app/backend/market_data.py (SmartMarket: TOTP auto-login at startup, daily instrument-master download filtered+cached in Mongo smartapi_master with MASTER_V versioning, batched FULL quotes, real NIFTY option chain from NFO contracts with opnInterest×lotsize, index candles; TTL caches 4s quotes / 15s chain / 20s index / 60s candles; strike ÷100 master quirk fixed; lotsize read from master). Endpoints: /api/market/status|snapshot|option-chain|candles. Creds in backend/.env (SMARTAPI_*). Frontend terminal.jsx: useLiveMarket (4s snapshot polling, tri-state undefined=connecting/null=demo/object=live) + useLiveCandles; real data drives header price, constituents, breadth, gainers/losers, sectors, volume leaders, OI intelligence (real PCR!), sentiment, index performance (NIFTY 50/SENSEX/BANK NIFTY real), white OI chain card (LIVE NSE badge + expiry, real spot/strikes/OI), intraday chart candles. Badge data-testid="market-data-mode" shows Connecting → LIVE · Angel One SmartAPI (or Demo fallback). Demo fallback preserved on any failure. Known gaps: TATAMOTORS unresolved (renamed post-demerger, 49/50 constituents), 9 sector indices show mock index price (real stocks), IV column "—" for live rows, header Volume/Value still hash-derived, FII/DII+News+Fundamentals+Signals stay mocked. Regression: /app/backend/tests/test_market_live.py + test_reports/iteration_2.json (100% pass)
- TERMINAL DENSITY PASS (2026-08-14): all panels below the top row now live in one CSS grid (1-col mobile / 2-col md / 3-col xl) positioned via order classes (order-1…order-[19]) — rows: Breadth|Sectors|Sentiment, Constituents(span-2)|Top Gainers, Top Losers|Volume Leaders|Market Movers, Intraday chart(span-2)|FII-DII, OI Chain|OI Activity|Live Signals, News|Watchlist|Signal History; only the 3 wide tables (Fundamentals, Alternative Data, Sales YoY) stay full-width (user choice); old pair wrappers converted to display:contents so no empty grid slots anywhere
- OI OPTION CHAIN RESTYLE (2026-08-14, user chose to keep the white card): Put columns tinted light green (bg-[#00D084]/10, green bold headers), Call columns tinted rose (bg-rose-500/10, rose bold headers), column divider lines bolded (slate-400 everywhere + 2px slate-500 separators around the Strike column), header underline bolded, Total Call OI value rose / Total Put OI green / Put−Call Diff colored by sign, redundant "Market" column hidden by default (re-toggleable), table min-w 600px at 11px; OI Activity table dividers brightened (#3d3d3d); stat-grid hairlines (Option Intelligence, Breadth, Sectors, Movers) bumped to #333; TermPanel/OiChainCard accept className prop; Market News list capped at 380px with internal scroll
- Tested (test_reports/iteration_1.json): 100% frontend pass — layout packing at 1920px (no gaps/overlaps), OI colors/dividers/tabs/toggles, signal drawer from strike click, index switch, minimize/expand all, stock drawer, watchlist, chart render, mobile 390px stacking
- All module views interactive inside the panel: broker connect/disconnect, wallet quick-deposit with live balance update, transaction All/Buy/Sell filters, settings toggles + risk inputs + save toast
- Landing website preserved behind "View Website"; navbar Get Started opens the panel, Platform dropdown opens panel modules; demo amounts originalised (no values copied from user's reference)
- Sticky glassmorphism navbar with mobile hamburger, section scroll via Lenis
- Hero: masked line-by-line headline reveal, mouse-parallax 3D dashboard mockup (portfolio value, P&L, active trades, area + candlestick charts, buy/sell, activity), floating data pills, trust indicators
- Stats: animated counters (10K+ users, ₹50Cr+ volume, 99.9% uptime, 24/7 monitoring)
- Editorial ticker marquee (CSS animation)
- Services: 6 cards in asymmetrical bento grid with hover lift + icon color swap
- How It Works: 3 steps, animated connector line (horizontal desktop / vertical mobile)
- Platform Preview: dark section, full dashboard mockup (5 metrics, 12M growth chart, watchlist with B/S buttons, transactions, strategy status, risk indicator), glow backdrop
- Why Choose Us: 6 numbered advantages
- Analytics: split layout, growth chart, weekly P&L bars, win-rate donut, monthly performance bars
- Pricing: 3 tiers (₹999 / ₹2,499 MOST POPULAR / ₹4,999), demo-content disclaimer
- Testimonials: 3 fictional users with photos, offset grid
- FAQ: 8-item shadcn accordion
- Final CTA: dark section with kinetic outlined "TRADESENSE" backdrop
- Footer: 4 link columns, risk disclosure, © 2026
- CTA dialog (signup/login/contact modes) with success state + sonner toast; clearly labeled demo

## Backlog
- P0: none (page complete per brief)
- P1: Live Constituent Ticks — constituent prices tick with the 4-second live feed; Export Table CSV — download button on each terminal table for demo data; dedicated Services/About/Contact sub-pages, blog/insights section
- P2: OI Diff Alert — beep when the Put − Call OI difference flips sign; real auth + dashboard app behind Login, live market data integration, i18n

## Notes
- All financial data is MOCKED/fictional by design (prototype requirement).
