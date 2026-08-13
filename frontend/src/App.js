import { useEffect, useState } from "react";
import Lenis from "lenis";
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
import SignupDialog from "@/components/landing/SignupDialog";

export default function App() {
  const [cta, setCta] = useState({ open: false, mode: "signup" });
  const openCta = (mode = "signup") => setCta({ open: true, mode });

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
      <Navbar onCta={openCta} />
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
      <SignupDialog
        open={cta.open}
        mode={cta.mode}
        onOpenChange={(open) => setCta((s) => ({ ...s, open }))}
      />
      <Toaster position="top-center" richColors />
    </div>
  );
}
