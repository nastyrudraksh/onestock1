import { useEffect, useState } from "react";
import Lenis from "lenis";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/landing/Sidebar";
import TopBar from "@/components/landing/TopBar";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import Marquee from "@/components/landing/Marquee";
import Services from "@/components/landing/Services";
import HowItWorks from "@/components/landing/HowItWorks";
import PlatformPreview from "@/components/landing/PlatformPreview";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import Analytics from "@/components/landing/Analytics";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import SignupDialog from "@/components/landing/SignupDialog";
import { BrokerView, WalletView, TransactionsView, SettingsView } from "@/components/views/ModuleViews";
import { scrollToSection } from "@/lib/scroll";

const CRUMBS = {
  home: "Dashboard",
  broker: "Broker Details",
  wallet: "Fund Wallet",
  transactions: "Transactions",
  settings: "Settings",
};

export default function App() {
  const [cta, setCta] = useState({ open: false, mode: "signup" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState("home");
  const openCta = (mode = "signup") => setCta({ open: true, mode });

  const navigate = (v) => {
    setView(v);
    window.__lenis?.scrollTo(0, { immediate: true });
  };

  const goSection = (id) => {
    if (view !== "home") {
      setView("home");
      setTimeout(() => scrollToSection(id), 150);
    } else {
      scrollToSection(id);
    }
  };

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <div className="App min-h-screen bg-paper text-ink font-sans" data-testid="app-root">
      <Sidebar
        onCta={openCta}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        view={view}
        onNavigate={navigate}
        onSection={goSection}
      />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <TopBar onMenu={() => setSidebarOpen(true)} crumb={CRUMBS[view]} />
        <main>
          {view === "home" && (
            <>
              <Hero onCta={openCta} />
              <Stats />
              <Marquee />
              <Services />
              <HowItWorks />
              <PlatformPreview onCta={openCta} />
              <WhyChooseUs />
              <Analytics />
              <Pricing onCta={openCta} />
              <Testimonials />
              <FAQ />
              <FinalCTA onCta={openCta} />
            </>
          )}
          {view === "broker" && <BrokerView onBack={() => navigate("home")} />}
          {view === "wallet" && <WalletView onBack={() => navigate("home")} />}
          {view === "transactions" && <TransactionsView onBack={() => navigate("home")} />}
          {view === "settings" && <SettingsView onBack={() => navigate("home")} />}
        </main>
        <Footer />
      </div>
      <SignupDialog
        open={cta.open}
        mode={cta.mode}
        onOpenChange={(open) => setCta((s) => ({ ...s, open }))}
      />
      <Toaster position="top-center" richColors />
    </div>
  );
}
