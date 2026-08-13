# TradeSense — Fintech SaaS Homepage (PRD)

## Original Problem Statement
Build a modern, premium, responsive fintech and automated trading services homepage for a fictional brand "TradeSense" (tagline: "Smarter Trading. Automated Decisions. Better Control.") covering: sticky navbar, hero with trading dashboard mockup, animated stats, 6 services, 3-step how-it-works, dark platform preview, why-choose-us, analytics split, 3-tier pricing (₹), testimonials, FAQ accordion, final CTA, footer with risk disclaimer. All data fictional; no real credentials; no profit guarantees.

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
- P1: dedicated Services/About/Contact sub-pages, blog/insights section
- P2: real auth + dashboard app behind Login, live market data integration, i18n

## Notes
- All financial data is MOCKED/fictional by design (prototype requirement).
