import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { toast } from "sonner";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/landing/Navbar";
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
import UserPanel from "@/components/panel/UserPanel";
import AuthModal from "@/components/auth/AuthModal";
import { AuthProvider, useAuth, friendlyAuthError } from "@/auth/AuthContext";
import { scrollToSection } from "@/lib/scroll";
import { Loader2 } from "lucide-react";

function AuthCallback({ onDone }) {
  const { exchangeGoogleSession } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const sid = window.location.hash.split("session_id=")[1]?.split("&")[0];
    if (!sid) { onDone(false); return; }
    exchangeGoogleSession(sid)
      .then((user) => {
        window.history.replaceState(null, "", window.location.pathname);
        toast.success(`Welcome, ${user.name}`);
        onDone(true);
      })
      .catch((err) => {
        window.history.replaceState(null, "", window.location.pathname);
        toast.error(friendlyAuthError(err));
        onDone(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper" data-testid="auth-callback">
      <Loader2 className="h-8 w-8 animate-spin text-ember" />
      <p className="font-mono text-xs uppercase tracking-widest text-slate">Signing you in securely…</p>
    </div>
  );
}

function AppInner({ startInPanel = false }) {
  const { user } = useAuth();
  const [cta, setCta] = useState({ open: false, mode: "signup" });
  const [view, setView] = useState(startInPanel ? "panel" : "website");
  const openCta = (mode = "signup") => {
    if (user) {
      // already signed in — CTAs go straight to the panel
      setView("panel");
      window.__lenis?.scrollTo(0, { immediate: true });
      return;
    }
    setCta({ open: true, mode });
  };

  const navigate = (v) => {
    if (v !== "website" && !user) {
      // panel is gated — sign in first
      setCta({ open: true, mode: "login" });
      return;
    }
    setView(v);
    window.__lenis?.scrollTo(0, { immediate: true });
  };

  const goSection = (id) => {
    if (view !== "website") {
      setView("website");
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
      {view === "website" ? (
        <>
          <Navbar onCta={openCta} onSection={goSection} onNavigate={navigate} />
          <main>
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
          </main>
          <Footer />
        </>
      ) : (
        <UserPanel module={view} onModule={navigate} onWebsite={() => navigate("website")} />
      )}
      <AuthModal
        open={cta.open}
        mode={cta.mode}
        onOpenChange={(open) => setCta((s) => ({ ...s, open }))}
        onAuth={() => {
          // auth just succeeded — enter directly (the gate's `user` state isn't flushed yet in this tick)
          setView("panel");
          window.__lenis?.scrollTo(0, { immediate: true });
        }}
      />
    </div>
  );
}

export default function App() {
  // Google OAuth return: session_id lives in the URL fragment and must be exchanged
  // before the main app (and its hooks) mount — this branch keeps hook order stable.
  const [oauth, setOauth] = useState(() => ({
    pending: window.location.hash?.includes("session_id="),
    ok: false,
  }));
  return (
    <AuthProvider>
      {oauth.pending ? (
        <AuthCallback onDone={(ok) => setOauth({ pending: false, ok })} />
      ) : (
        <AppInner startInPanel={oauth.ok} />
      )}
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}
